import {
    IconAlertTriangle,
    IconArrowRight,
    IconBarChart,
    IconCalendar,
    IconClipboard,
    IconReport,
} from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { sapaanWaktu } from '@/Utils/role';
import { Head, Link, usePage } from '@inertiajs/react';

const TONE = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-500',
};

export default function Dashboard({ saldoCuti, jumlahPendingApproval, ringkasanSdm }) {
    const namaDepan = usePage().props.auth.user.name.split(' ')[0];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">

                    <div>
                        <p className="text-sm text-slate-500">
                            {sapaanWaktu()}, {namaDepan} 👋
                        </p>
                        <h1 className="mt-0.5 font-display text-2xl font-extrabold text-slate-900">
                            Ringkasan hari ini
                        </h1>
                    </div>

                    {saldoCuti && <PanelSaldoCuti saldoCuti={saldoCuti} />}

                    {jumlahPendingApproval !== undefined && (
                        <PanelApproval jumlah={jumlahPendingApproval} />
                    )}

                    {ringkasanSdm && <PanelSdm ringkasan={ringkasanSdm} />}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value, suffix, tone = 'blue', icon: Icon }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE[tone]}`}>
                    <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
            <p className="mt-4 font-display text-3xl font-extrabold text-slate-900">
                {value}
                {suffix && <span className="ml-1 text-base font-semibold text-slate-400">{suffix}</span>}
            </p>
        </div>
    );
}

function PanelSaldoCuti({ saldoCuti }) {
    return (
        <div>
            <h3 className="mb-3 font-display text-base font-bold text-slate-900">Sisa Cuti Anda</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                    label="Cuti Tahunan"
                    value={saldoCuti.cuti_tahunan.sisa}
                    suffix={`/ ${saldoCuti.cuti_tahunan.saldo_awal} hari`}
                    tone="blue"
                    icon={IconCalendar}
                />

                <StatCard
                    label="Cuti Panjang"
                    value={saldoCuti.cuti_panjang.tersedia ? saldoCuti.cuti_panjang.sisa : '—'}
                    suffix={saldoCuti.cuti_panjang.tersedia ? 'hari' : 'belum eligible'}
                    tone="green"
                    icon={IconCalendar}
                />

                <Link
                    href={route('leave-requests.create')}
                    className="group flex flex-col justify-between rounded-2xl bg-gradient-to-br from-brand-600 to-sprout-500 p-5 text-white shadow-glow transition hover:shadow-xl"
                >
                    <IconClipboard className="h-8 w-8 text-white/85" />
                    <div className="mt-4">
                        <p className="font-display text-base font-bold">Ajukan Cuti Baru</p>
                        <p className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                            Mulai sekarang
                            <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function PanelApproval({ jumlah }) {
    const perluTindakan = jumlah > 0;

    return (
        <div>
            <h3 className="mb-3 font-display text-base font-bold text-slate-900">Approval Cuti</h3>
            <Link
                href={route('approvals.index')}
                className={
                    'group flex flex-col gap-4 rounded-2xl p-6 shadow-sm transition sm:flex-row sm:items-center sm:justify-between ' +
                    (perluTindakan
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-900')
                }
            >
                <div className="flex items-center gap-4">
                    <span
                        className={
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ' +
                            (perluTindakan ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600')
                        }
                    >
                        <IconClipboard className="h-6 w-6" />
                    </span>
                    <div>
                        <p className="font-display text-2xl font-extrabold">{jumlah}</p>
                        <p className={'text-sm ' + (perluTindakan ? 'text-amber-50' : 'text-slate-500')}>
                            {perluTindakan
                                ? 'pengajuan cuti menunggu persetujuan Anda'
                                : 'tidak ada pengajuan yang menunggu — semua sudah ditindaklanjuti'}
                        </p>
                    </div>
                </div>

                <span
                    className={
                        'inline-flex items-center gap-1.5 self-start text-sm font-semibold sm:self-auto ' +
                        (perluTindakan ? 'text-white' : 'text-brand-600')
                    }
                >
                    Lihat daftar
                    <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
            </Link>
        </div>
    );
}

function PanelSdm({ ringkasan }) {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="mb-3 font-display text-base font-bold text-slate-900">Ringkasan SDM</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatCard label="Departemen" value={ringkasan.jumlah_departemen} tone="blue" icon={IconBarChart} />
                    <StatCard label="Karyawan Aktif" value={ringkasan.jumlah_karyawan} tone="green" icon={IconClipboard} />
                    <StatCard label="Cuti Bersama (Draft)" value={ringkasan.cuti_bersama_draft} tone="amber" icon={IconCalendar} />
                    <StatCard label="Cuti Bersama (Published)" value={ringkasan.cuti_bersama_published} tone="green" icon={IconCalendar} />
                </div>
            </div>

            {ringkasan.peserta_butuh_tindakan > 0 && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <IconAlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">
                        <span className="font-semibold">{ringkasan.peserta_butuh_tindakan} karyawan</span> tidak
                        memiliki saldo cukup saat cuti bersama dipublish dan butuh tindakan manual di halaman Cuti
                        Bersama.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <QuickLink
                    href={route('monitoring.index')}
                    icon={IconBarChart}
                    title="Monitoring Cuti"
                    deskripsi="Pantau seluruh pengajuan cuti lintas departemen"
                />
                <QuickLink
                    href={route('cuti-bersama.index')}
                    icon={IconCalendar}
                    title="Cuti Bersama"
                    deskripsi="Buat & kelola jadwal cuti bersama perusahaan"
                />
                <QuickLink
                    href={route('laporan.index')}
                    icon={IconReport}
                    title="Laporan Bulanan"
                    deskripsi="Rekap cuti per departemen, export Excel & PDF"
                />
            </div>
        </div>
    );
}

function QuickLink({ href, icon: Icon, title, deskripsi }) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{deskripsi}</p>
            </div>
            <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-500" />
        </Link>
    );
}