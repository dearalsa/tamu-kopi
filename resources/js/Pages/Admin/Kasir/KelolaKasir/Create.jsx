import React, { useState } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    ArrowLeft,
    User,
    Mail,
    Lock,
    UserPlus,
    Eye,
    EyeOff,
    ShieldCheck,
    ShieldAlert
} from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_active: 1, // Default set ke aktif (1)
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.manage-cashiers.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Kasir" />
            <style>{`
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }
            `}</style>

            <div className="min-h-screen flex items-start justify-center">
                <div className="w-full max-w-2xl px-6 pt-8 pb-12">
                    <div className="mb-6 mt-4">
                        <Link
                            href={route('admin.manage-cashiers.index')}
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span className="font-sfPro">Kembali ke Daftar</span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-[30px] border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="text-center"> 
                                <h1 className="text-2xl font-sfPro text-gray-900 tracking-tight">
                                    Tambah Kasir Baru
                                </h1>
                                <p className="text-sm text-gray-500 font-sfPro mt-1">
                                    Daftarkan akun kasir untuk mulai bertugas
                                </p>
                            </div>

                            {/* Nama Lengkap */}
                            <div className="space-y-3">
                                <label className="block text-sm font-sfPro text-gray-800 font-medium">Nama Lengkap:</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Masukkan Nama Lengkap"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-400'} rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gray-500 shadow-sm font-sfPro`}
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="block text-sm font-sfPro text-gray-800 font-medium">Alamat Email:</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="Masukkan Alamat Email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-400'} rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-gray-500 shadow-sm font-sfPro`}
                                    />
                                </div>
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            {/* Section Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                                <div className="space-y-3">
                                    <label className="block text-sm font-sfPro text-gray-800 font-medium">Kata Sandi:</label>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan Kata Sandi"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-400'} rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:border-gray-500 shadow-sm font-sfPro`}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-sfPro text-gray-800 font-medium">Konfirmasi Sandi:</label>
                                    <div className="relative group">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Konfirmasi Kata Sandi"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="w-full bg-white border border-gray-400 rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:border-gray-500 shadow-sm font-sfPro"
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Opsi Status Aktif/Tidak Aktif */}
                            <div className="space-y-3">
                                <label className="block text-sm font-sfPro text-gray-800 font-medium">Status Akses:</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        {Number(data.is_active) === 1 ? (
                                            <ShieldCheck size={18} className="text-green-500" />
                                        ) : (
                                            <ShieldAlert size={18} className="text-red-500" />
                                        )}
                                    </span>
                                    <select
                                        value={data.is_active}
                                        onChange={(e) => setData('is_active', Number(e.target.value))}
                                        className="w-full bg-white border border-gray-400 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 shadow-sm font-sfPro appearance-none cursor-pointer"
                                    >
                                        <option value={1}>Aktif (Diberikan Akses Login)</option>
                                        <option value={0}>Tidak Aktif (Akses Diblokir)</option>
                                    </select>
                                    {/* Custom Arrow untuk Select */}
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                {errors.is_active && <p className="text-red-500 text-xs mt-1">{errors.is_active}</p>}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-gray-900 text-white font-sfPro py-4 rounded-xl text-sm hover:bg-black active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-gray-100"
                                >
                                    {processing ? 'Mendaftarkan...' : 'Daftarkan Akun Kasir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}