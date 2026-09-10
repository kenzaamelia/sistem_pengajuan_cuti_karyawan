import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Ajukan Cuti</h2>}
        >
            <Head title="Ajukan Cuti" />

            <div className="py-8">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-4 p-6">

                            {errors.jumlah_hari && (
                                <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                                    {errors.jumlah_hari}
                                </div>
                            )}

                            <div>
                                <InputLabel htmlFor="leave_type_id" value="Jenis Cuti" />
                                <select
                                    id="leave_type_id"
                                    value={data.leave_type_id}
                                    onChange={(e) => setData('leave_type_id', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">-- Pilih Jenis Cuti --</option>
                                    {leaveTypes.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {formatNamaCuti(type.nama_cuti)}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.leave_type_id} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                                    <TextInput
                                        id="tanggal_mulai"
                                        type="date"
                                        value={data.tanggal_mulai}
                                        className="mt-1 block w-full"
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
                                        className="mt-1 block w-full"
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
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                    className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Format jpg, png, atau pdf. Maksimal 2MB.
                                </p>
                                <InputError message={errors.bukti_cuti} className="mt-2" />
                            </div>

                            <div className="flex justify-end pt-2">
                                <PrimaryButton disabled={processing}>Kirim Pengajuan</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function formatNamaCuti(namaCuti) {
    const label = {
        cuti_tahunan: 'Cuti Tahunan',
        cuti_panjang: 'Cuti Panjang',
    };

    return label[namaCuti] ?? namaCuti;
}