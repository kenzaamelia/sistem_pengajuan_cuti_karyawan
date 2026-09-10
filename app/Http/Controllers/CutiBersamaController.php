<?php

namespace App\Http\Controllers;

use App\Models\CutiBersamaParticipant;
use App\Models\CutiBersamaSchedule;
use App\Models\Departemen;
use App\Models\LeaveBalance;
use App\Models\LeaveLongBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CutiBersamaController extends Controller
{
    public function index(): Response
    {
        $jadwal = CutiBersamaSchedule::with('pembuat')
            ->withCount('participants')
            ->latest()
            ->paginate(10);

        return Inertia::render('CutiBersama/Index', [
            'jadwal' => $jadwal,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('CutiBersama/Create', [
            'departemens' => Departemen::all(['id', 'nama_departemen']),
            // Hanya karyawan pelaksana & karyawan pimpinan yang relevan untuk cuti
            // bersama (punya saldo cuti tahunan/panjang). SDM & General Manager
            // sengaja tidak dimasukkan.
            'karyawan' => User::karyawan()
                ->with('departemen:id,nama_departemen')
                ->get(['id', 'name', 'departemen_id']),
        ]);
    }

    // Simpan sebagai draft dulu, belum memotong saldo siapa pun
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_cuti_bersama' => ['required', 'string', 'max:255'],
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['exists:users,id'],
        ]);

        $jumlahHari = now()->parse($validated['tanggal_mulai'])
            ->diffInDays(now()->parse($validated['tanggal_selesai'])) + 1;

        $jadwal = CutiBersamaSchedule::create([
            'nama_cuti_bersama' => $validated['nama_cuti_bersama'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'jumlah_hari' => $jumlahHari,
            'status' => CutiBersamaSchedule::STATUS_DRAFT,
            'dibuat_oleh' => Auth::id(),
        ]);

        foreach ($validated['user_ids'] as $userId) {
            CutiBersamaParticipant::create([
                'cuti_bersama_id' => $jadwal->id,
                'user_id' => $userId,
                'status_potongan' => null, // baru terisi setelah publish
            ]);
        }

        return redirect()->route('cuti-bersama.index')
            ->with('success', 'Jadwal cuti bersama disimpan sebagai draft.');
    }

    // Publish: jalankan cascading deduction untuk semua peserta
    public function publish(CutiBersamaSchedule $cutiBersama): RedirectResponse
    {
        abort_if($cutiBersama->isPublished(), 409, 'Jadwal ini sudah dipublish sebelumnya.');

        DB::transaction(function () use ($cutiBersama) {
            $cutiBersama->load('participants.user');

            foreach ($cutiBersama->participants as $participant) {
                $this->prosesCascadingDeduction($participant, $cutiBersama);
            }

            $cutiBersama->update(['status' => CutiBersamaSchedule::STATUS_PUBLISHED]);
        });

        $jumlahGagal = $cutiBersama->participants()
            ->where('status_potongan', CutiBersamaParticipant::POTONGAN_GAGAL)
            ->count();

        $pesan = 'Cuti bersama berhasil dipublish.';
        if ($jumlahGagal > 0) {
            $pesan .= " Perhatian: {$jumlahGagal} karyawan tidak memiliki saldo cukup, perlu tindakan manual.";
        }

        return redirect()->route('cuti-bersama.index')->with('success', $pesan);
    }

    // Cancel: rollback semua saldo yang sudah terpotong, kembalikan ke draft
    public function cancel(CutiBersamaSchedule $cutiBersama): RedirectResponse
    {
        abort_unless($cutiBersama->isPublished(), 409, 'Jadwal ini belum dipublish.');

        DB::transaction(function () use ($cutiBersama) {
            $leaveRequests = $cutiBersama->leaveRequests()->get();

            foreach ($leaveRequests as $leaveRequest) {
                $this->rollbackSaldo($leaveRequest);
                $leaveRequest->delete();
            }

            $cutiBersama->participants()->update(['status_potongan' => null]);

            $cutiBersama->update(['status' => CutiBersamaSchedule::STATUS_DRAFT]);
        });

        return redirect()->route('cuti-bersama.index')
            ->with('success', 'Cuti bersama dibatalkan, seluruh saldo yang terpotong sudah dikembalikan.');
    }

    // ================= Helper =================

    private function prosesCascadingDeduction(CutiBersamaParticipant $participant, CutiBersamaSchedule $jadwal): void
    {
        $user = $participant->user;
        $jumlahHari = $jadwal->jumlah_hari;
        $tahun = $jadwal->tanggal_mulai->year;

        $leaveTypeTahunanId = LeaveType::where('nama_cuti', LeaveType::CUTI_TAHUNAN)->value('id');

        $balanceTahunan = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveTypeTahunanId)
            ->where('tahun', $tahun)
            ->first();

        $sisaTahunan = $balanceTahunan->sisa ?? 0;

        // Kasus 1: saldo tahunan cukup, potong semua dari situ
        if ($sisaTahunan >= $jumlahHari) {
            $balanceTahunan->potong($jumlahHari);

            $this->buatLeaveRequestCutiBersama($user, $jadwal, $jumlahHari, 0, LeaveType::CUTI_TAHUNAN);
            $participant->update(['status_potongan' => CutiBersamaParticipant::POTONGAN_DARI_TAHUNAN]);

            return;
        }

        // Kasus 2: saldo tahunan tidak cukup, cek cuti panjang untuk kekurangannya
        $kekurangan = $jumlahHari - $sisaTahunan;

        $balancePanjang = LeaveLongBalance::where('user_id', $user->id)
            ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
            ->first();

        $sisaPanjang = $balancePanjang?->sisa() ?? 0;

        if ($sisaPanjang < $kekurangan) {
            // Tidak cukup di kedua jenis cuti, JANGAN potong apa pun.
            // Tandai gagal, tampilkan warning manual ke SDM (tidak dipaksa otomatis).
            $participant->update(['status_potongan' => CutiBersamaParticipant::POTONGAN_GAGAL]);

            return;
        }

        // Cukup setelah digabung, lakukan potongan bertingkat
        if ($sisaTahunan > 0) {
            $balanceTahunan->potong($sisaTahunan);
        }
        $balancePanjang->potong($kekurangan);

        $this->buatLeaveRequestCutiBersama($user, $jadwal, $sisaTahunan, $kekurangan, LeaveType::CUTI_PANJANG);

        $statusPotongan = $sisaTahunan > 0
            ? CutiBersamaParticipant::POTONGAN_CAMPURAN
            : CutiBersamaParticipant::POTONGAN_DARI_PANJANG;

        $participant->update(['status_potongan' => $statusPotongan]);
    }

    private function buatLeaveRequestCutiBersama(
        User $user,
        CutiBersamaSchedule $jadwal,
        int $dariTahunan,
        int $dariPanjang,
        string $leaveTypeUtama
    ): void {
        LeaveRequest::create([
            'user_id' => $user->id,
            'leave_type_id' => LeaveType::where('nama_cuti', LeaveType::CUTI_BERSAMA)->value('id'),
            'tanggal_mulai' => $jadwal->tanggal_mulai,
            'tanggal_selesai' => $jadwal->tanggal_selesai,
            'jumlah_hari' => $dariTahunan + $dariPanjang,
            'sumber' => LeaveRequest::SUMBER_CUTI_BERSAMA,
            'cuti_bersama_id' => $jadwal->id,
            'potong_dari_tahunan' => $dariTahunan,
            'potong_dari_panjang' => $dariPanjang,
            // Cuti bersama tidak melalui approval manual, langsung final
            'level_approval_saat_ini' => null,
            'status' => LeaveRequest::STATUS_DISETUJUI,
        ]);
    }

    private function rollbackSaldo(LeaveRequest $leaveRequest): void
    {
        if ($leaveRequest->potong_dari_tahunan > 0) {
            LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', LeaveType::where('nama_cuti', LeaveType::CUTI_TAHUNAN)->value('id'))
                ->where('tahun', $leaveRequest->tanggal_mulai->year)
                ->first()
                ?->kembalikan($leaveRequest->potong_dari_tahunan);
        }

        if ($leaveRequest->potong_dari_panjang > 0) {
            LeaveLongBalance::where('user_id', $leaveRequest->user_id)
                ->first()
                ?->kembalikan($leaveRequest->potong_dari_panjang);
        }
    }
}