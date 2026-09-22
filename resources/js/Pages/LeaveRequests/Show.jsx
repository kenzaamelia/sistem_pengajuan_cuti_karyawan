import DangerButton from '@/Components/DangerButton';
import { IconArrowRight } from '@/Components/Icons';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggal, formatTanggalWaktu } from '@/Utils/formatTanggal';
import { labelJenisCuti } from '@/Utils/leaveType';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ leaveRequest, canManageAsSdm }) {
    const [formBatalTerbuka, setFormBatalTerbuka] = useState(false);
    const [alasanPembatalan, setAlasanPembatalan] = useState('');
    const [memproses, setMemproses] = useState(false);

    const isGambar = leaveRequest.bukti_cuti && /\.(jpe?g|png)$/i.test(leaveRequest.bukti_cuti);
    // Jaga-jaga ada data lama yang nyasar berisi "0" atau string kosong,
    // bukan cuma null — filter eksplisit supaya tidak coba render link rusak.
    const punyaBuktiCuti = leaveRequest.bukti_cuti && leaveRequest.bukti_cuti !== '0';
    const buktiCutiUrl = punyaBuktiCuti ? `/storage/${leaveRequest.bukti_cuti}` : null;

    // Catatan: relasi Eloquent `dibatalkanOleh()` di-load lewat key 'dibatalkan_oleh',
    // jadi setelah dimuat, `leaveRequest.dibatalkan_oleh` berisi objek User (bukan lagi id mentah).
    const dibatalkanOlehUser = leaveRequest.dibatalkan_oleh;

    const batalkan = () => {
        if (!alasanPembatalan.trim()) {
            alert('Alasan pembatalan wajib diisi.');
            return;
        }

        setMemproses(true);

        router.post(
            route('sdm.leave-requests.cancel', leaveRequest.id),
            { alasan_pembatalan: alasanPembatalan },
            {
                preserveScroll: true,
                onFinish: () => setMemproses(false),
                onSuccess: () => {
                    setFormBatalTerbuka(false);
                    setAlasanPembatalan('');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Detail Pengajuan Cuti
                </h2>
            }
        >
            <Head title="Detail Pengajuan Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {/* Header gradient ringkas: jenis cuti + status */}
                        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-brand-600 to-sprout-500 px-5 py-4 sm:px-6">
                            <h3 className="font-display text-lg font-bold text-white">
                                {labelJenisCuti(leaveRequest.leave_type.nama_cuti)}
                            </h3>
                            <StatusBadge status={leaveRequest.status} />
                        </div>

                        <div className="space-y-4 p-5 sm:p-6">
                            {leaveRequest.user && (
                                <div className="rounded-xl bg-slate-50 p-3.5 text-sm">
                                    <p className="font-semibold text-slate-900">{leaveRequest.user.name}</p>
                                    <p className="text-slate-500">
                                        {leaveRequest.user.departemen?.nama_departemen ?? '-'}
                                    </p>
                                </div>
                            )}

                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-slate-500">Tanggal Mulai</dt>
                                    <dd className="mt-0.5 font-medium text-slate-900">{formatTanggal(leaveRequest.tanggal_mulai)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Tanggal Selesai</dt>
                                    <dd className="mt-0.5 font-medium text-slate-900">{formatTanggal(leaveRequest.tanggal_selesai)}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Jumlah Hari</dt>
                                    <dd className="mt-0.5 font-medium text-slate-900">{leaveRequest.jumlah_hari} hari</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-500">Sumber</dt>
                                    <dd className="mt-0.5 font-medium text-slate-900">
                                        {leaveRequest.sumber === 'cuti_bersama' ? 'Cuti Bersama' : 'Pengajuan Manual'}
                                    </dd>
                                </div>
                            </dl>

                            {leaveRequest.alasan && (
                                <div>
                                    <dt className="text-sm text-slate-500">Alasan</dt>
                                    <dd className="mt-1 text-sm text-slate-900">{leaveRequest.alasan}</dd>
                                </div>
                            )}

                            {leaveRequest.status === 'dibatalkan' && (
                                <div className="rounded-xl bg-slate-100 p-3.5">
                                    <p className="text-sm font-semibold text-slate-700">Dibatalkan oleh SDM</p>
                                    {dibatalkanOlehUser?.name && (
                                        <p className="text-sm text-slate-600">Oleh: {dibatalkanOlehUser.name}</p>
                                    )}
                                    {leaveRequest.alasan_pembatalan && (
                                        <p className="mt-1 text-sm text-slate-600">
                                            Alasan: {leaveRequest.alasan_pembatalan}
                                        </p>
                                    )}
                                    {leaveRequest.dibatalkan_pada && (
                                        <p className="mt-1 text-xs text-slate-400">
                                            {formatTanggalWaktu(leaveRequest.dibatalkan_pada)}
                                        </p>
                                    )}
                                </div>
                            )}

                            {buktiCutiUrl && (
                                <div>
                                    <dt className="mb-2 text-sm text-slate-500">Bukti Cuti</dt>
                                    {isGambar ? (
                                        <a href={buktiCutiUrl} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={buktiCutiUrl}
                                                alt="Bukti cuti"
                                                className="max-h-64 rounded-xl border border-slate-200"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            href={buktiCutiUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                                        >
                                            Lihat dokumen bukti cuti (PDF)
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* ===== Aksi khusus SDM ===== */}
                            {canManageAsSdm && (
                                <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row">
                                    <Link
                                        href={route('sdm.leave-requests.edit', leaveRequest.id)}
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Edit Pengajuan
                                    </Link>
                                    <DangerButton onClick={() => setFormBatalTerbuka(!formBatalTerbuka)}>
                                        Batalkan Pengajuan
                                    </DangerButton>
                                </div>
                            )}

                            {formBatalTerbuka && (
                                <div className="rounded-xl bg-red-50 p-4">
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Alasan pembatalan
                                    </label>
                                    <textarea
                                        value={alasanPembatalan}
                                        onChange={(e) => setAlasanPembatalan(e.target.value)}
                                        rows={2}
                                        className="block w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                        placeholder="Contoh: Karyawan mengundurkan diri, kesalahan input, dll."
                                    />
                                    <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <button
                                            onClick={() => {
                                                setFormBatalTerbuka(false);
                                                setAlasanPembatalan('');
                                            }}
                                            className="rounded-lg px-3 py-2 text-sm text-slate-600"
                                        >
                                            Batal
                                        </button>
                                        <DangerButton onClick={batalkan} disabled={memproses}>
                                            {memproses ? 'Memproses...' : 'Konfirmasi Pembatalan'}
                                        </DangerButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <h3 className="mb-4 font-display text-base font-bold text-slate-900">Riwayat Approval</h3>

                        {leaveRequest.approvals.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada riwayat approval.</p>
                        ) : (
                            <ul className="space-y-3">
                                {leaveRequest.approvals.map((approval) => (
                                    <li
                                        key={approval.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3.5 sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                Level {approval.level_approval} — {approval.approver.name}
                                            </p>
                                            {approval.catatan && (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Catatan: {approval.catatan}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-slate-400">
                                                {formatTanggalWaktu(approval.diproses_pada)}
                                            </p>
                                        </div>
                                        <StatusBadge status={approval.status} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <Link
                        href={route('leave-requests.index')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                        <IconArrowRight className="h-4 w-4 rotate-180" />
                        Kembali ke riwayat pengajuan
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}