<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // --- Kolom bawaan Laravel ---
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();

            // --- Kolom tambahan sistem cuti ---
            $table->foreignId('role_id')
                ->nullable()
                ->constrained('roles')
                ->nullOnDelete();

            // Hanya relevan jika role_id = karyawan_pimpinan
            // Isi: 'asisten_manajer' atau 'manajer'
            $table->string('jabatan')->nullable();

            $table->foreignId('departemen_id')
                ->nullable()
                ->constrained('departemens')
                ->nullOnDelete();

            // Nullable, disiapkan untuk skenario approval 1-ke-1 di masa depan
            $table->foreignId('atasan_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->date('tanggal_masuk_kerja')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};