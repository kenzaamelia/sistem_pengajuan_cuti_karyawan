@php
    // Label tampilan untuk setiap kode jenis cuti. Dipakai bareng oleh
    // view Excel (bulanan-excel.blade.php) dan PDF (bulanan-pdf.blade.php)
    // supaya label yang tampil selalu konsisten.
    $labelJenisCuti = [
        'cuti_tahunan' => 'Cuti Tahunan',
        'cuti_panjang' => 'Cuti Panjang',
        'cuti_bersama' => 'Cuti Bersama',
    ];
@endphp