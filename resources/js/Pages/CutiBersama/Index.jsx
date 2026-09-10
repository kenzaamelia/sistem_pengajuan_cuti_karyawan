import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Index({ jadwal }) {
    const publish = (id) => {
        if (confirm('Publish jadwal ini? Saldo cuti semua peserta akan langsung terpotong.')) {
            router.post(route('cuti-bersama.publish', id), {}, { preserveScroll: true });
        }
    };

    const batalkan = (id) => {
        if (confirm('Batalkan cuti bersama ini? Semua saldo yang sudah terpotong akan dikembalikan.')) {
            router.post(route('cuti-bersama.cancel', id), {}, { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Cuti Bersama</h2>}
        >
            <Head title="Cuti Bersama" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl space-y-4 sm:px-6 lg:px-8">

                    <div className="flex justify-end">
                        <Link
                            href={route('cuti-bersama.create')}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            Buat Jadwal Baru
                        </Link>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <Th>Nama</Th>
                                    <Th>Tanggal</Th>
                                    <Th>Peserta</Th>
                                    <Th>Dibuat Oleh</Th>
                                    <Th>Status</Th>
                                    <Th>Aksi</Th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {jadwal.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            Belum ada jadwal cuti bersama.
                                        </td>
                                    </tr>
                                )}

                                {jadwal.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {item.nama_cuti_bersama}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {item.tanggal_mulai} — {item.tanggal_selesai}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {item.participants_count} orang
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {item.pembuat.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            {item.status === 'draft' ? (
                                                <button
                                                    onClick={() => publish(item.id)}
                                                    className="text-green-600 hover:underline"
                                                >
                                                    Publish
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => batalkan(item.id)}
                                                    className="text-red-600 hover:underline"
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

                    {jadwal.links && (
                        <div className="flex flex-wrap gap-1">
                            {jadwal.links.map((link, i) => (
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
        draft: 'bg-gray-100 text-gray-800',
        published: 'bg-green-100 text-green-800',
    };

    const label = {
        draft: 'Draft',
        published: 'Published',
    };

    return (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${style[status] ?? 'bg-gray-100 text-gray-800'}`}>
            {label[status] ?? status}
        </span>
    );
}