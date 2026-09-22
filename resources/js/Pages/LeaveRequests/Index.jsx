import { IconArrowRight, IconClipboard } from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggalSingkat } from '@/Utils/formatTanggal';
import { labelJenisCuti } from '@/Utils/leaveType';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ leaveRequests }) {
    const batalkan = (id) => {
        if (confirm('Batalkan pengajuan cuti ini?')) {
            router.delete(route('leave-requests.destroy', id));
        }
    };

    const kosong = leaveRequests.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Riwayat Pengajuan Cuti
                </h2>
            }
        >
            <Head title="Riwayat Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-5xl space-y-4 px-4 sm:px-6 lg:px-8">

                    <div className="flex justify-end">
                        <Link
                            href={route('leave-requests.create')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-sprout-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md"
                        >
                            <IconClipboard className="h-4 w-4" />
                            Ajukan Cuti Baru
                        </Link>
                    </div>

                    {kosong ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* ===== Tabel desktop ===== */}
                            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <Th>Jenis Cuti</Th>
                                            <Th>Tanggal</Th>
                                            <Th>Jumlah Hari</Th>
                                            <Th>Status</Th>
                                            <Th>Aksi</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {leaveRequests.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                                    {labelJenisCuti(item.leave_type.nama_cuti)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                    {formatTanggalSingkat(item.tanggal_mulai)} — {formatTanggalSingkat(item.tanggal_selesai)}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                    {item.jumlah_hari} hari
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <Link
                                                        href={route('leave-requests.show', item.id)}
                                                        className="font-medium text-brand-600 hover:text-brand-700"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {item.status === 'pending' && (
                                                        <button
                                                            onClick={() => batalkan(item.id)}
                                                            className="ml-4 font-medium text-red-600 hover:text-red-700"
                                                        >
                                                            Batalkan
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* ===== Kartu mobile ===== */}
                            <div className="space-y-3 sm:hidden">
                                {leaveRequests.data.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-display text-sm font-bold text-slate-900">
                                                    {labelJenisCuti(item.leave_type.nama_cuti)}
                                                </p>
                                                <p className="mt-0.5 text-sm text-slate-500">
                                                    {formatTanggalSingkat(item.tanggal_mulai)} — {formatTanggalSingkat(item.tanggal_selesai)}
                                                </p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <span className="text-sm text-slate-500">{item.jumlah_hari} hari</span>
                                            <div className="flex items-center gap-4 text-sm font-medium">
                                                <Link href={route('leave-requests.show', item.id)} className="text-brand-600">
                                                    Detail
                                                </Link>
                                                {item.status === 'pending' && (
                                                    <button onClick={() => batalkan(item.id)} className="text-red-600">
                                                        Batalkan
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {leaveRequests.links && !kosong && (
                        <div className="flex flex-wrap gap-1">
                            {leaveRequests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded-lg px-3 py-1.5 text-sm ${
                                        link.active
                                            ? 'bg-gradient-to-r from-brand-600 to-sprout-500 font-semibold text-white'
                                            : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Th({ children }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <IconClipboard className="h-6 w-6" />
            </span>
            <p className="mt-4 font-display text-base font-bold text-slate-900">Belum ada pengajuan cuti</p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
                Pengajuan cuti yang Anda buat akan muncul di sini beserta status persetujuannya.
            </p>
            <Link
                href={route('leave-requests.create')}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
                Ajukan cuti pertama Anda
                <IconArrowRight className="h-4 w-4" />
            </Link>
        </div>
    );
}