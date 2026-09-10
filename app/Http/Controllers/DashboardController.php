<?php

namespace App\Http\Controllers;

use App\Models\CutiBersamaParticipant;
use App\Models\CutiBersamaSchedule;
use App\Models\Departemen;
use App\Models\LeaveBalance;
use App\Models\LeaveLongBalance;
use App\Models\User;
use App\Services\ApprovalVisibilityService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private ApprovalVisibilityService $approvalVisibility)
    {
    }

    public function index(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $props = [
            'namaRole' => $user->role?->nama_role,
            'jabatan' => $user->jabatan,
        ];

        // Karyawan pelaksana & karyawan pimpinan sama-sama karyawan yang punya saldo cuti sendiri
        if ($user->isKaryawanPelaksana() || $user->isKaryawanPimpinan()) {
            $props['saldoCuti'] = $this->saldoCutiUntuk($user);
        }

        // Karyawan pimpinan & GM sama-sama berperan sebagai approver
        if ($user->isKaryawanPimpinan() || $user->isGeneralManager()) {
            $props['jumlahPendingApproval'] = $this->approvalVisibility
                ->pendingUntukApprover($user)
                ->count();
        }

        if ($user->isSdm()) {
            $props['ringkasanSdm'] = $this->ringkasanUntukSdm();
        }

        return Inertia::render('Dashboard', $props);
    }

    private function saldoCutiUntuk(User $user): array
    {
        $tahunIni = now()->year;

        $cutiTahunan = LeaveBalance::with('leaveType')
            ->where('user_id', $user->id)
            ->where('tahun', $tahunIni)
            ->whereHas('leaveType', fn ($q) => $q->where('nama_cuti', 'cuti_tahunan'))
            ->first();

        $cutiPanjang = LeaveLongBalance::where('user_id', $user->id)
            ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
            ->first();

        return [
            'cuti_tahunan' => [
                'sisa' => $cutiTahunan->sisa ?? 0,
                'saldo_awal' => $cutiTahunan->saldo_awal ?? 0,
            ],
            'cuti_panjang' => [
                'tersedia' => (bool) $cutiPanjang,
                'sisa' => $cutiPanjang?->sisa() ?? 0,
            ],
        ];
    }

   private function ringkasanUntukSdm(): array
    {
        return [
            'jumlah_departemen' => Departemen::count(),
            // Hanya hitung karyawan pelaksana & karyawan pimpinan.
            // SDM (akun admin) dan General Manager bukan "karyawan".
            'jumlah_karyawan' => User::karyawan()->count(),
            'cuti_bersama_draft' => CutiBersamaSchedule::where('status', CutiBersamaSchedule::STATUS_DRAFT)->count(),
            'cuti_bersama_published' => CutiBersamaSchedule::where('status', CutiBersamaSchedule::STATUS_PUBLISHED)->count(),
            // Peserta cuti bersama yang saldonya tidak cukup, butuh tindakan manual SDM
            'peserta_butuh_tindakan' => CutiBersamaParticipant::where('status_potongan', CutiBersamaParticipant::POTONGAN_GAGAL)->count(),
        ];
    }
}