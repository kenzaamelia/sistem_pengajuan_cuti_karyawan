import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, maxWidthClass = 'max-w-md' }) {
    return (
        <div className="flex min-h-screen flex-col lg:flex-row">
            {/* Panel kiri — identitas brand. Disembunyikan di layar kecil supaya
                form langsung terlihat tanpa perlu scroll. */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0B2A4A] via-[#0C2E44] to-[#0B3B33] px-10 py-12 text-white lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <ApplicationLogo className="h-10 w-10" />
                    <span className="font-display text-xl font-extrabold">CutiKu</span>
                </Link>

                <div>
                    <h1 className="font-display text-3xl font-extrabold leading-tight">
                        Kelola cuti karyawan,
                        <br />
                        lebih rapi &amp; transparan.
                    </h1>
                    <p className="mt-4 max-w-sm text-sm text-blue-100/80">
                        Ajukan, setujui, dan pantau cuti seluruh tim dalam satu tempat — lengkap dengan
                        laporan bulanan otomatis untuk SDM.
                    </p>
                </div>

                <p className="text-xs text-blue-100/50">
                    © {new Date().getFullYear()} CutiKu — Pabrik Gula Pesantren Baru.
                </p>
            </div>

            {/* Panel kanan — form */}
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 px-4 py-10 sm:px-6">
                <Link href="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
                    <ApplicationLogo className="h-9 w-9" />
                    <span className="font-display text-lg font-extrabold text-slate-900">CutiKu</span>
                </Link>

                <div className={`w-full ${maxWidthClass} rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8`}>
                    {children}
                </div>
            </div>
        </div>
    );
}