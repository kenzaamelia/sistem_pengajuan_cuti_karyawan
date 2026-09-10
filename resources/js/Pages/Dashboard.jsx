import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ namaRole, jabatan, saldoCuti, jumlahPendingApproval, ringkasanSdm }) {
    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {saldoCuti && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Sisa Cuti Anda</h3>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <p className="text-sm text-gray-500">Cuti Tahunan</p>
                                        <p className="mt-1 text-3xl font-semibold text-gray-900">
                                            {saldoCuti.cuti_tahunan.sisa}
                                            <span className="ml-1 text-base font-normal text-gray-500">
                                                / {saldoCuti.cuti_tahunan.saldo_awal} hari
                                            </span>
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 p-4">
                                        <p className="text-sm text-gray-500">Cuti Panjang</p>
                                        {saldoCuti.cuti_panjang.tersedia ? (
                                            <p className="mt-1 text-3xl font-semibold text-gray-900">
                                                {saldoCuti.cuti_panjang.sisa}
                                                <span className="ml-1 text-base font-normal text-gray-500">hari</span>
                                            </p>
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-400">Belum eligible / sudah terpakai</p>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    href={route('leave-requests.create')}
                                    className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
                                >
                                    Ajukan cuti baru →
                                </Link>
                            </div>
                        </div>
                    )}

                    {jumlahPendingApproval !== undefined && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Menunggu Approval Anda</h3>
                                <p className="text-3xl font-semibold text-gray-900">{jumlahPendingApproval}</p>
                                <p className="text-sm text-gray-500">pengajuan cuti perlu ditindaklanjuti</p>

                                <Link
                                    href={route('approvals.index')}
                                    className="mt-4 inline-block text-sm text-indigo-600 hover:underline"
                                >
                                    Lihat daftar approval →
                                </Link>
                            </div>
                        </div>
                    )}

                    {ringkasanSdm && (
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">Ringkasan SDM</h3>

                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <RingkasanItem label="Departemen" value={ringkasanSdm.jumlah_departemen} />
                                    <RingkasanItem label="Karyawan" value={ringkasanSdm.jumlah_karyawan} />
                                    <RingkasanItem label="Cuti Bersama (Draft)" value={ringkasanSdm.cuti_bersama_draft} />
                                    <RingkasanItem label="Cuti Bersama (Published)" value={ringkasanSdm.cuti_bersama_published} />
                                </div>

                                {ringkasanSdm.peserta_butuh_tindakan > 0 && (
                                    <div className="mt-4 rounded-md bg-red-50 p-4">
                                        <p className="text-sm text-red-700">
                                            {ringkasanSdm.peserta_butuh_tindakan} karyawan tidak memiliki saldo cukup
                                            saat cuti bersama dipublish dan butuh tindakan manual.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-4">
                                    <Link
                                        href={route('monitoring.index')}
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        Monitoring semua pengajuan cuti →
                                    </Link>
                                    <Link
                                        href={route('cuti-bersama.index')}
                                        className="text-sm text-indigo-600 hover:underline"
                                    >
                                        Kelola cuti bersama →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function RingkasanItem({ label, value }) {
    return (
        <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
    );
}