import { IconCalendar } from '@/Components/Icons';
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

    const kosong = jadwal.data.length === 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Cuti Bersama
                </h2>
            }
        >
            <Head title="Cuti Bersama" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">

                    <div className="flex justify-end">
                        <Link
                            href={route('cuti-bersama.create')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-sprout-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:shadow-md"
                        >
                            <IconCalendar className="h-4 w-4" />
                            Buat Jadwal Baru
                        </Link>
                    </div>

                    {kosong ? (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <IconCalendar className="h-6 w-6" />
                            </span>
                            <p className="mt-4 font-display text-base font-bold text-slate-900">
                                Belum ada jadwal cuti bersama
                            </p>
                            <p className="mt-1 max-w-xs text-sm text-slate-500">
                                Buat jadwal untuk memotong saldo cuti banyak karyawan sekaligus, mis. untuk libur Lebaran atau Natal.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ===== Tabel desktop ===== */}
                            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <Th>Nama</Th>
                                            <Th>Tanggal</Th>
                                            <Th>Peserta</Th>
                                            <Th>Dibuat Oleh</Th>
                                            <Th>Status</Th>
                                            <Th>Aksi</Th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {jadwal.data.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50/60">
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                                                    {item.nama_cuti_bersama}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                    {item.tanggal_mulai} — {item.tanggal_selesai}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                    {item.participants_count} orang
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                                                    {item.pembuat.name}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    <JadwalStatusBadge status={item.status} />
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                    {item.status === 'draft' ? (
                                                        <button
                                                            onClick={() => publish(item.id)}
                                                            className="font-medium text-emerald-600 hover:text-emerald-700"
                                                        >
                                                            Publish
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => batalkan(item.id)}
                                                            className="font-medium text-red-600 hover:text-red-700"
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
                                {jadwal.data.map((item) => (
                                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-display text-sm font-bold text-slate-900">
                                                {item.nama_cuti_bersama}
                                            </p>
                                            <JadwalStatusBadge status={item.status} />
                                        </div>

                                        <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
                                            <dt className="text-slate-500">Tanggal</dt>
                                            <dd className="text-right text-slate-700">
                                                {item.tanggal_mulai} — {item.tanggal_selesai}
                                            </dd>
                                            <dt className="text-slate-500">Peserta</dt>
                                            <dd className="text-right text-slate-700">{item.participants_count} orang</dd>
                                            <dt className="text-slate-500">Dibuat Oleh</dt>
                                            <dd className="text-right text-slate-700">{item.pembuat.name}</dd>
                                        </dl>

                                        <div className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium">
                                            {item.status === 'draft' ? (
                                                <button onClick={() => publish(item.id)} className="text-emerald-600">
                                                    Publish
                                                </button>
                                            ) : (
                                                <button onClick={() => batalkan(item.id)} className="text-red-600">
                                                    Batalkan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {jadwal.links && !kosong && (
                        <div className="flex flex-wrap gap-1">
                            {jadwal.links.map((link, i) => (
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

// Status khusus jadwal cuti bersama (draft/published) — beda domain dari
// StatusBadge pengajuan cuti (pending/disetujui/dst), jadi disimpan terpisah.
function JadwalStatusBadge({ status }) {
    const style = {
        draft: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
        published: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    };

    const label = {
        draft: 'Draft',
        published: 'Published',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${style[status] ?? 'bg-slate-100 text-slate-700'}`}>
            {label[status] ?? status}
        </span>
    );
}