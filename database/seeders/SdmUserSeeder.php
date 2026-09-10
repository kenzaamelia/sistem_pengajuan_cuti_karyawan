<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class SdmUserSeeder extends Seeder
{
    /**
     * Buat 1 akun SDM untuk keperluan login/testing.
     * SDM berperan sebagai admin/master sistem, jadi tidak terikat departemen.
     */
    public function run(): void
    {
        $roleSdmId = Role::where('nama_role', Role::SDM)->value('id');

        if (! $roleSdmId) {
            // Role belum ke-seed (migration roles belum jalan), skip daripada error
            $this->command?->warn('Role SDM belum ditemukan. Pastikan migration sudah dijalankan.');

            return;
        }

        // firstOrCreate supaya aman dijalankan berulang kali (tidak duplikat)
        User::firstOrCreate(
            ['email' => 'sdm@pengajuancuti.com'],
            [
                'name' => 'Admin SDM',
                'password' => 'sdmpg1001', // otomatis di-hash oleh cast 'password' => 'hashed' di model User
                'role_id' => $roleSdmId,
                'email_verified_at' => now(),
            ]
        );
    }
}