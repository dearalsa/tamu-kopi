import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminSidebar({ auth, currentRoute }) {
    const [kasirOpen, setKasirOpen] = useState(false);
    const [produkOpen, setProdukOpen] = useState(false);

    return (
        <div className="w-64 bg-white h-screen fixed left-0 top-0 shadow-xl flex flex-col z-50">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <img 
                    src="/asset/Tamu.svg" 
                    alt="TAMU Logo" 
                    style={{ width: '120px', height: 'auto' }}
                    className="mx-auto"
                />
            </div>

            {/* Menu Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
                {/* Dashboard */}
                <Link
                    href={route('admin.dashboard')}
                    className={`flex items-center px-4 py-3 mb-2 rounded-lg font-sfPro font-medium transition-all duration-200 ${
                        currentRoute === 'admin.dashboard'
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                </Link>

                {/* Kasir Dropdown */}
                <div className="mb-2">
                    <button
                        onClick={() => setKasirOpen(!kasirOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-sfPro font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Kasir
                        </div>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${kasirOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Kasir Submenu */}
                    {kasirOpen && (
                        <div className="ml-8 mt-2 space-y-1">
                            <Link
                                href="#"
                                className="block px-4 py-2 text-sm font-sfPro text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                Transaksi Baru
                            </Link>
                            <Link
                                href="#"
                                className="block px-4 py-2 text-sm font-sfPro text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                Riwayat Transaksi
                            </Link>
                        </div>
                    )}
                </div>

                {/* Kelola Produk Dropdown */}
                <div className="mb-2">
                    <button
                        onClick={() => setProdukOpen(!produkOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-lg font-sfPro font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                        <div className="flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Kelola Produk
                        </div>
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${produkOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    {/* Produk Submenu */}
                    {produkOpen && (
                        <div className="ml-8 mt-2 space-y-1">
                            <Link
                                href="#"
                                className="block px-4 py-2 text-sm font-sfPro text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                Daftar Produk
                            </Link>
                            <Link
                                href="#"
                                className="block px-4 py-2 text-sm font-sfPro text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                Tambah Produk
                            </Link>
                            <Link
                                href="#"
                                className="block px-4 py-2 text-sm font-sfPro text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                                Kategori Produk
                            </Link>
                        </div>
                    )}
                </div>

                {/* Laporan Keuangan */}
                <Link
                    href="#"
                    className="flex items-center px-4 py-3 mb-2 rounded-lg font-sfPro font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Laporan Keuangan
                </Link>
            </nav>

            {/* Profile & Logout di Bawah */}
            <div className="border-t border-gray-100 p-4">
                {/* Profile Info */}
                <div className="flex items-center mb-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-poppinsBold text-sm">
                        {auth.user.name.charAt(0)}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-sfPro font-semibold text-gray-900">{auth.user.name}</p>
                        <p className="text-xs font-sfPro text-gray-500">{auth.user.email}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-lg font-sfPro font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Logout
                </Link>
            </div>
        </div>
    );
}