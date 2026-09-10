import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ leaveRequests }) {
    const [formTolakTerbuka, setFormTolakTerbuka] = useState(null); // id leave_request yang lagi buka form tolak
    const [catatan, setCatatan] = useState('');

    const setujui = (id) => {
        if (confirm('Setujui pengajuan cuti ini?')) {
            router.post(route('approvals.approve', id), {}, { preserveScroll: true });
        }
    };

    const tolak = (id) => {
        if (!catatan.trim()) {
            alert('Catatan alasan penolakan wajib diisi.');
            return;
        }

        router.post(
            route('approvals.reject', id),
            { catatan },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setFormTolakTerbuka(null);
                    setCatatan('');
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Approval Cuti</h2>}
        >
            <Head title="Approval Cuti" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <Th>Pemohon</Th>
                                    <Th>Jenis Cuti</Th>
                                    <Th>Tanggal</Th>
                                    <Th>Jumlah Hari</Th>
                                    <Th>Level</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {leaveRequests.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            Tidak ada pengajuan yang menunggu approval Anda.
                                        </td>
                                    </tr>
                                )}

                                {leaveRequests.data.map((item) => (
                                    <>
                                        <tr key={item.id}>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                <div>{item.user.name}</div>
                                                <div className="text-xs text-gray-400">
                                                    {item.user.departemen?.nama_departemen}
                                                </div>
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
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                Level {item.level_approval_saat_ini}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <Link
                                                    href={route('leave-requests.show', item.id)}
                                                    className="mr-3 text-gray-600 hover:underline"
                                                >
                                                    Detail
                                                </Link>
                                                <button
                                                    onClick={() => setujui(item.id)}
                                                    className="mr-3 text-green-600 hover:underline"
                                                >
                                                    Setujui
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setFormTolakTerbuka(
                                                            formTolakTerbuka === item.id ? null : item.id
                                                        )
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Tolak
                                                </button>
                                            </td>
                                        </tr>

                                        {formTolakTerbuka === item.id && (
                                            <tr>
                                                <td colSpan={6} className="bg-red-50 px-6 py-4">
                                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                                        Alasan penolakan
                                                    </label>
                                                    <textarea
                                                        value={catatan}
                                                        onChange={(e) => setCatatan(e.target.value)}
                                                        rows={2}
                                                        className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                                        placeholder="Wajib diisi..."
                                                    />
                                                    <div className="mt-2 flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setFormTolakTerbuka(null);
                                                                setCatatan('');
                                                            }}
                                                            className="rounded-md px-3 py-1 text-sm text-gray-600"
                                                        >
                                                            Batal
                                                        </button>
                                                        <button
                                                            onClick={() => tolak(item.id)}
                                                            className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                                        >
                                                            Kirim Penolakan
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
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

function formatNamaCuti(namaCuti) {
    const label = {
        cuti_tahunan: 'Cuti Tahunan',
        cuti_panjang: 'Cuti Panjang',
    };

    return label[namaCuti] ?? namaCuti;
}