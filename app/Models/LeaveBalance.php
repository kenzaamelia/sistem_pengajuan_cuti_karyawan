<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use HasFactory;
 
    protected $fillable = [
        'user_id',
        'leave_type_id',
        'tahun',
        'saldo_awal',
        'terpakai',
        'sisa',
    ];
 
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
 
    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }
 
    // Potong saldo dan simpan langsung. Dipakai baik oleh pengajuan manual
    // maupun proses cascading deduction cuti bersama.
    public function potong(int $jumlahHari): void
    {
        $this->terpakai += $jumlahHari;
        $this->sisa -= $jumlahHari;
        $this->save();
    }
 
    // Kembalikan saldo, dipakai saat SDM cancel/edit cuti bersama yang sudah dipublish.
    public function kembalikan(int $jumlahHari): void
    {
        $this->terpakai -= $jumlahHari;
        $this->sisa += $jumlahHari;
        $this->save();
    }
}
