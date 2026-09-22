import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatTanggalInput } from '@/Utils/formatTanggal';
import { labelJenisCuti } from '@/Utils/leaveType';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ leaveRequest }) {
    const { data, setData, put, processing, errors } = useForm({
        tanggal_mulai: formatTanggalInput(leaveRequest.tanggal_mulai),
        tanggal_selesai: formatTanggalInput(leaveRequest.tanggal_selesai),
        alasan: leaveRequest.alasan ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('sdm.leave-requests.update', leaveRequest.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Edit Pengajuan Cuti
                </h2>
            }
        >
            <Head title="Edit Pengajuan Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-2xl space-y-4 px-4 sm:px-6 lg:px-8">

                    <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
                        <span className="font-semibold">{leaveRequest.user?.name}</span> —{' '}
                        {labelJenisCuti(leaveRequest.leave_type.nama_cuti)}
                        {leaveRequest.status === 'disetujui' && (
                            <p className="mt-1">
                                Pengajuan ini sudah <strong>disetujui</strong>. Saldo cuti karyawan akan
                                otomatis disesuaikan (dikembalikan lalu dipotong ulang) sesuai tanggal baru.
                            </p>
                        )}
                    </div>

                    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                                <TextInput
                                    id="tanggal_mulai"
                                    type="date"
                                    value={data.tanggal_mulai}
                                    onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                    className="mt-1.5 block w-full"
                                />
                                <InputError message={errors.tanggal_mulai} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="tanggal_selesai" value="Tanggal Selesai" />
                                <TextInput
                                    id="tanggal_selesai"
                                    type="date"
                                    value={data.tanggal_selesai}
                                    onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                    className="mt-1.5 block w-full"
                                />
                                <InputError message={errors.tanggal_selesai} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="alasan" value="Alasan" />
                            <textarea
                                id="alasan"
                                value={data.alasan}
                                onChange={(e) => setData('alasan', e.target.value)}
                                rows={3}
                                className="mt-1.5 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                            />
                            <InputError message={errors.alasan} className="mt-1" />
                        </div>

                        {errors.jumlah_hari && (
                            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                {errors.jumlah_hari}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                            <Link
                                href={route('leave-requests.show', leaveRequest.id)}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                            >
                                Batal
                            </Link>
                            <PrimaryButton disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}