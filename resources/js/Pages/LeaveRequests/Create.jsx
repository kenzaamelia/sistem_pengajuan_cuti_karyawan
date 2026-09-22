import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { labelJenisCuti } from '@/Utils/leaveType';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ leaveTypes }) {
    const { data, setData, post, processing, errors } = useForm({
        leave_type_id: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        alasan: '',
        bukti_cuti: null,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('leave-requests.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Ajukan Cuti
                </h2>
            }
        >
            <Head title="Ajukan Cuti" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">

                            {errors.jumlah_hari && (
                                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                                    {errors.jumlah_hari}
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="leave_type_id" value="Jenis Cuti" />
                                <select
                                    id="leave_type_id"
                                    value={data.leave_type_id}
                                    onChange={(e) => setData('leave_type_id', e.target.value)}
                                    className="mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                    required
                                >
                                    <option value="">-- Pilih Jenis Cuti --</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {labelJenisCuti(type.nama_cuti)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.leave_type_id} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                                    <TextInput
                                        id="tanggal_mulai"
                                        type="date"
                                        value={data.tanggal_mulai}
                                        className="mt-1.5 block w-full"
                                        onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tanggal_mulai} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="tanggal_selesai" value="Tanggal Selesai" />
                                    <TextInput
                                        id="tanggal_selesai"
                                        type="date"
                                        value={data.tanggal_selesai}
                                        className="mt-1.5 block w-full"
                                        onChange={(e) => setData('tanggal_selesai', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.tanggal_selesai} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="alasan" value="Alasan (opsional)" />
                                <textarea
                                    id="alasan"
                                    value={data.alasan}
                                    onChange={(e) => setData('alasan', e.target.value)}
                                    rows={3}
                                    className="mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                                />
                                <InputError message={errors.alasan} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="bukti_cuti" value="Bukti Cuti (opsional)" />
                                <input
                                    id="bukti_cuti"
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setData('bukti_cuti', e.target.files[0] ?? null)}
                                    className="mt-1.5 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-blue-100"
                                />
                                <p className="mt-1 text-xs text-slate-500">
                                    Format jpg, png, atau pdf. Maksimal 2MB.
                                </p>
                                <InputError message={errors.bukti_cuti} className="mt-2" />
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <PrimaryButton disabled={processing}>Kirim Pengajuan</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}