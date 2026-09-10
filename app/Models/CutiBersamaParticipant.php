<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CutiBersamaParticipant extends Model
{
    use HasFactory;
 
    protected $table = 'cuti_bersama_participants';
 
    protected $fillable = [
        'cuti_bersama_id',
        'user_id',
        'status_potongan',
    ];
 
    // Diisi setelah proses cascading deduction dijalankan
    public const POTONGAN_DARI_TAHUNAN = 'dari_tahunan';
    public const POTONGAN_DARI_PANJANG = 'dari_panjang';
    public const POTONGAN_CAMPURAN = 'campuran';
    public const POTONGAN_GAGAL = 'gagal';
 
    public function cutiBersama(): BelongsTo
    {
        return $this->belongsTo(CutiBersamaSchedule::class, 'cuti_bersama_id');
    }
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    // Peserta yang butuh tindakan manual SDM (saldo tidak cukup di kedua jenis cuti)
    public function butuhTindakanManual(): bool
    {
        return $this->status_potongan === self::POTONGAN_GAGAL;
    }
}
