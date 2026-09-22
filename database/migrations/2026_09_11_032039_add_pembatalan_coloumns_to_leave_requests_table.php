<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            // Diisi saat SDM membatalkan pengajuan (baik yang masih pending
            // maupun yang sudah disetujui). Terpisah dari alur reject normal
            // oleh approver.
            $table->foreignId('dibatalkan_oleh')
                ->nullable()
                ->after('status')
                ->constrained('users')
                ->nullOnDelete();

            $table->text('alasan_pembatalan')->nullable()->after('dibatalkan_oleh');
            $table->timestamp('dibatalkan_pada')->nullable()->after('alasan_pembatalan');
        });
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('dibatalkan_oleh');
            $table->dropColumn(['alasan_pembatalan', 'dibatalkan_pada']);
        });
    }
};
