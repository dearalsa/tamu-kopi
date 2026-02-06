import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';

export default function Edit({ auth, status, role }) {
    return (
        <>
            <Head title="Ganti Password" />
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-poppinsBold text-gray-900">Pengaturan Akun</h1>
                        <p className="mt-2 text-gray-600 font-sfPro">
                            Kelola password dan keamanan akun Anda
                        </p>
                    </div>

                    {/* Update Password Form */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <UpdatePasswordForm role={role} status={status} />
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}