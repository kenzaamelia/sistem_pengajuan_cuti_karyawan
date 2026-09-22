import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Create({ departemens, karyawan }) {
    const { data, setData, post, processing, errors } = useForm({
        nama_cuti_bersama: '',
        tanggal_mulai: '',
        tanggal_selesai: '',
        user_ids: [],
    });

    const [departemenTerpilih, setDepartemenTerpilih] = useState(new Set());
    const [dikecualikan, setDikecualikan] = useState(new Set()); // id karyawan yang di-uncheck manual

    // Karyawan yang cocok dengan departemen yang sedang difilter
    const karyawanTerfilter = karyawan.filter((k) => departemenTerpilih.has(k.departemen_id));

    // Tercentang = semua yang masuk filter, KECUALI yang sengaja di-uncheck manual.
    // Karyawan baru dari departemen yang baru dicentang otomatis ikut tercentang,
    // karena dia belum pernah masuk daftar "dikecualikan".
    const karyawanTercentang = karyawanTerfilter.filter((k) => !dikecualikan.has(k.id));

    // Set terpisah khusus untuk lookup checkbox — karyawanTercentang di atas
    // adalah Array (hasil .filter()), jadi TIDAK punya method .has()/.size.
    // (Sebelumnya kode ini salah pakai .has()/.size langsung di Array, yang
    // menyebabkan halaman crash begitu satu departemen dicentang.)
    const idTercentang = useMemo(
        () => new Set(karyawanTercentang.map((k) => k.id)),
        [karyawanTercentang]
    );

    useEffect(() => {
        setData('user_ids', karyawanTercentang.map((k) => k.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [karyawanTercentang.map((k) => k.id).join(',')]);

    const toggleDepartemen = (id) => {
        setDepartemenTerpilih((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleKaryawan = (id) => {
        setDikecualikan((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('cuti-bersama.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Buat Cuti Bersama
                </h2>
            }
        >
            <Head title="Buat Cuti Bersama" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <form onSubmit={submit} className="space-y-6 p-5 sm:p-6">

                            <div>
                                <InputLabel htmlFor="nama_cuti_bersama" value="Nama Cuti Bersama" />
                                <TextInput
                                    id="nama_cuti_bersama"
                                    value={data.nama_cuti_bersama}
                                    className="mt-1.5 block w-full"
                                    placeholder="Contoh: Cuti Bersama Lebaran 2027"
                                    onChange={(e) => setData('nama_cuti_bersama', e.target.value)}
                                    required
                                />
                                <InputError message={errors.nama_cuti_bersama} className="mt-2" />
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
                                <InputLabel value="Filter Departemen" />
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {departemens.map((dept) => {
                                        const aktif = departemenTerpilih.has(dept.id);

                                        return (
                                            <label
                                                key={dept.id}
                                                className={
                                                    'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition ' +
                                                    (aktif
                                                        ? 'border-brand-300 bg-blue-50 text-brand-700'
                                                        : 'border-slate-300 text-slate-700 hover:bg-slate-50')
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={aktif}
                                                    onChange={() => toggleDepartemen(dept.id)}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                />
                                                {dept.nama_departemen}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <InputLabel value={`Peserta (${karyawanTercentang.length} dipilih)`} />

                                {karyawanTerfilter.length === 0 ? (
                                    <p className="mt-2 text-sm text-slate-400">
                                        Pilih minimal satu departemen untuk menampilkan daftar karyawan.
                                    </p>
                                ) : (
                                    <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-3">
                                        {karyawanTerfilter.map((k) => (
                                            <label key={k.id} className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={idTercentang.has(k.id)}
                                                    onChange={() => toggleKaryawan(k.id)}
                                                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                                                />
                                                {k.name}
                                                <span className="text-xs text-slate-400">
                                                    ({k.departemen?.nama_departemen})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                                <InputError message={errors.user_ids} className="mt-2" />
                            </div>

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <PrimaryButton disabled={processing || karyawanTercentang.length === 0}>
                                    Simpan sebagai Draft
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}