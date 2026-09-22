<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Departemen;
use App\Models\Role;
use App\Models\User;
use App\Services\LeaveBalanceService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private LeaveBalanceService $leaveBalanceService)
    {
    }

    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'roles' => Role::all(['id', 'nama_role']),
            'departemens' => Departemen::all(['id', 'nama_departemen']),
            'recaptchaSiteKey' => config('captcha.sitekey'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Ambil id role tertentu dulu, dipakai untuk validasi kondisional di bawah
        $karyawanPimpinanId = Role::where('nama_role', Role::KARYAWAN_PIMPINAN)->value('id');
        $generalManagerId = Role::where('nama_role', Role::GENERAL_MANAGER)->value('id');
        $sdmId = Role::where('nama_role', Role::SDM)->value('id');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
            // Wajib lolos captcha Google reCAPTCHA — mencegah bot mendaftar akun massal.
            'g-recaptcha-response' => ['required', 'captcha'],

            'role_id' => ['required', 'exists:roles,id'],

            // Wajib diisi hanya jika role yang dipilih adalah Karyawan Pimpinan
            'jabatan' => [
                Rule::requiredIf($request->input('role_id') == $karyawanPimpinanId),
                'nullable',
                Rule::in([User::JABATAN_ASISTEN_MANAJER, User::JABATAN_MANAJER]),
            ],

            // Wajib untuk karyawan pelaksana & karyawan pimpinan saja.
            // SDM (admin sistem) dan General Manager bukan karyawan, jadi tidak
            // perlu terikat departemen.
            'departemen_id' => [
                Rule::requiredIf(! in_array($request->input('role_id'), [$generalManagerId, $sdmId])),
                'nullable',
                'exists:departemens,id',
            ],

            'tanggal_masuk_kerja' => ['required', 'date'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'jabatan' => $validated['jabatan'] ?? null,
            'departemen_id' => $validated['departemen_id'] ?? null,
            'tanggal_masuk_kerja' => $validated['tanggal_masuk_kerja'],
        ]);

        event(new Registered($user));

        // Hanya karyawan (pelaksana & pimpinan) yang dapat saldo cuti tahunan otomatis.
        // SDM dan General Manager tidak melalui alur pengajuan cuti yang sama.
        $namaRole = Role::find($validated['role_id'])?->nama_role;
        if (in_array($namaRole, [Role::KARYAWAN_PELAKSANA, Role::KARYAWAN_PIMPINAN], true)) {
            $this->leaveBalanceService->buatSaldoAwalCutiTahunan($user);
        }

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}