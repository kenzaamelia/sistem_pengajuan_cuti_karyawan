<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ApprovalVisibilityService
{
    // Query pengajuan pending yang boleh dilihat/diproses oleh $approver,
    // tergantung role & jabatannya. Dipakai bersama oleh ApprovalController
    // (untuk daftar & aksi approve/reject) dan DashboardController
    // (untuk badge jumlah pending di halaman utama).
    public function pendingUntukApprover(User $approver): Builder
    {
        $query = LeaveRequest::where('status', LeaveRequest::STATUS_PENDING);

        if ($approver->isAsistenManajer()) {
            return $query->where('level_approval_saat_ini', 1)
                ->whereHas('user', function (Builder $q) use ($approver) {
                    $q->where('departemen_id', $approver->departemen_id)
                        ->whereHas('role', fn (Builder $r) => $r->where('nama_role', Role::KARYAWAN_PELAKSANA));
                });
        }

        if ($approver->isManajer()) {
            return $query->where(function (Builder $q) use ($approver) {
                $q->where('level_approval_saat_ini', 2)
                    ->whereHas('user', function (Builder $u) use ($approver) {
                        $u->where('departemen_id', $approver->departemen_id)
                            ->whereHas('role', fn (Builder $r) => $r->where('nama_role', Role::KARYAWAN_PELAKSANA));
                    });
            })->orWhere(function (Builder $q) use ($approver) {
                $q->where('level_approval_saat_ini', 1)
                    ->whereHas('user', function (Builder $u) use ($approver) {
                        $u->where('departemen_id', $approver->departemen_id)
                            ->where('jabatan', User::JABATAN_ASISTEN_MANAJER);
                    });
            });
        }

        if ($approver->isGeneralManager()) {
            return $query->where(function (Builder $q) {
                $q->where('level_approval_saat_ini', 2)
                    ->whereHas('user', fn (Builder $u) => $u->where('jabatan', User::JABATAN_ASISTEN_MANAJER));
            })->orWhere(function (Builder $q) {
                $q->where('level_approval_saat_ini', 1)
                    ->whereHas('user', fn (Builder $u) => $u->where('jabatan', User::JABATAN_MANAJER));
            });
        }

        return $query->whereRaw('1 = 0');
    }
}