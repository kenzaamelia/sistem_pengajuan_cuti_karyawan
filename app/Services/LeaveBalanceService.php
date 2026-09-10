<?php

namespace App\Services;

use App\Models\LeaveBalance;
use App\Models\LeaveSetting;
use App\Models\LeaveType;
use App\Models\User;

class LeaveBalanceService
{
    // Dipakai kalau SDM belum sempat mengatur kuota lewat LeaveSetting.
    // Begitu SDM mengisi LeaveSetting untuk cuti_tahunan, nilai ini tidak lagi dipakai.
    private const KUOTA_DEFAULT = 12;

    public function buatSaldoAwalCutiTahunan(User $user): void
    {
        $leaveTypeId = LeaveType::where('nama_cuti', LeaveType::CUTI_TAHUNAN)->value('id');

        if (! $leaveTypeId) {
            return; // seed leave_types belum jalan, aman untuk skip daripada error
        }

        $tahunIni = now()->year;

        // firstOrCreate supaya tidak duplikat kalau method ini kebetulan terpanggil dua kali
        $sudahAda = LeaveBalance::where('user_id', $user->id)
            ->where('leave_type_id', $leaveTypeId)
            ->where('tahun', $tahunIni)
            ->exists();

        if ($sudahAda) {
            return;
        }

        $kuota = LeaveSetting::aturanBerlakuPada($leaveTypeId, now())?->jumlah_hari
            ?? self::KUOTA_DEFAULT;

        LeaveBalance::create([
            'user_id' => $user->id,
            'leave_type_id' => $leaveTypeId,
            'tahun' => $tahunIni,
            'saldo_awal' => $kuota,
            'terpakai' => 0,
            'sisa' => $kuota,
        ]);
    }
}