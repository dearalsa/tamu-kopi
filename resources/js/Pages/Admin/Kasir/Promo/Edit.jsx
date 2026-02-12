import React, { useState, useRef, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Download, X, AlertCircle, Save } from 'lucide-react';

// Perhatikan props "promo" diterima dari Controller edit()
export default function Edit({ categories, allMenus, promo }) {
  // Cek mode awal: apakah ini paket atau bukan
  const isPackageInitial = promo.is_package === 1 || promo.is_package === true;
  
  // State untuk UI (tidak mempengaruhi data form langsung)
  const [isPackageMode] = useState(isPackageInitial); // Mode tidak bisa diubah saat Edit
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(promo.image_url);

  // Inisialisasi Form dengan data yang ada (promo.*)
  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT', // Penting untuk update file di Laravel
    name: promo.name || '',
    category_id: promo.category_id || '',
    price: promo.price || '',
    image: null,
    is_available: promo.is_available,
    package_items: promo.package_items || [],
    promo_start_date: promo.promo_start_date || '',
    promo_start_time: promo.promo_start_time || '',
    promo_end_date: promo.promo_end_date || '',
    promo_end_time: promo.promo_end_time || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Kirim ke route update
    post(route('admin.kasir.promo.update', promo.id), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const togglePackageItem = (menuId) => {
    // Kalau mode edit single promo, tidak bisa ganti item
    if (!isPackageMode) return; 

    const current = data.package_items || [];
    const exists = current.includes(menuId);
    const updated = exists
      ? current.filter((id) => id !== menuId)
      : [...current, menuId];
    setData('package_items', updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData('image', file);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-start justify-center">
        <div className="w-full max-w-2xl px-6 pt-8 pb-12 font-sfPro">
          
          <div className="mb-6 mt-4">
            <Link
              href={route('admin.kasir.promo.index')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors text-sm"
            >
              <ArrowLeft size={18} />
              <span>Kembali</span>
            </Link>
          </div>

          <div className="bg-white rounded-[30px] border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <form onSubmit={handleSubmit} className="p-8 space-y-7">
              <div className="text-center mb-6">
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
                  Edit {isPackageMode ? 'Paket Bundling' : 'Diskon Menu'}
                </h1>
              </div>

              {/* INPUT FORM: NAMA & KATEGORI (Hanya Muncul di Mode Paket) */}
              {isPackageMode ? (
                  <div className="space-y-5 border-b border-gray-100 pb-6">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-900">Nama Paket:</label>
                        <input
                          type="text"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700`}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm text-gray-900">Kategori Paket:</label>
                        <select
                          value={data.category_id}
                          onChange={(e) => setData('category_id', e.target.value)}
                          className={`w-full bg-white border ${errors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700`}
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                      </div>
                  </div>
              ) : (
                 <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex gap-3 items-center">
                    <AlertCircle size={20} />
                    <div>
                        <p className="font-bold">Mode Edit Diskon</p>
                        <p className="text-xs">Kamu sedang mengedit diskon untuk menu <strong>{promo.name}</strong>. Nama dan Kategori mengikuti data master menu.</p>
                    </div>
                 </div>
              )}

              {/* LIST MENU (Disabled di mode Single) */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  {isPackageMode ? 'Isi Paket:' : 'Menu yang Didiskon:'}
                </label>
                <div className={`border ${errors.package_items ? 'border-red-500' : 'border-gray-200'} rounded-2xl max-h-60 overflow-y-auto bg-gray-50/30`}>
                  {allMenus.map((menu) => {
                    const checked = data.package_items.includes(menu.id);
                    // Sembunyikan item lain jika mode single (supaya fokus ke item yang diedit)
                    if (!isPackageMode && !checked) return null;

                    return (
                      <button
                        key={menu.id}
                        type="button"
                        // Disable klik kalau mode single
                        onClick={() => togglePackageItem(menu.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm border-b last:border-b-0 transition-colors ${
                          checked ? 'bg-red-50/50' : 'hover:bg-white'
                        } ${!isPackageMode ? 'cursor-default' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                             {checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div>
                            <div className="text-gray-900 font-medium">{menu.name}</div>
                            <div className="text-xs text-gray-500">Normal: Rp {Number(menu.price).toLocaleString('id-ID')}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HARGA */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-900 font-bold">
                  {isPackageMode ? 'Harga Paket (Rp):' : 'Harga Diskon (Rp):'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  className={`w-full bg-white border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-xl px-3.5 py-3 text-lg font-bold outline-none focus:border-gray-700`}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* PERIODE PROMO */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                 <h3 className="text-xs font-bold text-gray-500 uppercase">Update Jadwal (Opsional)</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] text-gray-500 block mb-1">Mulai</label>
                        <div className="flex gap-2">
                            <input type="date" value={data.promo_start_date} onChange={e => setData('promo_start_date', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg"/>
                            <input type="time" value={data.promo_start_time} onChange={e => setData('promo_start_time', e.target.value)} className="w-20 text-xs border-gray-300 rounded-lg"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-500 block mb-1">Selesai</label>
                        <div className="flex gap-2">
                            <input type="date" value={data.promo_end_date} onChange={e => setData('promo_end_date', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg"/>
                            <input type="time" value={data.promo_end_time} onChange={e => setData('promo_end_time', e.target.value)} className="w-20 text-xs border-gray-300 rounded-lg"/>
                        </div>
                    </div>
                 </div>
              </div>

              {/* IMAGE (Hanya untuk Paket) */}
              {isPackageMode && (
                <div className="space-y-2">
                    <label className="block text-sm text-gray-900">Update Gambar:</label>
                    <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full border border-gray-300 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[150px] relative bg-gray-50/50 hover:bg-gray-100 transition-colors">
                        {preview ? (
                            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Download size={20} className="text-gray-400" />
                                <span className="text-xs text-gray-500">Ganti Gambar</span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-[#EF5350] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#e53935] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
              >
                {processing ? 'Menyimpan...' : <><Save size={18}/> Simpan Perubahan</>}
              </button>

            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}