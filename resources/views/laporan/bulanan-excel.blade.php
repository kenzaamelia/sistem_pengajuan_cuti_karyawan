@include('laporan._label-jenis-cuti')

<table>
    <thead>
        <tr>
            <th colspan="{{ 2 + count($rekap['leave_types']) + 1 }}">
                Laporan Bulanan Cuti Karyawan — {{ $rekap['nama_bulan'] }} {{ $rekap['tahun'] }}
            </th>
        </tr>
        <tr>
            <th>Departemen</th>
            <th>Nama Karyawan</th>
            @foreach ($rekap['leave_types'] as $jenisCuti)
                <th>{{ $labelJenisCuti[$jenisCuti] ?? $jenisCuti }} (hari)</th>
            @endforeach
            <th>Total Hari</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($rekap['departemens'] as $dept)
            @foreach ($dept['karyawans'] as $i => $karyawan)
                <tr>
                    <td>{{ $i === 0 ? $dept['nama_departemen'] : '' }}</td>
                    <td>{{ $karyawan['nama'] }}</td>
                    @foreach ($rekap['leave_types'] as $jenisCuti)
                        <td>{{ $karyawan['breakdown'][$jenisCuti] ?? 0 }}</td>
                    @endforeach
                    <td>{{ $karyawan['total_hari'] }}</td>
                </tr>
            @endforeach
            <tr>
                <td colspan="2">Subtotal {{ $dept['nama_departemen'] }}</td>
                @foreach ($rekap['leave_types'] as $jenisCuti)
                    <td>{{ $dept['subtotal_breakdown'][$jenisCuti] ?? 0 }}</td>
                @endforeach
                <td>{{ $dept['subtotal_hari'] }}</td>
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
            <tr>
                <td colspan="2">TOTAL KESELURUHAN</td>
                @foreach ($rekap['leave_types'] as $jenisCuti)
                    <td>{{ $rekap['grand_total_breakdown'][$jenisCuti] ?? 0 }}</td>
                @endforeach
                <td>{{ $rekap['grand_total_hari'] }}</td>
            </tr>
        </tfoot>
    @endif
</table>