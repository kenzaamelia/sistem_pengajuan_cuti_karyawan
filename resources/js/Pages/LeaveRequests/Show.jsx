import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ leaveRequest }) {
    const isGambar = leaveRequest.bukti_cuti && /\.(jpe?g|png)$/i.test(leaveRequest.bukti_cuti);
    const buktiCutiUrl = leaveRequest.bukti_cuti ? `/storage/${leaveRequest.bukti_cuti}` : null;

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pengajuan Cuti</h2>}
        >
            <Head title="Detail Pengajuan Cuti" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl space-y-6 sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="space-y-4 p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {formatNamaCuti(leaveRequest.leave_type.nama_cuti)}
                                </h3>
                                <StatusBadge status={leaveRequest.status} />
                            </div>

                            <dl className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="text-gray-500">Tanggal Mulai</dt>
                                    <dd className="text-gray-900">{leaveRequest.tanggal_mulai}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Tanggal Selesai</dt>
                                    <dd className="text-gray-900">{leaveRequest.tanggal_selesai}</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Jumlah Hari</dt>
                                    <dd className="text-gray-900">{leaveRequest.jumlah_hari} hari</dd>
                                </div>
                                <div>
                                    <dt className="text-gray-500">Sumber</dt>
                                    <dd className="text-gray-900">
                                        {leaveRequest.sumber === 'cuti_bersama' ? 'Cuti Bersama' : 'Pengajuan Manual'}
                                    </dd>
                                </div>
                            </dl>

                            {leaveRequest.alasan && (
                                <div>
                                    <dt className="text-sm text-gray-500">Alasan</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{leaveRequest.alasan}</dd>
                                </div>
                            )}

                            {buktiCutiUrl && (
                                <div>
                                    <dt className="mb-2 text-sm text-gray-500">Bukti Cuti</dt>
                                    {isGambar ? (
                                        <a href={buktiCutiUrl} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={buktiCutiUrl}
                                                alt="Bukti cuti"
                                                className="max-h-64 rounded-md border border-gray-200"
                                            />
                                        </a>
                                    ) : (
                                        <a
                                            href={buktiCutiUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-indigo-600 hover:underline"
                                        >
                                            Lihat dokumen bukti cuti (PDF)
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Riwayat Approval</h3>

                            {leaveRequest.approvals.length === 0 ? (
                                <p className="text-sm text-gray-500">Belum ada riwayat approval.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {leaveRequest.approvals.map((approval) => (
                                        <li
                                            key={approval.id}
                                            className="flex items-start justify-between rounded-md border border-gray-200 p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    Level {approval.level_approval} — {approval.approver.name}
                                                </p>
                                                {approval.catatan && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Catatan: {approval.catatan}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {approval.diproses_pada}
                                                </p>
                                            </div>
                                            <StatusBadge status={approval.status} />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <Link href={route('leave-requests.index')} className="text-sm text-indigo-600 hover:underline">
                        ← Kembali ke riwayat pengajuan
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
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