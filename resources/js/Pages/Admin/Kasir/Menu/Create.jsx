import React, { useState, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  Download,
  X,
  ArrowLeft,
  Check,
  X as XIcon,
  CircleDollarSign,
  Utensils,
} from 'lucide-react';

export default function Create({ categories }) {
  const fileInputRef = useRef(null);
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    category_id: '',
    price: '',
    image: null,
    is_available: 1,
    is_best_seller: '', 
  });

  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setData('image', null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.kasir.menus.store'), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-start justify-center">
        <div className="w-full max-w-2xl px-6 pt-8 pb-12">
          <div className="mb-6 mt-4">
            <Link
              href={route('admin.kasir.menus.index')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="bg-white rounded-[30px] border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="mb-8">
                <h1 className="text-2xl font-sfPro text-gray-900 text-center tracking-tight">
                  Tambah Menu Baru
                </h1>
              </div>

              {/* nama menu baru */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Nama Menu:
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Utensils className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Masukkan Nama Menu"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full bg-white border ${
                      errors.name ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 placeholder:text-gray-400 shadow-sm`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* input nominal harga */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Nominal Harga:
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <CircleDollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    placeholder="Masukkan Harga"
                    value={data.price}
                    onChange={(e) => setData('price', e.target.value)}
                    className={`w-full bg-white border ${
                      errors.price ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 placeholder:text-gray-400 shadow-sm`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* selecet kategori dari tabel kategori */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Kategori:
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M4 6h16M4 12h10M4 18h6"
                      />
                    </svg>
                  </span>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className={`w-full bg-white border ${
                      errors.category_id ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-12 py-3 text-sm outline-none appearance-none bg-none !bg-none bg-no-repeat focus:outline-none focus:ring-0 focus:border-gray-500 cursor-pointer ${
                      !data.category_id ? 'text-gray-400' : 'text-gray-900'
                    } shadow-sm transition-colors duration-150 hover:border-gray-500`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                {errors.category_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category_id}
                  </p>
                )}
              </div>

              {/* status tersedia atau tidak */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Status:
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {String(data.is_available) === '1' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <XIcon className="w-4 h-4" />
                    )}
                  </span>
                  <select
                    value={String(data.is_available)}
                    onChange={(e) =>
                      setData('is_available', Number(e.target.value))
                    }
                    className="w-full bg-white border border-gray-400 rounded-xl pl-9 pr-12 py-3 text-sm outline-none appearance-none bg-none !bg-none bg-no-repeat focus:outline-none focus:ring-0 focus:border-gray-500 cursor-pointer text-gray-900 shadow-sm transition-colors duration-150 hover:border-gray-500"
                  >
                    <option value="1">Tersedia</option>
                    <option value="0">Habis</option>
                  </select>

                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* pilihan best seller atau tidak */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Best Seller:
                </label>

                <div className="relative">
                  <select
                    value={data.is_best_seller === '' ? '' : String(data.is_best_seller)}
                    onChange={(e) =>
                      setData(
                        'is_best_seller',
                        e.target.value === '' ? '' : Number(e.target.value)
                      )
                    }
                    className={`w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm outline-none appearance-none bg-none !bg-none bg-no-repeat focus:outline-none focus:ring-0 focus:border-gray-500 cursor-pointer shadow-sm transition-colors duration-150 hover:border-gray-500 ${
                      data.is_best_seller === '' ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    <option value="" disabled>
                      Apakah menu ini Best Seller?
                    </option>
                    <option value="0">Bukan Best Seller</option>
                    <option value="1">Best Seller</option>
                  </select>

                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* pilih gambar */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Pilih Gambar:
                </label>
                <div
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  className="w-full border border-gray-300 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[180px] relative overflow-hidden bg-gray-50/40 hover:bg-gray-100 transition-colors duration-150"
                >
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="bg-black/60 text-white rounded-full p-2"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="bg-black text-white p-2.5 rounded-lg">
                        <Download size={22} />
                      </div>
                      <p className="text-xs font-sfPro text-gray-500 tracking-wide">
                        Pilih File
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {errors.image && (
                  <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                )}
              </div>

              {/* button simpan menu baru */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#EF5350] text-white font-sfPro py-4 rounded-xl text-sm hover:bg-[#e53935] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : 'Tambah Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
