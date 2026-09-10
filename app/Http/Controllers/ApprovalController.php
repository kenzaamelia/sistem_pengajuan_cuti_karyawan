<?php

namespace App\Http\Controllers;

use App\Models\LeaveApproval;
use App\Models\LeaveBalance;
use App\Models\LeaveLongBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Services\ApprovalVisibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ApprovalController extends Controller
{
    public function __construct(private ApprovalVisibilityService $approvalVisibility)
    {
    }

    // Daftar pengajuan yang menunggu approval dari user yang sedang login.
    // Isinya berbeda-beda tergantung role & jabatan: Asisten Manajer lihat
    // pool karyawan pelaksana di departemennya, Manajer lihat gabungan dari
    // karyawan pelaksana (level 2) dan asisten manajer (level 1), GM lihat
    // gabungan dari asisten manajer (level 2) dan manajer (level 1) di semua departemen.
    public function index(): Response
    {
        $leaveRequests = $this->approvalVisibility->pendingUntukApprover(Auth::user())
            ->with(['user.role', 'user.departemen', 'leaveType'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Approvals/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function approve(LeaveRequest $leaveRequest): RedirectResponse
    {
        $approver = Auth::user();

        DB::transaction(function () use ($leaveRequest, $approver) {
            // Lock baris supaya tidak ada approver lain yang memproses bersamaan
            $leaveRequest = LeaveRequest::where('id', $leaveRequest->id)->lockForUpdate()->firstOrFail();

            $this->pastikanMasihPendingDanBerwenang($leaveRequest, $approver);

            LeaveApproval::create([
                'leave_request_id' => $leaveRequest->id,
                'approver_id' => $approver->id,
                'level_approval' => $leaveRequest->level_approval_saat_ini,
                'status' => LeaveApproval::STATUS_DISETUJUI,
                'diproses_pada' => now(),
            ]);

            $totalLevel = $this->totalLevelUntukPemohon($leaveRequest->user);

            if ($leaveRequest->level_approval_saat_ini < $totalLevel) {
                // Masih ada level berikutnya, lempar ke level selanjutnya
                $leaveRequest->update([
                    'level_approval_saat_ini' => $leaveRequest->level_approval_saat_ini + 1,
                ]);
            } else {
                // Ini approval level terakhir, pengajuan resmi disetujui
                $leaveRequest->update([
                    'status' => LeaveRequest::STATUS_DISETUJUI,
                    'level_approval_saat_ini' => null,
                ]);

                $this->potongSaldo($leaveRequest);
            }
        });

        return back()->with('success', 'Pengajuan cuti disetujui.');
    }

    public function reject(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $approver = Auth::user();

        $validated = $request->validate([
            'catatan' => ['required', 'string', 'max:1000'],
        ], [
            'catatan.required' => 'Catatan alasan penolakan wajib diisi.',
        ]);

        DB::transaction(function () use ($leaveRequest, $approver, $validated) {
            $leaveRequest = LeaveRequest::where('id', $leaveRequest->id)->lockForUpdate()->firstOrFail();

            $this->pastikanMasihPendingDanBerwenang($leaveRequest, $approver);

            LeaveApproval::create([
                'leave_request_id' => $leaveRequest->id,
                'approver_id' => $approver->id,
                'level_approval' => $leaveRequest->level_approval_saat_ini,
                'status' => LeaveApproval::STATUS_DITOLAK,
                'catatan' => $validated['catatan'],
                'diproses_pada' => now(),
            ]);

            // Sekali ditolak di level manapun, proses berhenti total
            $leaveRequest->update([
                'status' => LeaveRequest::STATUS_DITOLAK,
                'level_approval_saat_ini' => null,
            ]);
        });

        return back()->with('success', 'Pengajuan cuti ditolak.');
    }

    // ================= Helper =================

    private function pastikanMasihPendingDanBerwenang(LeaveRequest $leaveRequest, User $approver): void
    {
        abort_unless($leaveRequest->isPending(), 409, 'Pengajuan ini sudah diproses oleh approver lain.');

        $masihBerwenang = $this->approvalVisibility->pendingUntukApprover($approver)
            ->where('id', $leaveRequest->id)
            ->exists();

        abort_unless($masihBerwenang, 403, 'Anda tidak berwenang memproses pengajuan ini.');
    }

    // Total level approval tergantung role & jabatan si pemohon (bukan approver)
    private function totalLevelUntukPemohon(User $pemohon): int
    {
        if ($pemohon->isManajer()) {
            return 1; // langsung ke GM, tidak ada level kedua
        }

        return 2; // karyawan pelaksana (asmen->manajer) & asisten manajer (manajer->GM)
    }

    private function potongSaldo(LeaveRequest $leaveRequest): void
    {
        $leaveType = $leaveRequest->leaveType;

        if ($leaveType->nama_cuti === LeaveType::CUTI_TAHUNAN) {
            LeaveBalance::where('user_id', $leaveRequest->user_id)
                ->where('leave_type_id', $leaveType->id)
                ->where('tahun', $leaveRequest->tanggal_mulai->year)
                ->first()
                ?->potong($leaveRequest->jumlah_hari);
        }

        if ($leaveType->nama_cuti === LeaveType::CUTI_PANJANG) {
            LeaveLongBalance::where('user_id', $leaveRequest->user_id)
                ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
                ->first()
                ?->potong($leaveRequest->jumlah_hari);
        }
    }
}