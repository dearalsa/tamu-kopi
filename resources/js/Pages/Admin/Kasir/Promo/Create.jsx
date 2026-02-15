import React, { useState, useRef, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Square, Download, X, AlertCircle } from 'lucide-react';
import { DatePicker, TimePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

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

  // Fungsi untuk format titik ribuan (Gaya Indonesia)
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

  // Fungsi untuk membersihkan titik sebelum disimpan ke state data
  const cleanThousandSeparator = (value) => {
    return value.toString().replace(/\./g, '');
  };

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

  // helper class untuk input agar konsisten (gray-400 ke gray-500, no blue, no shadow, no bold)
  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:border-gray-500 focus:ring-0 shadow-none font-normal";

  return (
    <ConfigProvider 
      locale={idID}
      theme={{
        token: {
          colorPrimary: '#9ca3af', // gray-400 sebagai warna utama saat aktif
          borderRadius: 12,
          controlOutline: 'transparent', 
        },
        components: {
          DatePicker: {
            activeBorderColor: '#6b7280', // gray-500 pas diklik
            hoverBorderColor: '#9ca3af', // gray-400 pas hover
            activeShadow: 'none', 
          },
          TimePicker: {
            activeBorderColor: '#6b7280', // gray-500 pas diklik
            hoverBorderColor: '#9ca3af', // gray-400 pas hover
            activeShadow: 'none', 
          },
        },
      }}
    >
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
                          <label className="block text-sm text-gray-900 font-sfPro">Nama Paket:</label>
                          <input
                            type="text"
                            placeholder="Contoh: Paket Hemat Berdua"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className={inputClass}
                          />
                          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm text-gray-900 font-sfPro">Kategori Paket:</label>
                          <select
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                            className={`${inputClass} appearance-none`}
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
                  <label className="block text-sm text-gray-900 font-sfPro">
                    {isPackageMode ? 'Pilih Isi Paket (Bisa Banyak):' : 'Pilih 1 Menu yang Didiskon:'}
                  </label>

                  <div className={`border ${errors.package_items ? 'border-red-500' : 'border-gray-200'} rounded-2xl max-h-60 overflow-y-auto bg-gray-50/30`}>
                    {allMenus.length === 0 && (
                      <p className="text-xs text-gray-500 px-4 py-4 text-center font-sfPro">Belum ada menu utama.</p>
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
                          <div className="flex items-center gap-3 font-sfPro">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${checked ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                               {checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <div className="text-gray-900 font-normal">{menu.name}</div>
                              <div className="text-xs text-gray-500 font-normal">Normal: Rp {Number(menu.price).toLocaleString('id-ID')}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.package_items && <p className="text-xs text-red-500">{errors.package_items}</p>}
                  
                  {/* info box untuk single mode */}
                  {!isPackageMode && data.package_items.length > 0 && (
                      <div className="flex gap-2 items-start bg-blue-50 text-blue-700 p-3 rounded-xl text-xs mt-2 font-sfPro">
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
                    type="text"
                    placeholder="0"
                    value={formatRupiah(data.price)}
                    onChange={(e) => {
                      const rawValue = cleanThousandSeparator(e.target.value);
                      setData('price', rawValue);
                    }}
                    className={`${inputClass} text-lg font-normal`}
                  />
                  {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                </div>

                {/* periode promo, input jam di bawah tanggal */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                   <h3 className="text-xs font-sfPro text-gray-500 uppercase font-sfPro tracking-widest font-normal">Jadwal Promo</h3>
                   <div className="grid grid-cols-2 gap-8">
                      {/* bagian mulai */}
                      <div className="flex flex-col gap-4">
                          <label className="text-[11px] text-gray-400 font-sfPro uppercase block font-normal">Waktu Mulai</label>
                          <div className="space-y-3">
                              <DatePicker 
                                placeholder="Tanggal Mulai"
                                format="YYYY-MM-DD"
                                className="w-full rounded-xl border-gray-400 transition-all focus:border-gray-500 shadow-none py-2.5 font-normal"
                                onChange={(date, dateString) => setData('promo_start_date', dateString)}
                              />
                              <TimePicker 
                                placeholder="Jam Mulai"
                                format="HH:mm"
                                className="w-full rounded-xl border-gray-400 transition-all focus:border-gray-500 shadow-none py-2.5 font-normal"
                                onChange={(time, timeString) => setData('promo_start_time', timeString)}
                              />
                          </div>
                      </div>

                      {/* bagian selesai */}
                      <div className="flex flex-col gap-4">
                          <label className="text-[11px] text-gray-400 font-sfPro uppercase block font-normal">Waktu Selesai</label>
                          <div className="space-y-3">
                              <DatePicker 
                                placeholder="Tanggal Selesai"
                                format="YYYY-MM-DD"
                                className="w-full rounded-xl border-gray-400 transition-all focus:border-gray-500 shadow-none py-2.5 font-normal"
                                onChange={(date, dateString) => setData('promo_end_date', dateString)}
                              />
                              <TimePicker 
                                placeholder="Jam Selesai"
                                format="HH:mm"
                                className="w-full rounded-xl border-gray-400 transition-all focus:border-gray-500 shadow-none py-2.5 font-normal"
                                onChange={(time, timeString) => setData('promo_end_time', timeString)}
                              />
                          </div>
                      </div>
                   </div>
                </div>

                {/* image (hanya untuk paket) */}
                {isPackageMode && (
                  <div className="space-y-2 font-sfPro">
                      <label className="block text-sm text-gray-900 font-normal">Gambar Paket:</label>
                      <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="w-full border border-gray-300 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer min-h-[150px] relative bg-gray-50/50 hover:bg-gray-100 transition-colors">
                          {preview ? (
                              <>
                                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5"><X size={14} /></button>
                              </>
                          ) : (
                              <div className="flex flex-col items-center gap-2">
                                  <Download size={20} className="text-gray-400" />
                                  <span className="text-xs text-gray-500 font-normal">Upload Gambar</span>
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
                  className="w-full bg-[#EF5350] text-white py-4 rounded-xl font-sfPro text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-100"
                >
                  {processing ? 'Menyimpan...' : (isPackageMode ? 'Buat Paket Baru' : 'Simpan Diskon')}
                </button>

              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
}