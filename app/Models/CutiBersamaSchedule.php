<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CutiBersamaSchedule extends Model
{
    use HasFactory;
 
    protected $table = 'cuti_bersama_schedules';
 
    protected $fillable = [
        'nama_cuti_bersama',
        'tanggal_mulai',
        'tanggal_selesai',
        'jumlah_hari',
        'status',
        'dibuat_oleh',
    ];
 
    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_selesai' => 'date',
        ];
    }
 
    public const STATUS_DRAFT = 'draft';
    public const STATUS_PUBLISHED = 'published';
 
    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
 
    public function participants(): HasMany
    {
        return $this->hasMany(CutiBersamaParticipant::class, 'cuti_bersama_id');
    }
 
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class, 'cuti_bersama_id');
    }
 
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED;
    }
}
