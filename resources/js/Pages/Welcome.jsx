import ApplicationLogo from '@/Components/ApplicationLogo';
import { IconArrowRight, IconBarChart, IconCalendar, IconClipboard } from '@/Components/Icons';
import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="CutiKu — Sistem Pengajuan Cuti" />

            <div className="min-h-screen bg-slate-50">
                {/* ===== Navbar ===== */}
                <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2.5">
                        <ApplicationLogo className="h-9 w-9" />
                        <span className="font-display text-lg font-extrabold text-slate-900">CutiKu</span>
                    </div>

                    <nav className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-sprout-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md"
                            >
                                Ke Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-sprout-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                {/* ===== Hero ===== */}
                <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-14 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                            Kelola cuti karyawan,
                            <br />
                            <span className="bg-gradient-to-r from-brand-600 to-sprout-500 bg-clip-text text-transparent">
                                lebih rapi &amp; transparan.
                            </span>
                        </h1>
                        <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
                            Ajukan, setujui, dan pantau cuti seluruh tim dalam satu tempat — lengkap dengan approval
                            berjenjang, cuti bersama, dan laporan bulanan otomatis untuk SDM.
                        </p>

                        {!auth.user && (
                            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Link
                                    href={route('register')}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-sprout-500 px-6 py-3 text-sm font-semibold text-white shadow-glow hover:shadow-xl sm:w-auto"
                                >
                                    Mulai sekarang
                                    <IconArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
                                >
                                    Saya sudah punya akun
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ===== Fitur ===== */}
                    <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3">
                        <FeatureCard
                            icon={IconClipboard}
                            title="Ajukan cuti online"
                            deskripsi="Ajukan cuti kapan saja, lengkap dengan bukti pendukung, tanpa perlu formulir kertas."
                        />
                        <FeatureCard
                            icon={IconBarChart}
                            title="Approval berjenjang"
                            deskripsi="Alur persetujuan otomatis sesuai struktur organisasi — dari atasan langsung hingga GM."
                        />
                        <FeatureCard
                            icon={IconCalendar}
                            title="Laporan otomatis"
                            deskripsi="SDM bisa memantau seluruh departemen dan mengekspor laporan bulanan ke Excel & PDF."
                        />
                    </div>
                </main>

                <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
                    © {new Date().getFullYear()} CutiKu — Pabrik Gula Pesantren Baru.
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon: Icon, title, deskripsi }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-sm font-bold text-slate-900">{title}</p>
            <p className="mt-1.5 text-sm text-slate-500">{deskripsi}</p>
        </div>
    );
}