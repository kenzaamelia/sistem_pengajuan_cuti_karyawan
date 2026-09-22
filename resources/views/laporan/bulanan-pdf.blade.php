@include('laporan._label-jenis-cuti')
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Bulanan Cuti — {{ $rekap['nama_bulan'] }} {{ $rekap['tahun'] }}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #1f2937; font-size: 11px; }
        h1 { font-size: 16px; margin-bottom: 2px; }
        p.subjudul { margin-top: 0; color: #6b7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 5px 8px; text-align: left; }
        thead th { background-color: #4338ca; color: #ffffff; text-transform: uppercase; font-size: 9px; letter-spacing: 0.03em; }
        tr.departemen td { background-color: #eef2ff; font-weight: bold; }
        tr.subtotal td { background-color: #f3f4f6; font-weight: bold; }
        tr.total td { background-color: #4338ca; color: #ffffff; font-weight: bold; }
        td.angka, th.angka { text-align: right; }
        .footer-cetak { margin-top: 16px; font-size: 9px; color: #9ca3af; }
    </style>
</head>
<body>
    <h1>Laporan Bulanan Cuti Karyawan</h1>
    <p class="subjudul">
        Periode {{ $rekap['nama_bulan'] }} {{ $rekap['tahun'] }} —
        {{ $rekap['jumlah_pengajuan'] }} pengajuan cuti disetujui
    </p>

    <table>
        <thead>
            <tr>
                <th>Departemen</th>
                <th>Nama Karyawan</th>
                @foreach ($rekap['leave_types'] as $jenisCuti)
                    <th class="angka">{{ $labelJenisCuti[$jenisCuti] ?? $jenisCuti }}</th>
                @endforeach
                <th class="angka">Total Hari</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rekap['departemens'] as $dept)
                <tr class="departemen">
                    <td colspan="{{ 2 + count($rekap['leave_types']) + 1 }}">
                        {{ $dept['nama_departemen'] }}
                    </td>
                </tr>
                @foreach ($dept['karyawans'] as $karyawan)
                    <tr>
                        <td></td>
                        <td>{{ $karyawan['nama'] }}</td>
                        @foreach ($rekap['leave_types'] as $jenisCuti)
                            <td class="angka">{{ $karyawan['breakdown'][$jenisCuti] ?? 0 }}</td>
                        @endforeach
                        <td class="angka">{{ $karyawan['total_hari'] }}</td>
                    </tr>
                @endforeach
                <tr class="subtotal">
                    <td colspan="2">Subtotal {{ $dept['nama_departemen'] }}</td>
                    @foreach ($rekap['leave_types'] as $jenisCuti)
                        <td class="angka">{{ $dept['subtotal_breakdown'][$jenisCuti] ?? 0 }}</td>
                    @endforeach
                    <td class="angka">{{ $dept['subtotal_hari'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ 2 + count($rekap['leave_types']) + 1 }}">
                        Tidak ada pengajuan cuti disetujui pada periode ini.
                    </td>
                </tr>
            @endforelse
        </tbody>
        @if (count($rekap['departemens']) > 0)
            <tfoot>
                <tr class="total">
                    <td colspan="2">TOTAL KESELURUHAN</td>
                    @foreach ($rekap['leave_types'] as $jenisCuti)
                        <td class="angka">{{ $rekap['grand_total_breakdown'][$jenisCuti] ?? 0 }}</td>
                    @endforeach
                    <td class="angka">{{ $rekap['grand_total_hari'] }}</td>
                </tr>
            </tfoot>
        @endif
    </table>

    <p class="footer-cetak">Dicetak pada {{ now()->translatedFormat('d F Y, H:i') }} WIB</p>
</body>
</html>