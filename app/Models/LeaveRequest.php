<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class LeaveRequest extends Model
{
  use HasFactory;
 
    protected $fillable = [
        'user_id',
        'leave_type_id',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_hari',
        'alasan',
        'bukti_cuti',
        'sumber',
        'cuti_bersama_id',
        'potong_dari_tahunan',
        'potong_dari_panjang',
        'level_approval_saat_ini',
        'status',
    ];
 
    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
        ];
    }
 
    public const SUMBER_MANUAL = 'manual';
    public const SUMBER_CUTI_BERSAMA = 'cuti_bersama';
 
    public const STATUS_PENDING = 'pending';
    public const STATUS_DISETUJUI = 'disetujui';
    public const STATUS_DITOLAK = 'ditolak';
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }
 
    public function cutiBersama(): BelongsTo
    {
        return $this->belongsTo(CutiBersamaSchedule::class, 'cuti_bersama_id');
    }
 
    public function approvals(): HasMany
    {
        return $this->hasMany(LeaveApproval::class);
    }
 
    // Query scope: pengajuan yang sedang menunggu approval di level tertentu.
    // Dipakai untuk dashboard pool approval Asisten Manajer / approval Manajer / GM.
    public function scopeMenungguLevel($query, int $level)
    {
        return $query->where('status', self::STATUS_PENDING)
            ->where('level_approval_saat_ini', $level);
    }
 
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function buktiCutiUrl(): ?string
    {
        return $this->bukti_cuti ? 
        Storage::url($this->bukti_cuti) : null;
    }
}
