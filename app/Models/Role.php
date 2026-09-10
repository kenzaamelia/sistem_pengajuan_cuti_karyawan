<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = ['nama_role'];
    
    public const KARYAWAN_PELAKSANA = 'karyawan_pelaksana';
    public const KARYAWAN_PIMPINAN = 'karyawan_pimpinan';
    public const SDM = 'sdm';
    public const GENERAL_MANAGER = 'general_manager';

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

}
