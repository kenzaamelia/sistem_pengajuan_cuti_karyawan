import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate font-display text-lg font-bold text-slate-900">
                    Profil Saya
                </h2>
            }
        >
            <Head title="Profil Saya" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                   <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                      <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
