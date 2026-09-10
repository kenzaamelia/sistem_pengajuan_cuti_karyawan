<?php

namespace Database\Seeders;

use App\Models\Departemen;
use Illuminate\Database\Seeder;

class DepartemenSeeder extends Seeder
{
    /**
     * Seed 5 departemen sesuai kebutuhan sistem pengajuan cuti.
     */
    public function run(): void
    {
        $departemens = [
            'Instalasi',
            'Pengolahan',
            'Quality Assurance',
            'Tanaman',
            'Keuangan dan Umum',
        ];

        foreach ($departemens as $nama) {
            // firstOrCreate supaya aman dijalankan berulang kali (tidak duplikat)
            Departemen::firstOrCreate(['nama_departemen' => $nama]);
        }
    }
}