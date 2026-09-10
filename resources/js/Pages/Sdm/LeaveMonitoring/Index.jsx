import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ leaveRequests, departemens, leaveTypes, filters }) {
    const [form, setForm] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
        departemen_id: filters.departemen_id ?? '',
        leave_type_id: filters.leave_type_id ?? '',
        bulan: filters.bulan ?? '',
        tahun: filters.tahun ?? '',
    });

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

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
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
                        className="grid grid-cols-1 gap-3 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
                    >
                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Cari nama karyawan
                            </label>
                            <input
                                type="text"
                                value={form.search}
                                onChange={(e) => setForm({ ...form, search: e.target.value })}
                                placeholder="Nama karyawan..."
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Departemen</label>
                            <select
                                value={form.departemen_id}
                                onChange={(e) => setForm({ ...form, departemen_id: e.target.value })}
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                            <label className="mb-1 block text-xs font-medium text-gray-600">Jenis Cuti</label>
                            <select
                                value={form.leave_type_id}
                                onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Jenis</option>
                                {leaveTypes.map((lt) => (
                                    <option key={lt.id} value={lt.id}>
                                        {formatNamaCuti(lt.nama_cuti)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu</option>
                                <option value="disetujui">Disetujui</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Bulan</label>
                            <select
                                value={form.bulan}
                                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Semua Bulan</option>
                                {namaBulan.map((nama, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Tahun</label>
                            <input
                                type="number"
                                value={form.tahun}
                                onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                                placeholder={new Date().getFullYear()}
                                className="w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                            <button
                                type="submit"
                                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto"
                            >
                                Terapkan
                            </button>
                            <button
                                type="button"
                                onClick={resetFilter}
                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:w-auto"
                            >
                                Reset
                            </button>
                        </div>
                    </form>

                    <p className="text-sm text-gray-500">
                        Menampilkan {leaveRequests.total} pengajuan cuti
                    </p>

                    {/* ===== Tampilan tabel — hanya di layar sm ke atas ===== */}
                    <div className="hidden overflow-hidden rounded-lg bg-white shadow-sm sm:block">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
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
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {leaveRequests.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                                Tidak ada pengajuan cuti yang cocok dengan filter.
                                            </td>
                                        </tr>
                                    )}

                                    {leaveRequests.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {item.user.name}
                                                <div className="text-xs text-gray-400">
                                                    {formatRole(item.user.role?.nama_role, item.user.jabatan)}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {item.user.departemen?.nama_departemen ?? '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {formatNamaCuti(item.leave_type.nama_cuti)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {item.tanggal_mulai} — {item.tanggal_selesai}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {item.jumlah_hari} hari
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <Link
                                                    href={route('leave-requests.show', item.id)}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ===== Tampilan card — hanya di layar mobile ===== */}
                    <div className="space-y-3 sm:hidden">
                        {leaveRequests.data.length === 0 && (
                            <div className="rounded-lg bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                                Tidak ada pengajuan cuti yang cocok dengan filter.
                            </div>
                        )}

                        {leaveRequests.data.map((item) => (
                            <div key={item.id} className="rounded-lg bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.user.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {formatRole(item.user.role?.nama_role, item.user.jabatan)}
                                            {item.user.departemen && ` • ${item.user.departemen.nama_departemen}`}
                                        </p>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                                    <dt className="text-gray-400">Jenis Cuti</dt>
                                    <dd className="text-right text-gray-700">
                                        {formatNamaCuti(item.leave_type.nama_cuti)}
                                    </dd>

                                    <dt className="text-gray-400">Tanggal</dt>
                                    <dd className="text-right text-gray-700">
                                        {item.tanggal_mulai} — {item.tanggal_selesai}
                                    </dd>

                                    <dt className="text-gray-400">Jumlah Hari</dt>
                                    <dd className="text-right text-gray-700">{item.jumlah_hari} hari</dd>
                                </dl>

                                <Link
                                    href={route('leave-requests.show', item.id)}
                                    className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
                                >
                                    Lihat Detail →
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {leaveRequests.links && (
                        <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
                            {leaveRequests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveScroll
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`rounded px-3 py-1 text-sm ${
                                        link.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
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

const namaBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function Th({ children }) {
    return (
        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            {children}
        </th>
    );
}

function StatusBadge({ status }) {
    const style = {
        pending: 'bg-yellow-100 text-yellow-800',
        disetujui: 'bg-green-100 text-green-800',
        ditolak: 'bg-red-100 text-red-800',
    };

    const label = {
        pending: 'Menunggu',
        disetujui: 'Disetujui',
        ditolak: 'Ditolak',
    };

    return (
        <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${style[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {label[status] ?? status}
        </span>
    );
}

function formatNamaCuti(namaCuti) {
    const label = {
        cuti_tahunan: 'Cuti Tahunan',
        cuti_panjang: 'Cuti Panjang',
        cuti_bersama: 'Cuti Bersama',
    };

    return label[namaCuti] ?? namaCuti;
}

function formatRole(namaRole, jabatan) {
    if (namaRole === 'karyawan_pimpinan') {
        return jabatan === 'manajer' ? 'Manajer' : 'Asisten Manajer';
    }

    const label = {
        karyawan_pelaksana: 'Karyawan Pelaksana',
        sdm: 'SDM',
        general_manager: 'General Manager',
    };

    return label[namaRole] ?? (namaRole ?? '-');
}