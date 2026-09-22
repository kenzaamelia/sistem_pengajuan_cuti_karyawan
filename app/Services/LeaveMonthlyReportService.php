<?php

namespace App\Services;

use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Support\Collection;

class LeaveMonthlyReportService
{
    public const NAMA_BULAN = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];

    // Susun rekap cuti bulanan: per departemen -> per karyawan -> breakdown per jenis
    // cuti. Hanya menghitung pengajuan yang statusnya DISETUJUI, berdasarkan bulan
    // & tahun tanggal_mulai (konsisten dengan filter di LeaveMonitoringController).
    //
    // Dipakai bersama oleh:
    // - LeaveReportController@index (preview di layar)
    // - LaporanBulananExport (export Excel)
    // - view laporan.bulanan-pdf (export PDF)
    // supaya angka yang ditampilkan selalu konsisten di ketiga tempat.
    public function rekap(int $bulan, int $tahun): array
    {
        $leaveTypes = LeaveType::orderBy('nama_cuti')->get(['id', 'nama_cuti']);

        $leaveRequests = LeaveRequest::query()
            ->with(['user.departemen', 'leaveType'])
            ->where('status', LeaveRequest::STATUS_DISETUJUI)
            ->whereMonth('tanggal_mulai', $bulan)
            ->whereYear('tanggal_mulai', $tahun)
            ->get()
            // Jaga-jaga kalau ada data yatim (user sudah terhapus)
            ->filter(fn ($leaveRequest) => $leaveRequest->user !== null)
            ->values();

        $departemens = $leaveRequests
            ->groupBy(fn ($leaveRequest) => $leaveRequest->user->departemen_id ?? 0)
            ->map(function (Collection $itemsDepartemen) use ($leaveTypes) {
                $namaDepartemen = $itemsDepartemen->first()->user->departemen?->nama_departemen
                    ?? 'Tanpa Departemen';

                $karyawans = $itemsDepartemen
                    ->groupBy('user_id')
                    ->map(function (Collection $itemsKaryawan) use ($leaveTypes) {
                        return [
                            'nama' => $itemsKaryawan->first()->user->name,
                            'breakdown' => $this->breakdownPerJenisCuti($itemsKaryawan, $leaveTypes),
                            'total_hari' => $itemsKaryawan->sum('jumlah_hari'),
                        ];
                    })
                    ->sortBy('nama')
                    ->values();

                return [
                    'departemen_id' => $itemsDepartemen->first()->user->departemen_id ?? 0,
                    'nama_departemen' => $namaDepartemen,
                    'karyawans' => $karyawans,
                    'subtotal_breakdown' => $this->breakdownPerJenisCuti($itemsDepartemen, $leaveTypes),
                    'subtotal_hari' => $itemsDepartemen->sum('jumlah_hari'),
                ];
            })
            ->sortBy('nama_departemen')
            ->values();

        return [
            'bulan' => $bulan,
            'tahun' => $tahun,
            'nama_bulan' => self::NAMA_BULAN[$bulan] ?? (string) $bulan,
            'leave_types' => $leaveTypes->pluck('nama_cuti')->values(),
            'departemens' => $departemens,
            'grand_total_breakdown' => $this->breakdownPerJenisCuti($leaveRequests, $leaveTypes),
            'grand_total_hari' => $leaveRequests->sum('jumlah_hari'),
            'jumlah_pengajuan' => $leaveRequests->count(),
        ];
    }

    // Jumlahkan jumlah_hari dari sekumpulan LeaveRequest, dikelompokkan per jenis cuti.
    private function breakdownPerJenisCuti(Collection $leaveRequests, Collection $leaveTypes): Collection
    {
        return $leaveTypes->mapWithKeys(function ($leaveType) use ($leaveRequests) {
            $jumlah = $leaveRequests
                ->where('leave_type_id', $leaveType->id)
                ->sum('jumlah_hari');

            return [$leaveType->nama_cuti => $jumlah];
        });
    }
}