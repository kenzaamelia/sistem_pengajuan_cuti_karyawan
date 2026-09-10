<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'leave_type_id',
        'jumlah_hari',
        'periode_tahun',
        'berlaku_mulai',
        'keterangan'
    ];

    protected function casts(): array
    {
        return[
            'berlaku_mulai' => 'date',
        ];
    }

    public function LeaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    // Ambil aturan kuota yang sedang berlaku untuk sebuah jenis cuti pada tanggal tertentu.
    // Dipakai saat karyawan pertama kali eligible cuti panjang, supaya kuota
    // yang di-snapshot ke leave_long_balances sesuai aturan yang berlaku saat itu.
    public static function aturanBerlakuPada(int $leaveTypeId, \DateTimeInterface $tanggal): ?self
    {
        return static::where('leave_type_id', $leaveTypeId)
            ->where('berlaku_mulai', '<=', $tanggal)
            ->orderByDesc('berlaku_mulai')
            ->first();
    }
}
