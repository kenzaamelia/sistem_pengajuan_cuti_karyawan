import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Recaptcha from '@/Components/Recaptcha';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';

const SELECT_CLASS =
    'mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500';

export default function Register({ roles, departemens, recaptchaSiteKey }) {
    const captchaRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        jabatan: '',
        departemen_id: '',
        tanggal_masuk_kerja: '',
        'g-recaptcha-response': '',
    });

    const roleTerpilih = roles.find((r) => String(r.id) === String(data.role_id));
    const isKaryawanPimpinan = roleTerpilih?.nama_role === 'karyawan_pimpinan';
    const isGeneralManager = roleTerpilih?.nama_role === 'general_manager';
    const isSdm = roleTerpilih?.nama_role === 'sdm';
    // SDM & General Manager bukan karyawan, jadi tidak perlu terikat departemen
    const butuhDepartemen = !isGeneralManager && !isSdm;

    const handleRoleChange = (e) => {
        setData((prevData) => ({
            ...prevData,
            role_id: e.target.value,
            // Reset jabatan & departemen setiap kali role diganti,
            // supaya tidak ada nilai lama yang nyangkut tidak relevan
            jabatan: '',
            departemen_id: '',
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onError: () => captchaRef.current?.reset(),
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout maxWidthClass="max-w-xl">
            <Head title="Registrasi" />

            <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900">Buat akun baru</h2>
                <p className="mt-1 text-sm text-slate-500">Lengkapi data di bawah untuk mulai memakai CutiKu.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1.5 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="role_id" value="Role" />
                    <select
                        id="role_id"
                        name="role_id"
                        value={data.role_id}
                        onChange={handleRoleChange}
                        className={SELECT_CLASS}
                        required
                    >
                        <option value="">-- Pilih Role --</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {formatNamaRole(role.nama_role)}
                            </option>
                        ))}
                    </select>
                    <InputError message={errors.role_id} className="mt-2" />
                </div>

                {(isKaryawanPimpinan || butuhDepartemen) && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {isKaryawanPimpinan && (
                            <div>
                                <InputLabel htmlFor="jabatan" value="Jabatan" />
                                <select
                                    id="jabatan"
                                    name="jabatan"
                                    value={data.jabatan}
                                    onChange={(e) => setData('jabatan', e.target.value)}
                                    className={SELECT_CLASS}
                                    required
                                >
                                    <option value="">-- Pilih Jabatan --</option>
                                    <option value="asisten_manajer">Asisten Manajer</option>
                                    <option value="manajer">Manajer</option>
                                </select>
                                <InputError message={errors.jabatan} className="mt-2" />
                            </div>
                        )}

                        {butuhDepartemen && (
                            <div className={isKaryawanPimpinan ? '' : 'sm:col-span-2'}>
                                <InputLabel htmlFor="departemen_id" value="Departemen" />
                                <select
                                    id="departemen_id"
                                    name="departemen_id"
                                    value={data.departemen_id}
                                    onChange={(e) => setData('departemen_id', e.target.value)}
                                    className={SELECT_CLASS}
                                    required
                                >
                                    <option value="">-- Pilih Departemen --</option>
                                    {departemens.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.nama_departemen}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.departemen_id} className="mt-2" />
                            </div>
                        )}
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="tanggal_masuk_kerja" value="Tanggal Masuk Kerja" />
                    <TextInput
                        id="tanggal_masuk_kerja"
                        type="date"
                        name="tanggal_masuk_kerja"
                        value={data.tanggal_masuk_kerja}
                        className="mt-1.5 block w-full"
                        onChange={(e) => setData('tanggal_masuk_kerja', e.target.value)}
                        required
                    />
                    <InputError message={errors.tanggal_masuk_kerja} className="mt-2" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1.5 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1.5 block w-full"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                </div>

                <div>
                    <Recaptcha
                        ref={captchaRef}
                        siteKey={recaptchaSiteKey}
                        onChange={(token) => setData('g-recaptcha-response', token)}
                    />
                    <InputError message={errors['g-recaptcha-response']} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    Daftar
                </PrimaryButton>

                <p className="text-center text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link href={route('login')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Masuk di sini
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}

function formatNamaRole(namaRole) {
    const label = {
        karyawan_pelaksana: 'Karyawan Pelaksana',
        karyawan_pimpinan: 'Karyawan Pimpinan',
        sdm: 'SDM',
        general_manager: 'General Manager',
    };

    return label[namaRole] ?? namaRole;
}