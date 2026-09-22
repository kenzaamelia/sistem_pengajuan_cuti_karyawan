import PrimaryButton from '@/Components/PrimaryButton';
import { IconReport } from '@/Components/Icons';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { labelJenisCuti } from '@/Utils/leaveType';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const NAMA_BULAN = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export default function Index({ rekap, filters }) {
    const [bulan, setBulan] = useState(filters.bulan);
    const [tahun, setTahun] = useState(filters.tahun);

    const terapkanFilter = (e) => {
        e.preventDefault();
        router.get(route('laporan.index'), { bulan, tahun }, { preserveState: true, replace: true });
    };

    // Sengaja pakai <a> biasa (bukan Inertia <Link>) supaya browser memicu
    // download file asli, bukan navigasi Inertia (yang akan mencoba parse
    // response file sebagai halaman Inertia dan gagal).
    const urlExport = (jenis) => route(`laporan.export.${jenis}`, { bulan: rekap.bulan, tahun: rekap.tahun });

    const adaData = rekap.departemens.length > 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Laporan Bulanan Cuti
                </h2>
            }
        >
            <Head title="Laporan Bulanan Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {/* Filter periode + tombol export */}
                    <form
                        onSubmit={terapkanFilter}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:p-6"
                    >
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Bulan</label>
                            <select
                                value={bulan}
                                onChange={(e) => setBulan(e.target.value)}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:w-44"
                            >
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
                                value={tahun}
                                onChange={(e) => setTahun(e.target.value)}
                                className="w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:w-28"
                            />
                        </div>

                        <PrimaryButton type="submit">Tampilkan</PrimaryButton>

                        <div className="flex gap-2 sm:ml-auto">
                            <a
                                href={urlExport('excel')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                            >
                                Export Excel
                            </a>
                            <a
                                href={urlExport('pdf')}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-600 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                                Export PDF
                            </a>
                        </div>
                    </form>

                    <p className="text-sm text-slate-500">
                        Rekap {rekap.jumlah_pengajuan} pengajuan cuti disetujui pada {rekap.nama_bulan} {rekap.tahun}
                    </p>

                    {!adaData ? (
                        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <IconReport className="h-6 w-6" />
                            </span>
                            <p className="mt-4 font-display text-base font-bold text-slate-900">
                                Belum ada data untuk periode ini
                            </p>
                            <p className="mt-1 max-w-xs text-sm text-slate-500">
                                Tidak ada pengajuan cuti yang disetujui pada {rekap.nama_bulan} {rekap.tahun}.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* ===== Tabel — hanya di layar sm ke atas ===== */}
                            <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <Th>Departemen / Karyawan</Th>
                                                {rekap.leave_types.map((jt) => (
                                                    <Th key={jt}>{labelJenisCuti(jt)}</Th>
                                                ))}
                                                <Th>Total Hari</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {rekap.departemens.map((dept) => (
                                                <BarisDepartemen
                                                    key={dept.departemen_id}
                                                    dept={dept}
                                                    jenisList={rekap.leave_types}
                                                />
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-blue-50">
                                            <tr className="font-semibold text-brand-900">
                                                <td className="px-6 py-3 text-sm">TOTAL KESELURUHAN</td>
                                                {rekap.leave_types.map((jt) => (
                                                    <td key={jt} className="px-6 py-3 text-sm">
                                                        {rekap.grand_total_breakdown[jt] ?? 0}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-3 text-sm">{rekap.grand_total_hari}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* ===== Card — hanya di layar mobile ===== */}
                            <div className="space-y-4 sm:hidden">
                                {rekap.departemens.map((dept) => (
                                    <div key={dept.departemen_id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <div className="bg-blue-50 px-4 py-2 text-sm font-semibold text-brand-900">
                                            {dept.nama_departemen}
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {dept.karyawans.map((k) => (
                                                <div key={k.nama} className="p-4">
                                                    <p className="font-medium text-slate-900">{k.nama}</p>
                                                    <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                                                        {rekap.leave_types.map((jt) => (
                                                            <BarisRingkas
                                                                key={jt}
                                                                label={labelJenisCuti(jt)}
                                                                value={k.breakdown[jt] ?? 0}
                                                            />
                                                        ))}
                                                        <dt className="text-slate-500">Total Hari</dt>
                                                        <dd className="text-right font-semibold text-slate-900">
                                                            {k.total_hari}
                                                        </dd>
                                                    </dl>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                            Subtotal departemen: {dept.subtotal_hari} hari
                                        </div>
                                    </div>
                                ))}

                                <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-sprout-500 p-4 text-sm font-semibold text-white">
                                    Total Keseluruhan: {rekap.grand_total_hari} hari
                                </div>
                            </div>
                        </>
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

function BarisRingkas({ label, value }) {
    return (
        <>
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right text-slate-700">{value}</dd>
        </>
    );
}

// Satu blok departemen: baris judul departemen, baris tiap karyawan, lalu baris subtotal.
function BarisDepartemen({ dept, jenisList }) {
    return (
        <>
            <tr className="bg-slate-50">
                <td
                    colSpan={jenisList.length + 2}
                    className="px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                    {dept.nama_departemen}
                </td>
            </tr>

            {dept.karyawans.map((k) => (
                <tr key={k.nama}>
                    <td className="whitespace-nowrap py-3 pl-10 pr-6 text-sm text-slate-900">{k.nama}</td>
                    {jenisList.map((jt) => (
                        <td key={jt} className="whitespace-nowrap px-6 py-3 text-sm text-slate-500">
                            {k.breakdown[jt] ?? 0}
                        </td>
                    ))}
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-slate-900">
                        {k.total_hari}
                    </td>
                </tr>
            ))}

            <tr className="bg-slate-50/70 font-medium text-slate-700">
                <td className="px-6 py-2 text-sm">Subtotal {dept.nama_departemen}</td>
                {jenisList.map((jt) => (
                    <td key={jt} className="px-6 py-2 text-sm">
                        {dept.subtotal_breakdown[jt] ?? 0}
                    </td>
                ))}
                <td className="px-6 py-2 text-sm">{dept.subtotal_hari}</td>
            </tr>
        </>
    );
}