import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ leaveRequests }) {
    const batalkan = (id) => {
        if (confirm('Batalkan pengajuan cuti ini?')) {
            router.delete(route('leave-requests.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Riwayat Pengajuan Cuti</h2>}
        >
            <Head title="Riwayat Cuti" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl space-y-4 sm:px-6 lg:px-8">

                    <div className="flex justify-end">
                        <Link
                            href={route('leave-requests.create')}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Ajukan Cuti Baru
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
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
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            Belum ada pengajuan cuti.
                                        </td>
                                    </tr>
                                )}

                                {leaveRequests.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
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
                                            {item.status === 'pending' && (
                                                <button
                                                    onClick={() => batalkan(item.id)}
                                                    className="ml-3 text-red-600 hover:underline"
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

                    {leaveRequests.links && (
                        <div className="flex flex-wrap gap-1">
                            {leaveRequests.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
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
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${style[status] ?? 'bg-gray-100 text-gray-800'}`}>
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