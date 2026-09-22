<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveLongBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestAdminController extends Controller
{
    // Form edit tanggal/alasan pengajuan cuti, khusus SDM.
    public function edit(LeaveRequest $leaveRequest): Response
    {
        $this->pastikanBisaDikelola($leaveRequest);

        $leaveRequest->load(['user.departemen', 'leaveType']);

        return Inertia::render('Sdm/LeaveMonitoring/Edit', [
            'leaveRequest' => $leaveRequest,
        ]);
    }

    // Update tanggal_mulai/tanggal_selesai/alasan. Kalau pengajuan sudah
    // disetujui (saldo sudah terpotong), saldo lama dikembalikan dulu baru
    // dipotong ulang sesuai jumlah hari yang baru.
    public function update(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->pastikanBisaDikelola($leaveRequest);

        $validated = $request->validate([
            'tanggal_mulai' => ['required', 'date'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'alasan' => ['nullable', 'string', 'max:1000'],
        ]);

        $jumlahHariBaru = now()->parse($validated['tanggal_mulai'])
            ->diffInDays(now()->parse($validated['tanggal_selesai'])) + 1;

        DB::transaction(function () use ($leaveRequest, $validated, $jumlahHariBaru) {
            $leaveRequest = LeaveRequest::where('id', $leaveRequest->id)->lockForUpdate()->firstOrFail();

            if ($leaveRequest->isDisetujui()) {
                // Kembalikan saldo lama dulu, supaya pengecekan kecukupan saldo
                // baru dihitung dari sisa yang sudah "bersih"
                $this->rollbackSaldo($leaveRequest);

                $this->pastikanSaldoMencukupi($leaveRequest, $jumlahHariBaru);

                $this->potongSaldo($leaveRequest, $jumlahHariBaru, $validated['tanggal_mulai']);
            }

            $leaveRequest->update([
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tanggal_selesai' => $validated['tanggal_selesai'],
                'jumlah_hari' => $jumlahHariBaru,
                'alasan' => $validated['alasan'] ?? $leaveRequest->alasan,
            ]);
        });

        return redirect()->route('monitoring.index')
            ->with('success', 'Pengajuan cuti berhasil diperbarui.');
    }

    // Batalkan pengajuan cuti di status apapun (pending/disetujui/ditolak).
    // Kalau statusnya disetujui, saldo yang sudah terpotong dikembalikan.
    public function cancel(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->pastikanBisaDikelola($leaveRequest);

        $validated = $request->validate([
            'alasan_pembatalan' => ['required', 'string', 'max:1000'],
        ], [
            'alasan_pembatalan.required' => 'Alasan pembatalan wajib diisi.',
        ]);

        DB::transaction(function () use ($leaveRequest, $validated) {
            $leaveRequest = LeaveRequest::where('id', $leaveRequest->id)->lockForUpdate()->firstOrFail();

            if ($leaveRequest->isDisetujui()) {
                $this->rollbackSaldo($leaveRequest);
            }

            $leaveRequest->update([
                'status' => LeaveRequest::STATUS_DIBATALKAN,
                'level_approval_saat_ini' => null,
                'dibatalkan_oleh' => Auth::id(),
                'alasan_pembatalan' => $validated['alasan_pembatalan'],
                'dibatalkan_pada' => now(),
            ]);
        });

        return back()->with('success', 'Pengajuan cuti berhasil dibatalkan.');
    }

    // ================= Helper =================

    private function pastikanBisaDikelola(LeaveRequest $leaveRequest): void
    {
        abort_unless(
            $leaveRequest->bisaDikelolaSdm(),
            409,
            'Pengajuan ini sudah dibatalkan sebelumnya atau berasal dari cuti bersama. '.
            'Cuti bersama hanya bisa dikelola lewat menu Kelola Cuti Bersama.'
        );
    }

    private function pastikanSaldoMencukupi(LeaveRequest $leaveRequest, int $jumlahHariBaru): void
    {
        $leaveType = $leaveRequest->leaveType;

        if ($leaveType->nama_cuti === LeaveType::CUTI_TAHUNAN) {
            $balance = LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveType->id)
                ->where('tahun', now()->parse($leaveRequest->tanggal_mulai)->year)
                ->first();

            if (! $balance || $balance->sisa < $jumlahHariBaru) {
                throw ValidationException::withMessages([
                    'jumlah_hari' => 'Sisa cuti tahunan karyawan tidak mencukupi untuk jumlah hari yang baru.',
                ]);
            }
        }

        if ($leaveType->nama_cuti === LeaveType::CUTI_PANJANG) {
            $balance = LeaveLongBalance::where('user_id', $leaveRequest->user_id)
                ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
                ->first();

            if (! $balance || $balance->sisa() < $jumlahHariBaru) {
                throw ValidationException::withMessages([
                    'jumlah_hari' => 'Sisa cuti panjang karyawan tidak mencukupi untuk jumlah hari yang baru.',
                ]);
            }
        }
    }

    private function potongSaldo(LeaveRequest $leaveRequest, int $jumlahHari, string $tanggalMulai): void
    {
        $leaveType = $leaveRequest->leaveType;

        if ($leaveType->nama_cuti === LeaveType::CUTI_TAHUNAN) {
            LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveType->id)
                ->where('tahun', now()->parse($tanggalMulai)->year)
                ->first()
                ?->potong($jumlahHari);
        }

        if ($leaveType->nama_cuti === LeaveType::CUTI_PANJANG) {
            LeaveLongBalance::where('user_id', $leaveRequest->user_id)
                ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
                ->first()
                ?->potong($jumlahHari);
        }
    }

    private function rollbackSaldo(LeaveRequest $leaveRequest): void
    {
        $leaveType = $leaveRequest->leaveType;

        if ($leaveType->nama_cuti === LeaveType::CUTI_TAHUNAN) {
            LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveType->id)
                ->where('tahun', $leaveRequest->tanggal_mulai->year)
                ->first()
                ?->kembalikan($leaveRequest->jumlah_hari);
        }

        if ($leaveType->nama_cuti === LeaveType::CUTI_PANJANG) {
            // Sengaja tidak filter status TERSEDIA: kalau saldo sudah habis
            // terpakai, statusnya sudah berubah jadi TERPAKAI. kembalikan()
            // yang akan mengembalikan status ke TERSEDIA setelah saldo bertambah.
            LeaveLongBalance::where('user_id', $leaveRequest->user_id)
                ->first()
                ?->kembalikan($leaveRequest->jumlah_hari);
        }
    }
}