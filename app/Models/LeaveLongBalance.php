<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveLongBalance extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id',
        'periode_ke',
        'kuota_hari',
        'terpakai',
        'status',
        'tanggal_eligible',
        'tanggal_terpakai',
    ];
 
    protected function casts(): array
    {
        return [
            'tanggal_eligible' => 'date',
            'tanggal_terpakai' => 'date',
        ];
    }
 
    public const STATUS_BELUM_ELIGIBLE = 'belum_eligible';
    public const STATUS_TERSEDIA = 'tersedia';
    public const STATUS_TERPAKAI = 'terpakai';
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function sisa(): int
    {
        return $this->kuota_hari - $this->terpakai;
    }
 
    public function potong(int $jumlahHari): void
    {
        $this->terpakai += $jumlahHari;
 
        if ($this->sisa() <= 0) {
            $this->status = self::STATUS_TERPAKAI;
            $this->tanggal_terpakai = now();
        }
 
        $this->save();
    }
 
    public function kembalikan(int $jumlahHari): void
    {
        $this->terpakai -= $jumlahHari;
 
        if ($this->status === self::STATUS_TERPAKAI && $this->sisa() > 0) {
            $this->status = self::STATUS_TERSEDIA;
            $this->tanggal_terpakai = null;
        }
 
        $this->save();
    }
}
