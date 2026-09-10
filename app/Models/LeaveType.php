<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = ['nama_cuti'];
    public const CUTI_TAHUNAN = 'cuti_tahunan';
    public const CUTI_BERSAMA = 'cuti_bersama';
    public const CUTI_PANJANG = 'cuti_panjang';

    public function leaveSettings(): HasMany
    {
        return $this->hasMany(LeaveSetting::class);
    }

    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
