<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
 
            $table->date('tanggal_mulai');
            $table->date('tanggal_selesai');
            $table->unsignedInteger('jumlah_hari');
            $table->text('alasan')->nullable();
            $table->string('bukti_cuti')->nullable(); // opsional, path file gambar/dokumen bukti cuti
 
            // manual = diajukan sendiri oleh karyawan, cuti_bersama = auto-generate dari SDM
            $table->string('sumber')->default('manual');
 
            // Nullable, hanya terisi kalau sumber = cuti_bersama
            $table->foreignId('cuti_bersama_id')
                ->nullable()
                ->constrained('cuti_bersama_schedules')
                ->nullOnDelete();
 
            // Breakdown potongan saldo (relevan untuk cascading deduction cuti bersama)
            $table->unsignedInteger('potong_dari_tahunan')->default(0);
            $table->unsignedInteger('potong_dari_panjang')->default(0);
 
            // 1 = level approval pertama, 2 = level kedua, null = tidak perlu approval manual (cuti bersama)
            $table->unsignedTinyInteger('level_approval_saat_ini')->nullable();
 
            // pending / disetujui / ditolak
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
