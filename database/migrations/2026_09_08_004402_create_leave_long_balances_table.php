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
        Schema::create('leave_long_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('periode_ke');
            // periode ke berapa (1 = 6 tahun pertama, 2 = 6 tahun kedua, dst)
             // Snapshot kuota saat pertama kali eligible, tidak berubah walau leave_settings diupdate SDM nanti
            $table->unsignedInteger('kuota_hari');
            $table->unsignedInteger('terpakai')->default(0);
            // belum_eligible / tersedia / terpakai
            $table->string('status')->default('belum_eligible');
            $table->date('tanggal_eligible')->nullable();
            $table->date('tanggal_terpakai')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'periode_ke']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_long_balances');
    }
};
