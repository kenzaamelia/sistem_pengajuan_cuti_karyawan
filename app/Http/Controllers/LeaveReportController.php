<?php

namespace App\Http\Controllers;

use App\Exports\LaporanBulananExport;
use App\Services\LeaveMonthlyReportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class LeaveReportController extends Controller
{
    public function __construct(private LeaveMonthlyReportService $reportService)
    {
    }

    // Halaman preview laporan bulanan (rekap per departemen, breakdown per jenis
    // cuti, dan total per karyawan) khusus untuk SDM.
    public function index(Request $request): Response
    {
        [$bulan, $tahun] = $this->ambilPeriode($request);

        return Inertia::render('Sdm/LaporanBulanan/Index', [
            'rekap' => $this->reportService->rekap($bulan, $tahun),
            'filters' => ['bulan' => $bulan, 'tahun' => $tahun],
        ]);
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        [$bulan, $tahun] = $this->ambilPeriode($request);

        $rekap = $this->reportService->rekap($bulan, $tahun);

        return Excel::download(
            new LaporanBulananExport($rekap),
            "laporan-cuti-bulanan-{$rekap['tahun']}-{$rekap['bulan']}.xlsx"
        );
    }

    public function exportPdf(Request $request): \Illuminate\Http\Response
    {
        [$bulan, $tahun] = $this->ambilPeriode($request);

        $rekap = $this->reportService->rekap($bulan, $tahun);

        $pdf = Pdf::loadView('laporan.bulanan-pdf', ['rekap' => $rekap])
            ->setPaper('a4', 'landscape');

        return $pdf->download("laporan-cuti-bulanan-{$rekap['tahun']}-{$rekap['bulan']}.pdf");
    }

    // Ambil & validasi bulan/tahun dari query string, default ke bulan berjalan.
    private function ambilPeriode(Request $request): array
    {
        $bulan = (int) $request->input('bulan', now()->month);
        $tahun = (int) $request->input('tahun', now()->year);

        $bulan = ($bulan >= 1 && $bulan <= 12) ? $bulan : now()->month;
        $tahun = ($tahun >= 2000 && $tahun <= 2100) ? $tahun : now()->year;

        return [$bulan, $tahun];
    }
}