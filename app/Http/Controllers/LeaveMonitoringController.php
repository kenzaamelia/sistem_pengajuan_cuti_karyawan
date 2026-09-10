<?php

namespace App\Http\Controllers;

use App\Models\Departemen;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveMonitoringController extends Controller
{
    // Daftar semua pengajuan cuti lintas departemen, khusus SDM.
    // Mendukung filter status, departemen, jenis cuti, nama karyawan, dan bulan/tahun.
    public function index(Request $request): Response
    {
        $filters = $request->only(['status', 'departemen_id', 'leave_type_id', 'search', 'bulan', 'tahun']);

        $leaveRequests = LeaveRequest::query()
            ->with(['user.role', 'user.departemen', 'leaveType'])
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['leave_type_id'] ?? null, function ($query, $leaveTypeId) {
                $query->where('leave_type_id', $leaveTypeId);
            })
            ->when($filters['departemen_id'] ?? null, function ($query, $departemenId) {
                $query->whereHas('user', fn ($q) => $q->where('departemen_id', $departemenId));
            })
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            })
            ->when($filters['bulan'] ?? null, function ($query, $bulan) {
                $query->whereMonth('tanggal_mulai', $bulan);
            })
            ->when($filters['tahun'] ?? null, function ($query, $tahun) {
                $query->whereYear('tanggal_mulai', $tahun);
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Sdm/LeaveMonitoring/Index', [
            'leaveRequests' => $leaveRequests,
            'departemens' => Departemen::all(['id', 'nama_departemen']),
            'leaveTypes' => LeaveType::all(['id', 'nama_cuti']),
            'filters' => $filters,
        ]);
    }
}