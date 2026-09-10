<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('nama_role')->unique();
            // Contoh isi: karyawan_pelaksana, karyawan_pimpinan, sdm, general_manager
            $table->timestamps();
        });

        // Seed 4 role dasar langsung di migration supaya sistem siap pakai
        Schema::table('roles', function (Blueprint $table) {
            //
        });

        \Illuminate\Support\Facades\DB::table('roles')->insert([
            ['nama_role' => 'karyawan_pelaksana', 'created_at' => now(), 'updated_at' => now()],
            ['nama_role' => 'karyawan_pimpinan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_role' => 'sdm', 'created_at' => now(), 'updated_at' => now()],
            ['nama_role' => 'general_manager', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};