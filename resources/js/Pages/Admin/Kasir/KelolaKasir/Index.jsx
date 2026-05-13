import { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion } from 'framer-motion'
import {
    Search,
    UserPlus,
    Mail,
    User,
    Edit3,
    Trash2,
    ShieldCheck,
    ShieldAlert,
    ChevronRight,
    KeyRound
} from 'lucide-react'
import { Modal, message, Tooltip } from 'antd'

export default function Index({ cashiers }) {
    const { auth, flash } = usePage().props
    const [searchTerm, setSearchTerm] = useState('')

    /*
    |--------------------------------------------------------------------------
    | KONFIGURASI NOTIFIKASI ALA IPHONE (iOS STYLE)
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        message.config({
            top: 40,
            duration: 3,
            maxCount: 1,
        });

        // Tangkap flash message dari Laravel jika ada
        if (flash?.message) {
            showIosNotification(flash.message);
        }
    }, [flash]);

    const showIosNotification = (msg) => {
        message.open({
            content: (
                <div className="flex items-center gap-3 font-sfPro px-2 py-1">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                        <ShieldCheck size={14} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{msg}</span>
                </div>
            ),
            className: 'ios-notification',
            icon: null, // Kita pakai custom icon di dalam content
        });
    };

    /*
    |--------------------------------------------------------------------------
    | PROSES HAPUS KASIR
    |--------------------------------------------------------------------------
    */
    const handleDelete = (id, name) => {
        Modal.confirm({
            title: 'Hapus Kasir',
            content: `Apakah Anda yakin ingin menghapus akses kasir "${name}"? Tindakan ini tidak dapat dibatalkan.`,
            okText: 'Ya, Hapus',
            okType: 'danger',
            cancelText: 'Batal',
            centered: true,
            okButtonProps: { 
                className: '!rounded-xl !font-sfPro !text-red-600 !border-red-500 hover:!text-red hover:!border-red-400 !outline-none !ring-0 !shadow-none' 
            },
            cancelButtonProps: { 
                className: '!rounded-xl !font-sfPro !text-gray-600 !border-gray-500 hover:!text-black hover:!border-gray-400 !outline-none !ring-0 !shadow-none' 
            },
            onOk() {
                router.delete(route('admin.manage-cashiers.destroy', id), {
                    onSuccess: () => showIosNotification('Kasir berhasil dihapus'),
                    onError: () => message.error('Gagal menghapus kasir'),
                })
            },
        })
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH FILTER (LOKAL)
    |--------------------------------------------------------------------------
    */
    const filteredCashiers = cashiers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout>
            <Head title="Kelola Kasir" />

            {/* CSS UNTUK NOTIFIKASI IPHONE */}
            <style dangerouslySetInnerHTML={{ __html: `
                .ios-notification .ant-message-notice-content {
                    background: rgba(255, 255, 255, 0.85) !important;
                    backdrop-filter: blur(20px) saturate(180%) !important;
                    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
                    border-radius: 50px !important;
                    padding: 8px 20px !important;
                    border: 1px solid rgba(255, 255, 255, 0.3) !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important;
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />

            <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">
                            Manajemen Kasir
                        </h1>
                    </div>

                    <Link
                        href={route('admin.manage-cashiers.create')}
                        className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-sfPro hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200 flex items-center gap-2"
                    >
                        <UserPlus size={17} />
                        Tambah Kasir
                    </Link>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-[30px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    
                    {/* Toolbar */}
                    <div className="p-8 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative w-full max-w-sm">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Cari nama atau email kasir..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none focus:outline-none focus:ring-0 rounded-2xl text-sm font-sfPro placeholder:text-gray-400"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} />
                            Total {filteredCashiers.length} Kasir Aktif
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="w-full overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-[10px] font-sfPro text-gray-800 uppercase tracking-widest border-b border-gray-50">Nama Lengkap</th>
                                    <th className="px-4 py-5 text-[10px] font-sfPro text-gray-800 uppercase tracking-widest border-b border-gray-50">Email</th>
                                    <th className="px-4 py-5 text-[10px] font-sfPro text-gray-800 uppercase tracking-widest border-b border-gray-50">Status Akses</th>
                                    <th className="px-4 py-5 text-[10px] font-sfPro text-gray-800 uppercase tracking-widest border-b border-gray-50">Dibuat Pada</th>
                                    <th className="px-8 py-5 text-[10px] font-sfPro text-gray-800 uppercase tracking-widest text-center border-b border-gray-50">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {filteredCashiers.length > 0 ? (
                                    filteredCashiers.map((cashier) => (
                                        <tr key={cashier.uuid} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                                                        <User size={18} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-800 font-sfPro">
                                                        {cashier.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Mail size={14} className="text-gray-400" />
                                                    <span className="text-sm font-sfPro">{cashier.email}</span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                                    cashier.is_active 
                                                    ? 'bg-green-50 text-green-600' 
                                                    : 'bg-red-50 text-red-600'
                                                }`}>
                                                    {cashier.is_active ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                                                    {cashier.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>

                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <span className="text-xs text-gray-400 font-sfPro">
                                                    {new Date(cashier.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'long', year: 'numeric'
                                                    })}
                                                </span>
                                            </td>

                                            <td className="px-8 py-5">
                                                <div className="flex justify-center gap-2">
                                                    <Tooltip title="Edit Profil">
                                                        <Link
                                                            href={route('admin.manage-cashiers.edit', cashier.uuid)}
                                                            className="w-9 h-9 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all active:scale-95 duration-200"
                                                        >
                                                            <Edit3 size={16} />
                                                        </Link>
                                                    </Tooltip>

                                                    <Tooltip title="Hapus Akses">
                                                        <button
                                                            onClick={() => handleDelete(cashier.uuid, cashier.name)}
                                                            className="w-9 h-9 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95 duration-200"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-20 text-center font-sfPro text-gray-400 text-sm">
                                            Tidak ada data kasir ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex justify-between items-center px-4">
                    <p className="text-[11px] text-gray-400 font-sfPro uppercase tracking-widest">
                        Total {filteredCashiers.length} Karyawan Terdaftar
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-sfPro">
                        <KeyRound size={12} />
                        Password dienkripsi secara otomatis oleh sistem
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}