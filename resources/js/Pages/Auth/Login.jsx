import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import Recaptcha from '@/Components/Recaptcha';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef } from 'react';

export default function Login({ status, canResetPassword, recaptchaSiteKey }) {
    const captchaRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        'g-recaptcha-response': '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onError: () => captchaRef.current?.reset(),
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-slate-900">Masuk ke akun Anda</h2>
                <p className="mt-1 text-sm text-slate-500">Gunakan email dan password yang terdaftar.</p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1.5 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1.5 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-slate-600">Ingat saya</span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                        >
                            Lupa password?
                        </Link>
                    )}
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
                    Masuk
                </PrimaryButton>

                <p className="text-center text-sm text-slate-500">
                    Belum punya akun?{' '}
                    <Link href={route('register')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Daftar di sini
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}