<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveApproval extends Model
{
     use HasFactory;
 
    protected $fillable = [
        'leave_request_id',
        'approver_id',
        'level_approval',
        'status',
        'catatan',
        'diproses_pada',
    ];
 
    protected function casts(): array
    {
        return [
            'diproses_pada' => 'datetime',
        ];
    }
 
    public const STATUS_PENDING = 'pending';
    public const STATUS_DISETUJUI = 'disetujui';
    public const STATUS_DITOLAK = 'ditolak';
 
    public function leaveRequest(): BelongsTo
    {
        return $this->belongsTo(LeaveRequest::class);
    }
 
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
