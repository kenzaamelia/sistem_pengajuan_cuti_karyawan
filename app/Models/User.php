<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    // Isi kolom jabatan, hanya relevan kalau role = karyawan_pimpinan
    public const JABATAN_ASISTEN_MANAJER = 'asisten_manajer';
    public const JABATAN_MANAJER = 'manajer';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'jabatan',
        'departemen_id',
        'atasan_id',
        'tanggal_masuk_kerja',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'tanggal_masuk_kerja'=>'date',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
    public function departemen(): BelongsTo
    {
        return $this->belongsTo(Departemen::class);
    }
    public function atasan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'atasan_id');
    }
     public function bawahan(): HasMany
    {
        return $this->hasMany(User::class, 'atasan_id');
    }
    public function leaveRequests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
 
    public function leaveBalances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }
 
    public function leaveLongBalances(): HasMany
    {
        return $this->hasMany(LeaveLongBalance::class);
    }
    public function approvals(): HasMany
    {
        return $this->hasMany(LeaveApproval::class, 'approver_id');
    }
 
    public function cutiBersamaDibuat(): HasMany
    {
        return $this->hasMany(CutiBersamaSchedule::class, 'dibuat_oleh');
    }
 
    public function cutiBersamaParticipants(): HasMany
    {
        return $this->hasMany(CutiBersamaParticipant::class);
    }
 
    // ================= Helper Role & Jabatan =================
 
    public function isKaryawanPelaksana(): bool
    {
        return $this->role?->nama_role === Role::KARYAWAN_PELAKSANA;
    }
 
    public function isKaryawanPimpinan(): bool
    {
        return $this->role?->nama_role === Role::KARYAWAN_PIMPINAN;
    }
 
    public function isSdm(): bool
    {
        return $this->role?->nama_role === Role::SDM;
    }
 
    public function isGeneralManager(): bool
    {
        return $this->role?->nama_role === Role::GENERAL_MANAGER;
    }
 
    public function isAsistenManajer(): bool
    {
        return $this->isKaryawanPimpinan() && $this->jabatan === self::JABATAN_ASISTEN_MANAJER;
    }
 
    public function isManajer(): bool
    {
        return $this->isKaryawanPimpinan() && $this->jabatan === self::JABATAN_MANAJER;
    }
 
    // ================= Scope untuk pencarian approver =================
 
    // Semua Asisten Manajer di satu departemen (pool approval level 1
    // untuk pengajuan cuti karyawan pelaksana)
    public function scopeAsistenManajerDiDepartemen($query, int $departemenId)
    {
        return $query->whereHas('role', fn ($q) => $q->where('nama_role', Role::KARYAWAN_PIMPINAN))
            ->where('jabatan', self::JABATAN_ASISTEN_MANAJER)
            ->where('departemen_id', $departemenId);
    }
 
    // Manajer tetap satu per departemen
    public function scopeManajerDiDepartemen($query, int $departemenId)
    {
        return $query->whereHas('role', fn ($q) => $q->where('nama_role', Role::KARYAWAN_PIMPINAN))
            ->where('jabatan', self::JABATAN_MANAJER)
            ->where('departemen_id', $departemenId);
    }

    // "Karyawan" dalam arti sebenarnya hanya karyawan pelaksana & karyawan pimpinan.
    // SDM (admin sistem) dan General Manager BUKAN karyawan, jadi tidak boleh ikut
    // terhitung di statistik jumlah karyawan maupun daftar pilihan cuti bersama.
    public function scopeKaryawan($query)
    {
        return $query->whereHas('role', function ($q) {
            $q->whereIn('nama_role', [Role::KARYAWAN_PELAKSANA, Role::KARYAWAN_PIMPINAN]);
        });
    }

}
