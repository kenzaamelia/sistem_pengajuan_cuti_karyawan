<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\CutiBersamaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LeaveMonitoringController;
use App\Http\Controllers\LeaveReportController;
use App\Http\Controllers\LeaveRequestAdminController;
use App\Http\Controllers\LeaveRequestController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::middleware('auth')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Route bawaan Breeze untuk halaman profil (jangan dihapus)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Pengajuan cuti (karyawan pelaksana & karyawan pimpinan)
    Route::resource('leave-requests', LeaveRequestController::class)
        ->except(['edit', 'update']);

    // Approval cuti (asisten manajer, manajer, general manager)
    Route::middleware('role:karyawan_pimpinan,general_manager')
        ->prefix('approvals')->name('approvals.')->group(function () {
            Route::get('/', [ApprovalController::class, 'index'])->name('index');
            Route::post('/{leaveRequest}/approve', [ApprovalController::class, 'approve'])->name('approve');
            Route::post('/{leaveRequest}/reject', [ApprovalController::class, 'reject'])->name('reject');
        });

    // Cuti bersama (khusus SDM)
    Route::middleware('role:sdm')
        ->prefix('cuti-bersama')->name('cuti-bersama.')->group(function () {
            Route::get('/', [CutiBersamaController::class, 'index'])->name('index');
            Route::get('/create', [CutiBersamaController::class, 'create'])->name('create');
            Route::post('/', [CutiBersamaController::class, 'store'])->name('store');
            Route::post('/{cutiBersama}/publish', [CutiBersamaController::class, 'publish'])->name('publish');
            Route::post('/{cutiBersama}/cancel', [CutiBersamaController::class, 'cancel'])->name('cancel');
        });

    // Monitoring seluruh pengajuan cuti lintas departemen (khusus SDM)
    Route::middleware('role:sdm')
        ->prefix('monitoring-cuti')->name('monitoring.')->group(function () {
            Route::get('/', [LeaveMonitoringController::class, 'index'])->name('index');
        });

    // Edit & batalkan cuti karyawan oleh SDM
    Route::middleware('role:sdm')
        ->prefix('sdm/leave-requests')->name('sdm.leave-requests.')->group(function () {
            Route::get('/{leaveRequest}/edit', [LeaveRequestAdminController::class, 'edit'])->name('edit');
            Route::put('/{leaveRequest}', [LeaveRequestAdminController::class, 'update'])->name('update');
            Route::post('/{leaveRequest}/cancel', [LeaveRequestAdminController::class, 'cancel'])->name('cancel');
        });

    // Laporan bulanan cuti (rekap per departemen & jenis cuti), khusus SDM
    Route::middleware('role:sdm')
        ->prefix('laporan-bulanan')->name('laporan.')->group(function () {
            Route::get('/', [LeaveReportController::class, 'index'])->name('index');
            Route::get('/export/excel', [LeaveReportController::class, 'exportExcel'])->name('export.excel');
            Route::get('/export/pdf', [LeaveReportController::class, 'exportPdf'])->name('export.pdf');
        });
});

require __DIR__.'/auth.php';