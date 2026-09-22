import Dropdown from '@/Components/Dropdown';
import {
    IconBarChart,
    IconCalendar,
    IconChevronDown,
    IconClipboard,
    IconGrid,
    IconLogout,
    IconMenu,
    IconReport,
    IconUser,
    IconX,
} from '@/Components/Icons';
import { labelPeran } from '@/Utils/role';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Menu navigasi disusun sesuai role & jabatan user yang sedang login.
// Setiap item hanya muncul untuk role yang berhak mengaksesnya (selaras
// dengan middleware 'role' di routes/web.php).
function useMenuNavigasi(user) {
    const namaRole = user.role?.nama_role;

    const menu = [
        { href: route('dashboard'), label: 'Dashboard', current: 'dashboard', icon: IconGrid },
    ];

    // Karyawan pelaksana & karyawan pimpinan: bisa mengajukan & melihat riwayat cuti sendiri
    if (namaRole === 'karyawan_pelaksana' || namaRole === 'karyawan_pimpinan') {
        menu.push({
            href: route('leave-requests.index'),
            label: 'Pengajuan Cuti Saya',
            current: 'leave-requests.*',
            icon: IconClipboard,
        });
    }

    // Karyawan pimpinan (asisten manajer & manajer) dan General Manager: approver
    if (namaRole === 'karyawan_pimpinan' || namaRole === 'general_manager') {
        menu.push({
            href: route('approvals.index'),
            label: 'Approval Cuti',
            current: 'approvals.*',
            icon: IconClipboard,
        });
    }

    // Khusus SDM: monitoring lintas departemen, kelola cuti bersama, laporan bulanan
    if (namaRole === 'sdm') {
        menu.push(
            {
                href: route('monitoring.index'),
                label: 'Monitoring Cuti',
                current: 'monitoring.*',
                icon: IconBarChart,
            },
            {
                href: route('cuti-bersama.index'),
                label: 'Cuti Bersama',
                current: 'cuti-bersama.*',
                icon: IconCalendar,
            },
            {
                href: route('laporan.index'),
                label: 'Laporan Bulanan',
                current: 'laporan.*',
                icon: IconReport,
            },
        );
    }

    return menu;
}

function InisialNama({ nama }) {
    return (nama ?? '?').trim().charAt(0).toUpperCase();
}

// Isi sidebar (dipakai untuk versi desktop yang persistent maupun drawer mobile).
function IsiSidebar({ user, menu, onNavigate }) {
    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-2.5 px-6 py-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300 to-emerald-300 font-display text-base font-extrabold text-slate-900 shadow-lg shadow-black/20">
                    C
                </span>
                <span className="font-display text-lg font-extrabold tracking-tight text-white">
                    CutiKu
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-3">
                {menu.map((item) => {
                    const aktif = route().current(item.current);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={
                                'flex items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-sm font-semibold transition ' +
                                (aktif
                                    ? 'border-emerald-400 bg-gradient-to-r from-sky-500/25 to-emerald-400/25 text-white'
                                    : 'border-transparent text-blue-100/75 hover:border-white/20 hover:bg-white/10 hover:text-white')
                            }
                        >
                            <Icon className="h-5 w-5 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-white/10 px-3.5 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-sprout-400 font-display text-sm font-bold text-white">
                    <InisialNama nama={user.name} />
                </span>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-blue-100/70">
                        {labelPeran(user.role?.nama_role, user.jabatan)}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const menuNavigasi = useMenuNavigasi(user);
    const [sidebarMobileTerbuka, setSidebarMobileTerbuka] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 lg:flex">
            {/* ===== Sidebar desktop (persistent) ===== */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-gradient-to-b lg:from-[#0B2A4A] lg:via-[#0C2E44] lg:to-[#0B3B33]">
                <IsiSidebar user={user} menu={menuNavigasi} />
            </aside>

            {/* ===== Sidebar mobile (drawer) ===== */}
            {sidebarMobileTerbuka && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60"
                        onClick={() => setSidebarMobileTerbuka(false)}
                    />
                    <div className="relative flex h-full w-72 flex-col bg-gradient-to-b from-[#0B2A4A] via-[#0C2E44] to-[#0B3B33] shadow-xl">
                        <button
                            onClick={() => setSidebarMobileTerbuka(false)}
                            className="absolute right-3 top-4 rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            <IconX className="h-5 w-5" />
                        </button>
                        <IsiSidebar
                            user={user}
                            menu={menuNavigasi}
                            onNavigate={() => setSidebarMobileTerbuka(false)}
                        />
                    </div>
                </div>
            )}

            {/* ===== Konten utama ===== */}
            <div className="flex flex-1 flex-col lg:pl-64">
                <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarMobileTerbuka(true)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <IconMenu className="h-6 w-6" />
                    </button>

                    <div className="min-w-0 flex-1">{header}</div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                            >
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-sprout-500 font-display text-sm font-bold text-white">
                                    <InisialNama nama={user.name} />
                                </span>
                                <span className="hidden sm:inline">{user.name}</span>
                                <IconChevronDown className="h-4 w-4 text-slate-400" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                <span className="flex items-center gap-2">
                                    <IconUser className="h-4 w-4" /> Profil Saya
                                </span>
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                <span className="flex items-center gap-2">
                                    <IconLogout className="h-4 w-4" /> Keluar
                                </span>
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}