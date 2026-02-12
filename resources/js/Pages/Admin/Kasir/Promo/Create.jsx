import React, { useState, useRef, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Square, Download, X, AlertCircle } from 'lucide-react';

export default function Create({ categories, allMenus }) {
  const [isPackageMode, setIsPackageMode] = useState(false);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const { data, setData, post, processing, errors, clearErrors } = useForm({
    name: '',
    category_id: '',
    price: '',
    image: null,
    is_available: 1,
    package_items: [],
    promo_start_date: '',
    promo_start_time: '',
    promo_end_date: '',
    promo_end_time: '',
  });

  useEffect(() => {
    clearErrors();
  }, [isPackageMode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.kasir.promo.store'), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const togglePackageItem = (menuId) => {
    const current = data.package_items || [];
    const exists = current.includes(menuId);
    
    if (!isPackageMode) {
        // ini hanya boleh milih satu menu
        setData('package_items', [menuId]);
        return;
    }

    // ini untuk mode paket, bisa milih banyak
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

  const removeImage = (e) => {
    e.stopPropagation();
    setData('image', null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-start justify-center">
        <div className="w-full max-w-2xl px-6 pt-8 pb-12 font-sfPro">
          
          {/* header link */}
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
                <h1 className="text-xl font-sfPro text-gray-900 tracking-tight">
                  {isPackageMode ? 'Buat Paket Bundling' : 'Atur Diskon Menu'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {isPackageMode ? 'Gabungkan beberapa menu menjadi satu harga paket.' : 'Ubah harga satu menu tertentu menjadi harga promo.'}
                </p>
              </div>

              {/* toggle menu */}
              <div className="bg-gray-50 p-1.5 rounded-2xl flex relative">
                 <button
                    type="button"
                    onClick={() => { setIsPackageMode(false); setData('package_items', []); }}
                    className={`flex-1 py-2.5 text-sm font-sfPro rounded-xl transition-all relative z-10 ${!isPackageMode ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Promo Satuan
                 </button>
                 <button
                    type="button"
                    onClick={() => { setIsPackageMode(true); setData('package_items', []); }}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all relative z-10 ${isPackageMode ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                    Paket Bundling
                 </button>
              </div>

              {/* input form nama dan kategori (hanya muncul di mode paket) */}
              {isPackageMode && (
                  <div className="space-y-5 border-b border-gray-100 pb-6">
                      <div className="space-y-2">
                        <label className="block text-sm text-gray-900">Nama Paket:</label>
                        <input
                          type="text"
                          placeholder="Contoh: Paket Hemat Berdua"
                          value={data.name}
                          onChange={(e) => setData('name', e.target.value)}
                          className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-400'} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-0 focus:border-gray-500`}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm text-gray-900">Kategori Paket:</label>
                        <select
                          value={data.category_id}
                          onChange={(e) => setData('category_id', e.target.value)}
                          className={`w-full bg-white border ${errors.category_id ? 'border-red-500' : 'border-gray-400'} rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-0 focus:border-gray-500`}
                        >
                          <option value="">Pilih Kategori</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        {errors.category_id && <p className="text-xs text-red-500">{errors.category_id}</p>}
                      </div>
                  </div>
              )}

              {/* pilih menu (logic berbeda tergantung mode) */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  {isPackageMode ? 'Pilih Isi Paket (Bisa Banyak):' : 'Pilih 1 Menu yang Didiskon:'}
                </label>

                <div className={`border ${errors.package_items ? 'border-red-500' : 'border-gray-200'} rounded-2xl max-h-60 overflow-y-auto bg-gray-50/30`}>
                  {allMenus.length === 0 && (
                    <p className="text-xs text-gray-500 px-4 py-4 text-center">Belum ada menu utama.</p>
                  )}

                  {allMenus.map((menu) => {
                    const checked = data.package_items.includes(menu.id);
                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => togglePackageItem(menu.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm border-b last:border-b-0 transition-colors ${
                          checked ? 'bg-red-50/50' : 'hover:bg-white'
                        }`}
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
                {errors.package_items && <p className="text-xs text-red-500">{errors.package_items}</p>}
                
                {/* info box untuk single mode */}
                {!isPackageMode && data.package_items.length > 0 && (
                    <div className="flex gap-2 items-start bg-blue-50 text-blue-700 p-3 rounded-xl text-xs mt-2">
                        <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                        <p>Kamu memilih menu <strong>{allMenus.find(m => m.id === data.package_items[0])?.name}</strong>. Harga lama akan dicoret menjadi harga promo di bawah ini.</p>
                    </div>
                )}
              </div>

              {/* harga promo */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-900 font-sfPro">
                  {isPackageMode ? 'Harga Paket:' : 'Harga Setelah Diskon (Rp):'}
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  className={`w-full bg-white border ${errors.price ? 'border-red-500' : 'border-gray-400'} rounded-xl px-3.5 py-3 text-lg font-bold outline-none focus:ring-0 focus:border-gray-500`}
                />
                {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* periode promo */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                 <h3 className="text-xs font-sfPro text-gray-500 uppercase">Jadwal Promo (Opsional)</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] text-gray-500 block mb-1">Mulai</label>
                        <div className="flex gap-2">
                            <input type="date" value={data.promo_start_date} onChange={e => setData('promo_start_date', e.target.value)} className="w-full text-xs border-gray-400 rounded-lg outline-none focus:ring-0 focus:border-gray-500"/>
                            <input type="time" value={data.promo_start_time} onChange={e => setData('promo_start_time', e.target.value)} className="w-full text-xs border-gray-400 rounded-lg outline-none focus:ring-0 focus:border-gray-500"/>
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-gray-500 block mb-1">Selesai</label>
                        <div className="flex gap-2">
                            <input type="date" value={data.promo_end_date} onChange={e => setData('promo_end_date', e.target.value)} className="w-full text-xs border-gray-400 rounded-lg outline-none focus:ring-0 focus:border-gray-500"/>
                            <input type="time" value={data.promo_end_time} onChange={e => setData('promo_end_time', e.target.value)} className="w-full text-xs border-gray-400 rounded-lg outline-none focus:ring-0 focus:border-gray-500"/>
                        </div>
                    </div>
                 </div>
              </div>

              {/* image (hanya untuk paket) */}
              {isPackageMode && (
                <div className="space-y-2">
                    <label className="block text-sm text-gray-900">Gambar Paket:</label>
                    <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full border border-gray-300 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[150px] relative bg-gray-50/50 hover:bg-gray-100 transition-colors">
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"><X size={14} /></button>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Download size={20} className="text-gray-400" />
                                <span className="text-xs text-gray-500">Upload Gambar</span>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>
                </div>
              )}

              {/* button simpan */}
              <button
                type="submit"
                disabled={processing || data.package_items.length === 0}
                className="w-full bg-[#EF5350] text-white py-4 rounded-xl font-sfPro text-sm hover:bg-[#e53935] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-100"
              >
                {processing ? 'Menyimpan...' : (isPackageMode ? 'Buat Paket Baru' : 'Simpan Diskon')}
              </button>

            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}