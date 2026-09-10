import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ roles, departemens }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        jabatan: '',
        departemen_id: '',
        tanggal_masuk_kerja: '',
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
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Registrasi" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="role_id" value="Role" />
                    <select
                        id="role_id"
                        name="role_id"
                        value={data.role_id}
                        onChange={handleRoleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

                {isKaryawanPimpinan && (
                    <div className="mt-4">
                        <InputLabel htmlFor="jabatan" value="Jabatan" />
                        <select
                            id="jabatan"
                            name="jabatan"
                            value={data.jabatan}
                            onChange={(e) => setData('jabatan', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                    <div className="mt-4">
                        <InputLabel htmlFor="departemen_id" value="Departemen" />
                        <select
                            id="departemen_id"
                            name="departemen_id"
                            value={data.departemen_id}
                            onChange={(e) => setData('departemen_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

                <div className="mt-4">
                    <InputLabel htmlFor="tanggal_masuk_kerja" value="Tanggal Masuk Kerja" />
                    <TextInput
                        id="tanggal_masuk_kerja"
                        type="date"
                        name="tanggal_masuk_kerja"
                        value={data.tanggal_masuk_kerja}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('tanggal_masuk_kerja', e.target.value)}
                        required
                    />
                    <InputError message={errors.tanggal_masuk_kerja} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Sudah punya akun?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Daftar
                    </PrimaryButton>
                </div>
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