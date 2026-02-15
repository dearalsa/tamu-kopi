import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Save } from 'lucide-react';

export default function Edit({ category: propCategory }) {
    const { data, setData, put, processing, errors } = useForm({
        name: propCategory.name,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', propCategory.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <div className="w-full max-w-4xl mx-auto px-6 lg:px-8 pt-20 pb-10 overflow-x-hidden">
                <div className="mb-8">
                    <h1 className="text-3xl font-sfPro text-gray-900 tracking-tight">
                        Edit Kategori
                    </h1>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-6">
                        <div>
                            <label className="block text-sm font-sfPro text-gray-700 mb-2">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan Nama Kategori"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full bg-white border ${
                                    errors.name ? 'border-red-500' : 'border-black'
                                } rounded-xl px-4 py-3 text-sm mt-4 outline-none focus:outline-none ring-0 focus:ring-0 focus:border-black appearance-none font-sfPro transition-colors`}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                                    <span className="w-1 h-1 bg-red-500 rounded-full" />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="pt-4 flex items-center justify-end gap-3">
                            <Link
                                href={route('admin.categories.index')}
                                className="px-6 py-2.5 text-sm font-sfPro text-white bg-red-500 border border-red-500 rounded-xl hover:bg-red-600 transition-colors"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-black text-white px-8 py-2.5 rounded-xl text-sm font-sfPro disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                {processing ? 'Memperbarui...' : 'Perbarui'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}