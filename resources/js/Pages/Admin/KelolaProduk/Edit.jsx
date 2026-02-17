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
  Package,
  FileText,
  ChevronDown,
} from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function Edit({ product, categories }) {
  const fileInputRef = useRef(null);

  const { data, setData, post, processing, errors } = useForm({
    name: product.name || '',
    category_id: product.category_id ? String(product.category_id) : '',
    date: product.date ? dayjs(product.date).format('YYYY-MM-DD') : '',
    price: product.price ? String(product.price) : '',
    status: product.status || 'tersedia',
    description: product.description || '',
    proof: null, 
    keep_old_proof: product.proof || null, 
    _method: 'PUT',
  });

  const [preview, setPreview] = useState(
    product.proof ? `/storage/${product.proof}` : null
  );

  const formatRupiah = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numberString = value.toString().replace(/[^,\d]/g, '');
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const cleanThousandSeparator = (value) => {
    return value.toString().replace(/\./g, '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('proof', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setData('proof', null);
    setData('keep_old_proof', null); 
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.kelola-produk.update', product.id), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-start justify-center bg-gray-50/30">
        <div className="w-full max-w-2xl px-6 pt-8 pb-12">
          <div className="mb-6 mt-4">
            <Link
              href={route('admin.kelola-produk.index')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-sfPro">Kembali</span>
            </Link>
          </div>

          <div className="bg-white rounded-[30px] border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <form onSubmit={handleSubmit} className="p-10 space-y-7">
              <div className="mb-4">
                <h1 className="text-2xl font-sfPro text-gray-900 text-center tracking-tight">
                  Edit Produk
                </h1>
                <p className="text-sm text-gray-500 text-center mt-1">Edit produk yang sudah dibeli</p>
              </div>

              {/* nama produk */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Nama Produk:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Package className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Masukkan nama produk yang dibeli"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className={`w-full bg-white border ${
                      errors.name ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 font-sfPro`}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* tanggal */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Tanggal:
                </label>
                <ConfigProvider locale={idID}>
                  <div className="w-full rounded-xl border border-gray-400 px-3 py-[6px] text-sm focus-within:border-gray-500 bg-white">
                    <DatePicker
                      className="w-full !border-none !shadow-none focus:!shadow-none focus:!border-none focus:!outline-none"
                      format="DD MMMM YYYY"
                      value={
                        data.date ? dayjs(data.date, 'YYYY-MM-DD') : null
                      }
                      onChange={(value) => {
                        const formatted = value
                          ? value.format('YYYY-MM-DD')
                          : '';
                        setData('date', formatted);
                      }}
                      allowClear
                    />
                  </div>
                </ConfigProvider>
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              {/* nominal harga */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Nominal Harga:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <CircleDollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="0"
                    value={formatRupiah(data.price)}
                    onChange={(e) =>
                      setData('price', cleanThousandSeparator(e.target.value))
                    }
                    className={`w-full bg-white border ${
                      errors.price ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 font-sfPro`}
                  />
                </div>
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>

              {/* kategori */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Kategori:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <FileText className="w-4 h-4" />
                  </span>
                  <select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                    className={`w-full bg-white border ${
                      errors.category_id ? 'border-red-500' : 'border-gray-400'
                    } rounded-xl pl-9 pr-12 py-3 text-sm outline-none appearance-none bg-none focus:outline-none focus:ring-0 focus:border-gray-500 font-sfPro ${
                      !data.category_id ? 'text-gray-400' : 'text-gray-900'
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <ChevronDown size={18} className="block" />
                  </div>
                </div>
                {errors.category_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category_id}
                  </p>
                )}
              </div>

              {/* status */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Status:
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    {data.status === 'tersedia' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <XIcon className="w-4 h-4" />
                    )}
                  </span>
                  <select
                    value={data.status}
                    onChange={(e) => setData('status', e.target.value)}
                    className="w-full bg-white border border-gray-400 rounded-xl pl-9 pr-12 py-3 text-sm outline-none appearance-none bg-none focus:outline-none focus:ring-0 focus:border-gray-500 font-sfPro text-gray-900"
                  >
                    <option value="tersedia">Tersedia</option>
                    <option value="habis">Habis</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <ChevronDown size={18} className="block" />
                  </div>
                </div>
              </div>

              {/* keterangan */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Keterangan:
                </label>
                <textarea
                  placeholder="Masukkan deskripsi atau keterangan tambahan terkait produk yang dibeli"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-white border border-gray-400 rounded-xl px-4 py-3 text-sm outline-none focus:outline-none focus:ring-0 focus:border-gray-500 font-sfPro min-h-[100px] resize-none"
                />
              </div>

              {/* bukti berupa gambar */}
              <div className="space-y-3">
                <label className="block text-sm font-sfPro text-gray-800">
                  Bukti Produk (Gambar):
                </label>
                <div
                  onClick={() =>
                    fileInputRef.current && fileInputRef.current.click()
                  }
                  className="w-full border border-gray-300 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[180px] relative overflow-hidden bg-gray-50/40 hover:bg-gray-100 transition-colors"
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
                          className="bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
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
                      <p className="text-xs font-sfPro text-gray-500">
                        Ganti File Bukti
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
                {errors.proof && (
                  <p className="text-red-500 text-xs mt-1">{errors.proof}</p>
                )}
              </div>

              {/* button simpan */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#EF5350] text-white font-sfPro py-4 rounded-xl text-sm hover:bg-[#e53935] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {processing ? 'Menyimpan...' : 'Perbarui Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
