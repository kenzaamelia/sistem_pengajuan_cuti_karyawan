<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LaporanBulananExport implements FromView, ShouldAutoSize, WithStyles
{
    // $rekap adalah array hasil LeaveMonthlyReportService::rekap(),
    // dilempar apa adanya ke view supaya markup tabelnya sama persis
    // dengan yang dipakai untuk preview & PDF.
    public function __construct(private array $rekap)
    {
    }

    public function view(): View
    {
        return view('laporan.bulanan-excel', ['rekap' => $this->rekap]);
    }

    public function styles(Worksheet $sheet): array
    {
        $jumlahKolom = 2 + count($this->rekap['leave_types']) + 1;
        $kolomTerakhir = Coordinate::stringFromColumnIndex($jumlahKolom);

        // Baris 1 = judul laporan, baris 2 = header kolom
        $sheet->mergeCells("A1:{$kolomTerakhir}1");
        $sheet->getStyle("A1:{$kolomTerakhir}1")->getFont()->setBold(true)->setSize(13);
        $sheet->getStyle("A1:{$kolomTerakhir}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getStyle("A2:{$kolomTerakhir}2")->getFont()->setBold(true);
        $sheet->getStyle("A2:{$kolomTerakhir}2")->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setRGB('E0E7FF');

        return [];
    }
}