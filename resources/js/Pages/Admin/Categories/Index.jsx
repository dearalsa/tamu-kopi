import React, { useState } from 'react'
import AdminLayout from '@/Layouts/AdminLayout'
import { Link, usePage, router } from '@inertiajs/react'
import { Search, Pencil, Trash2 } from 'lucide-react'

export default function Index() {
    const { categories, flash } = usePage().props
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const dataPerPage = 5

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const indexOfLastData = currentPage * dataPerPage
    const indexOfFirstData = indexOfLastData - dataPerPage
    const currentData = filteredCategories.slice(indexOfFirstData, indexOfLastData)
    const totalPages = Math.ceil(filteredCategories.length / dataPerPage)

    const handleDelete = (id) => {
        if (confirm('Yakin ingin hapus kategori?')) {
            router.delete(route('admin.categories.destroy', id))
        }
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                {flash?.success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-700 rounded-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        {flash.success}
                    </div>
                )}

                <div className="bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                            <div className="flex-1 min-w-0">
                                <h1 className="text-[22px] sm:text-[25px] font-sfPro text-gray-900 tracking-tight truncate">Daftar Kategori</h1>
                                <p className="text-[#DC5F5F] text-xs font-sfPro mt-1 font-normal truncate">Tamu Kopi</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                                <div className="relative w-full sm:w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Cari..." 
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value)
                                            setCurrentPage(1)
                                        }}
                                        className="bg-white border border-gray-50 rounded-xl pl-9 pr-4 py-2 text-xs w-full transition-all duration-500 outline-none focus:outline-none focus:ring-0 focus:border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] focus:shadow-[0_10px_30px_rgba(0,0,0,0.06)] placeholder:text-gray-500"
                                    />
                                </div>
                                <Link
                                    href={route('admin.categories.create')}
                                    className="w-full sm:w-auto text-center rounded-[10px] bg-[#EF5350] text-white text-[13px] px-5 py-2.5 shadow-md shadow-red-50 hover:bg-red-600 hover:-translate-y-0.5 transition-all active:scale-95 font-sfPro whitespace-nowrap"
                                >
                                    + Tambah Kategori
                                </Link>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[400px] sm:min-w-full">
                                <thead>
                                    <tr className="border-b border-gray-50">
                                        <th className="px-3 py-3 text-[12px] sm:text-[13px] font-sfPro font-normal text-gray-400">Nama kategori</th>
                                        <th className="px-3 py-3 text-[12px] sm:text-[13px] font-sfPro font-normal text-gray-400 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {currentData.length === 0 ? (
                                        <tr>
                                            <td colSpan="2" className="px-3 py-6 text-center text-gray-400 text-xs italic">
                                                Tidak ada data kategori.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentData.map((cat) => (
                                            <tr key={cat.id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-3 py-4 text-sm text-gray-700 font-normal font-sfPro truncate">{cat.name}</td>
                                                <td className="px-3 py-4">
                                                    <div className="flex justify-end items-center gap-4">
                                                        <Link
                                                            href={route('admin.categories.edit', cat.id)}
                                                            className="text-black hover:text-blue-600 transition-colors opacity-80 hover:opacity-100"
                                                        >
                                                            <Pencil size={16} strokeWidth={2} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(cat.id)}
                                                            className="text-black hover:text-[#EF5350] transition-colors opacity-80 hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} strokeWidth={2} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50 font-sfPro">
                            <p className="text-[11px] text-gray-300 font-normal">
                                Menampilkan {filteredCategories.length > 0 ? indexOfFirstData + 1 : 0}-{Math.min(indexOfLastData, filteredCategories.length)} dari {filteredCategories.length} data
                            </p>
                            
                            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="p-1.5 rounded-md bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={currentPage === 1}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                                </button>
                                
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                    <button 
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        className={`w-8 h-8 rounded-md font-normal text-xs transition-all shadow-sm ${
                                            currentPage === num 
                                            ? 'bg-[#EF5350] text-white' 
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="p-1.5 rounded-md bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    disabled={currentPage === totalPages || totalPages === 0}
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
