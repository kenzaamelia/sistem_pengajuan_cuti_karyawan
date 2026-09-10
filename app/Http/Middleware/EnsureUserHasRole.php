<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Contoh pemakaian di routes:
     * Route::middleware('role:sdm')->group(...)
     * Route::middleware('role:karyawan_pimpinan,general_manager')->group(...)
     */
    public function handle(Request $request, Closure $next, string ...$rolesYangDiizinkan): Response
    {
        $user = Auth::user();

        abort_if(! $user, 401);

        abort_unless(
            in_array($user->role?->nama_role, $rolesYangDiizinkan, true),
            403,
            'Anda tidak memiliki akses ke halaman ini.'
        );

        return $next($request);
    }
}