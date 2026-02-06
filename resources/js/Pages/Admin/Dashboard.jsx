import { Head } from '@inertiajs/react';
import AdminSidebar from '@/Components/AdminSidebar';

export default function AdminDashboard({ auth }) {
    return (
        <>
            <Head title="Dashboard Admin" />
            
            {/* Sidebar */}
            <AdminSidebar auth={auth} currentRoute="admin.dashboard" />

            {/* Main Content */}
            <div className="ml-64 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-poppinsBold text-gray-900">Hello {auth.user.name} 👋</h1>
                            <p className="text-sm font-sfPro text-gray-500 mt-1">
                                {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Pemasukan */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-sfPro text-gray-600 mb-1">Total Pemasukan</p>
                                    <h3 className="text-3xl font-poppinsBold text-gray-900">10.000</h3>
                                    <p className="text-xs font-sfPro text-green-600 mt-2 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                        </svg>
                                        10% Hari ini
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Pengeluaran */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-sfPro text-gray-600 mb-1">Total Pengeluaran</p>
                                    <h3 className="text-3xl font-poppinsBold text-gray-900">5.000</h3>
                                    <p className="text-xs font-sfPro text-red-600 mt-2 flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                        1% Hari ini
                                    </p>
                                </div>
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Stok Terbatas */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-sfPro text-gray-600 mb-1">Stok Terbatas</p>
                                    <h3 className="text-3xl font-poppinsBold text-gray-900">3</h3>
                                    <a href="#" className="text-xs font-sfPro text-blue-600 mt-2 flex items-center hover:text-blue-700">
                                        Cek Stok
                                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grafik Keuangan */}
                    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-poppinsBold text-gray-900">Grafik Keuangan</h2>
                            <select className="px-4 py-2 border border-gray-200 rounded-lg font-sfPro text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option>Harian</option>
                                <option>Mingguan</option>
                                <option>Bulanan</option>
                            </select>
                        </div>
                        
                        {/* Placeholder untuk Chart */}
                        <div className="h-80 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                            <div className="text-center">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <p className="text-gray-500 font-sfPro">Chart akan muncul di sini</p>
                                <p className="text-sm text-gray-400 font-sfPro mt-1">Gunakan library Chart.js atau Recharts</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}