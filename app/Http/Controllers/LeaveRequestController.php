<?php

namespace App\Http\Controllers;

use App\Models\LeaveBalance;
use App\Models\LeaveLongBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\ApprovalVisibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function __construct(private ApprovalVisibilityService $approvalVisibility)
    {
    }

    // Riwayat pengajuan cuti milik user yang sedang login
    public function index(): Response
    {
        $leaveRequests = Auth::user()
            ->leaveRequests()
            ->with('leaveType')
            ->latest()
            ->paginate(10);

        return Inertia::render('LeaveRequests/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function create(): Response
    {
        // Cuti bersama sengaja tidak ditampilkan sebagai pilihan,
        // karena hanya bisa dibuat oleh SDM (bukan diajukan karyawan)
        $leaveTypes = LeaveType::where('nama_cuti', '!=', LeaveType::CUTI_BERSAMA)->get(['id', 'nama_cuti']);

        return Inertia::render('LeaveRequests/Create', [
            'leaveTypes' => $leaveTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $cutiBersamaId = LeaveType::where('nama_cuti', LeaveType::CUTI_BERSAMA)->value('id');

        $validated = $request->validate([
            'leave_type_id' => [
                'required',
                'exists:leave_types,id',
                Rule::notIn([$cutiBersamaId]),
            ],
            'tanggal_mulai' => ['required', 'date', 'after_or_equal:today'],
            'tanggal_selesai' => ['required', 'date', 'after_or_equal:tanggal_mulai'],
            'alasan' => ['nullable', 'string', 'max:1000'],
            'bukti_cuti' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'],
        ], [
            'leave_type_id.not_in' => 'Cuti bersama tidak dapat diajukan manual, jadwalnya ditentukan oleh SDM.',
            'bukti_cuti.mimes' => 'Bukti cuti harus berupa file gambar (jpg/png) atau dokumen PDF.',
            'bukti_cuti.max' => 'Ukuran file bukti cuti maksimal 2MB.',
        ]);

        $jumlahHari = now()->parse($validated['tanggal_mulai'])
            ->diffInDays(now()->parse($validated['tanggal_selesai'])) + 1;

        $leaveType = LeaveType::findOrFail($validated['leave_type_id']);

        $this->pastikanSaldoMencukupi($user, $leaveType, $jumlahHari);

        $buktiCutiPath = null;

        if ($request->hasFile('bukti_cuti')) {
            // Disimpan di storage/app/public/bukti-cuti, pastikan sudah
            // menjalankan `php artisan storage:link` di project
            $buktiCutiPath = $request->file('bukti_cuti')->store('bukti-cuti', 'public');
        }

        LeaveRequest::create([
            'user_id' => $user->id,
            'leave_type_id' => $leaveType->id,
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tanggal_selesai' => $validated['tanggal_selesai'],
            'jumlah_hari' => $jumlahHari,
            'alasan' => $validated['alasan'] ?? null,
            'bukti_cuti' => $buktiCutiPath,
            'sumber' => LeaveRequest::SUMBER_MANUAL,
            // Approval selalu dimulai dari level 1. Siapa approver-nya dan berapa
            // total level tergantung role & jabatan pemohon — ditentukan nanti
            // oleh ApprovalService saat proses approve/reject dijalankan.
            'level_approval_saat_ini' => 1,
            'status' => LeaveRequest::STATUS_PENDING,
        ]);

        return redirect()->route('leave-requests.index')
            ->with('success', 'Pengajuan cuti berhasil dikirim, menunggu approval.');
    }

    public function show(LeaveRequest $leaveRequest): Response
    {
        $this->authorizeView($leaveRequest);

        $leaveRequest->load(['user.departemen', 'user.role', 'leaveType', 'approvals.approver', 'dibatalkanOleh']);

        return Inertia::render('LeaveRequests/Show', [
            'leaveRequest' => $leaveRequest,
            // SDM boleh edit/batalkan langsung dari halaman detail
            'canManageAsSdm' => Auth::user()->isSdm() && $leaveRequest->bisaDikelolaSdm(),
        ]);
    }

    // Karyawan hanya boleh membatalkan pengajuannya sendiri, dan hanya
    // selama masih berstatus pending (belum ada yang approve/reject)
    public function destroy(LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->authorizeOwner($leaveRequest);

        if (! $leaveRequest->isPending()) {
            return back()->withErrors(['leave_request' => 'Pengajuan yang sudah diproses tidak dapat dibatalkan.']);
        }

        $leaveRequest->delete();

        return redirect()->route('leave-requests.index')
            ->with('success', 'Pengajuan cuti dibatalkan.');
    }

    private function authorizeOwner(LeaveRequest $leaveRequest): void
    {
        abort_unless($leaveRequest->user_id === Auth::id(), 403);
    }

    // Boleh dilihat oleh: pemiliknya sendiri, ATAU approver yang sedang/pernah
    // berwenang memproses pengajuan ini (baik masih pending maupun sudah selesai)
    private function authorizeView(LeaveRequest $leaveRequest): void
    {
        $user = Auth::user();

        if ($leaveRequest->user_id === $user->id) {
            return;
        }

        // SDM sebagai admin sistem boleh melihat seluruh pengajuan cuti
        if ($user->isSdm()) {
            return;
        }

        $pernahJadiApprover = $leaveRequest->approvals()
            ->where('approver_id', $user->id)
            ->exists();

        if ($pernahJadiApprover) {
            return;
        }

        $sedangBerwenang = $this->approvalVisibility
            ->pendingUntukApprover($user)
            ->where('id', $leaveRequest->id)
            ->exists();

        abort_unless($sedangBerwenang, 403, 'Anda tidak berwenang melihat pengajuan ini.');
    }

    private function pastikanSaldoMencukupi($user, LeaveType $leaveType, int $jumlahHari): void
    {
        if ($leaveType->nama_cuti === LeaveType::CUTI_TAHUNAN) {
            $balance = LeaveBalance::where('user_id', $user->id)
                ->where('leave_type_id', $leaveType->id)
                ->where('tahun', now()->year)
                ->first();

            if (! $balance || $balance->sisa < $jumlahHari) {
                throw ValidationException::withMessages([
                    'jumlah_hari' => 'Sisa cuti tahunan tidak mencukupi untuk jumlah hari yang diajukan.',
                ]);
            }
        }

        if ($leaveType->nama_cuti === LeaveType::CUTI_PANJANG) {
            $balance = LeaveLongBalance::where('user_id', $user->id)
                ->where('status', LeaveLongBalance::STATUS_TERSEDIA)
                ->first();

            if (! $balance || $balance->sisa() < $jumlahHari) {
                throw ValidationException::withMessages([
                    'jumlah_hari' => 'Anda belum eligible atau sisa cuti panjang tidak mencukupi.',
                ]);
            }
        }
    }
}