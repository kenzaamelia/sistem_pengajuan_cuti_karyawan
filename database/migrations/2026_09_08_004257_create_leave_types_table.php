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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('nama_cuti')->unique();
            $table->timestamps();
        });

        \Illuminate\Support\Facades\DB::table('leave_types')->insert([
            ['nama_cuti' => 'cuti_tahunan', 'created_at' => now(), 'updated_at' => now()],
            ['nama_cuti' => 'cuti_bersama', 'created_at' => now(), 'updated_at' => now()],
            ['nama_cuti' => 'cuti_panjang', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
