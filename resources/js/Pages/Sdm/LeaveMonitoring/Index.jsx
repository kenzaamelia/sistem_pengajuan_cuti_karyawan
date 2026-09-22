import DangerButton from '@/Components/DangerButton';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import StatusBadge from '@/Components/StatusBadge';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggalSingkat } from '@/Utils/formatTanggal';
import { labelJenisCuti } from '@/Utils/leaveType';
import { labelPeran } from '@/Utils/role';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function Index({ leaveRequests, departemens, leaveTypes, filters }) {
    const [form, setForm] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
        departemen_id: filters.departemen_id ?? '',
        leave_type_id: filters.leave_type_id ?? '',
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? '',
    });

    // Modal pembatalan (dipakai bareng oleh tampilan tabel & card)
    const [targetBatal, setTargetBatal] = useState(null);
    const [alasanPembatalan, setAlasanPembatalan] = useState('');
    const [memproses, setMemproses] = useState(false);

    const bisaDikelola = (item) => item.sumber !== 'cuti_bersama' && item.status !== 'dibatalkan';

    const bukaModalBatal = (item) => {
        setTargetBatal(item);
        setAlasanPembatalan('');
    };

    const konfirmasiBatal = () => {
        if (!alasanPembatalan.trim()) {
            alert('Alasan pembatalan wajib diisi.');
            return;
        }

        setMemproses(true);

        router.post(
            route('sdm.leave-requests.cancel', targetBatal.id),
            { alasan_pembatalan: alasanPembatalan },
            {
                preserveScroll: true,
                onFinish: () => setMemproses(false),
                onSuccess: () => setTargetBatal(null),
            }
        );
    };

    const terapkanFilter = (e) => {
        e.preventDefault();

        // Buang filter yang kosong supaya query string tetap rapi
        const query = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''));

        router.get(route('monitoring.index'), query, { preserveState: true, replace: true });
    };

    const resetFilter = () => {
        const kosong = { search: '', status: '', departemen_id: '', leave_type_id: '', bulan: '', tahun: '' };
        setForm(kosong);
        router.get(route('monitoring.index'), {}, { preserveState: true, replace: true });
    };

    const kosong = leaveRequests.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Monitoring Pengajuan Cuti
                </h2>
            }
        >
            <Head title="Monitoring Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {/* Filter */}
                    <form
                        onSubmit={terapkanFilter}
                        className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
                    >
                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-600">
                                Cari nama karyawan
                            </label>
                            <input
                                type="text"
                                value={form.search}
                                onChange={(e) => setForm({ ...form, search: e.target.value })}
                                placeholder="Nama karyawan..."
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Departemen</label>
                            <select
                                value={form.departemen_id}
                                onChange={(e) => setForm({ ...form, departemen_id: e.target.value })}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            >
                                <option value="">Semua Departemen</option>
                                {departemens.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.nama_departemen}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Jenis Cuti</label>
                            <select
                                value={form.leave_type_id}
                                onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            >
                                <option value="">Semua Jenis</option>
                                {leaveTypes.map((lt) => (
                                    <option key={lt.id} value={lt.id}>
                                        {labelJenisCuti(lt.nama_cuti)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                                <option value="dibatalkan">Dibatalkan</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Bulan</label>
                            <select
                                value={form.bulan}
                                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            >
                                <option value="">Semua Bulan</option>
                                {NAMA_BULAN.map((nama, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Tahun</label>
                            <input
                                type="number"
                                value={form.tahun}
                                onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                                placeholder={new Date().getFullYear()}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            />
                        </div>

                        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                            <PrimaryButton type="submit" className="w-full sm:w-auto">
                                Terapkan
                            </PrimaryButton>
                            <SecondaryButton type="button" onClick={resetFilter} className="w-full sm:w-auto">
                                Reset
                            </SecondaryButton>
                        </div>
                    </form>

                    <p className="text-sm text-slate-500">
                        Menampilkan {leaveRequests.total} pengajuan cuti
                    </p>

                    {kosong ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                            Tidak ada pengajuan cuti yang cocok dengan filter.
                        </div>
                    ) : (
                        <>
                            {/* ===== Tampilan tabel — hanya di layar sm ke atas ===== */}
                            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <Th>Karyawan</Th>
                                                <Th>Departemen</Th>
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
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                                                        <div className="font-medium">{item.user.name}</div>
                                                        <div className="text-xs text-slate-400">
                                                            {labelPeran(item.user.role?.nama_role, item.user.jabatan)}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                        {item.user.departemen?.nama_departemen ?? '-'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
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
                                                        <div className="flex items-center gap-3">
                                                            <Link
                                                                href={route('leave-requests.show', item.id)}
                                                                className="font-medium text-brand-600 hover:text-brand-700"
                                                            >
                                                                Detail
                                                            </Link>
                                                            {bisaDikelola(item) && (
                                                                <>
                                                                    <Link
                                                                        href={route('sdm.leave-requests.edit', item.id)}
                                                                        className="font-medium text-slate-500 hover:text-slate-700"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => bukaModalBatal(item)}
                                                                        className="font-medium text-red-600 hover:text-red-700"
                                                                    >
                                                                        Batalkan
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ===== Tampilan card — hanya di layar mobile ===== */}
                            <div className="space-y-3 sm:hidden">
                                {leaveRequests.data.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-display text-sm font-bold text-slate-900">{item.user.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {labelPeran(item.user.role?.nama_role, item.user.jabatan)}
                                                    {item.user.departemen && ` • ${item.user.departemen.nama_departemen}`}
                                                </p>
                                            </div>
                                            <StatusBadge status={item.status} />
                                        </div>

                                        <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                            <dt className="text-slate-400">Jenis Cuti</dt>
                                            <dd className="text-right text-slate-700">
                                                {labelJenisCuti(item.leave_type.nama_cuti)}
                                            </dd>

                                            <dt className="text-slate-400">Tanggal</dt>
                                            <dd className="text-right text-slate-700">
                                                {formatTanggalSingkat(item.tanggal_mulai)} — {formatTanggalSingkat(item.tanggal_selesai)}
                                            </dd>

                                            <dt className="text-slate-400">Jumlah Hari</dt>
                                            <dd className="text-right text-slate-700">{item.jumlah_hari} hari</dd>
                                        </dl>

                                        <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm font-medium">
                                            <Link href={route('leave-requests.show', item.id)} className="text-brand-600">
                                                Detail
                                            </Link>
                                            {bisaDikelola(item) && (
                                                <>
                                                    <Link
                                                        href={route('sdm.leave-requests.edit', item.id)}
                                                        className="text-slate-500"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button onClick={() => bukaModalBatal(item)} className="text-red-600">
                                                        Batalkan
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {leaveRequests.links && !kosong && (
                        <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
                            {leaveRequests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveScroll
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

            {/* Modal konfirmasi pembatalan */}
            {targetBatal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
                    <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-6">
                        <h3 className="font-display text-base font-bold text-slate-900">
                            Batalkan pengajuan cuti {targetBatal.user.name}?
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {targetBatal.status === 'disetujui'
                                ? 'Pengajuan ini sudah disetujui — saldo cuti karyawan akan otomatis dikembalikan.'
                                : 'Pengajuan ini akan ditandai dibatalkan.'}
                        </p>

                        <label className="mb-1 mt-3 block text-sm font-medium text-slate-700">
                            Alasan pembatalan
                        </label>
                        <textarea
                            value={alasanPembatalan}
                            onChange={(e) => setAlasanPembatalan(e.target.value)}
                            rows={2}
                            autoFocus
                            className="block w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                            placeholder="Contoh: Karyawan mengundurkan diri, kesalahan input, dll."
                        />

                        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <SecondaryButton onClick={() => setTargetBatal(null)}>Batal</SecondaryButton>
                            <DangerButton onClick={konfirmasiBatal} disabled={memproses}>
                                {memproses ? 'Memproses...' : 'Ya, Batalkan Pengajuan'}
                            </DangerButton>
                        </div>
                    </div>
                </div>
            )}
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