import React, { useState, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Download, AlertCircle, Save } from 'lucide-react';
import { DatePicker, TimePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

export default function Edit({ categories, allMenus, promo }) {
  const isPackageInitial = promo.is_package === 1 || promo.is_package === true;
  const [isPackageMode] = useState(isPackageInitial); 
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(promo.image_url);

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT', 
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
    post(route('admin.kasir.promo.update', promo.id), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  // Fungsi toggle menu khusus untuk Paket Bundling
  const togglePackageItem = (menuId) => {
    const current = data.package_items || [];
    const exists = current.includes(menuId);
    
    if (!isPackageMode) {
        // Jika mode satuan, hanya pastikan menu ini yang ada di list (readonly logic)
        setData('package_items', [menuId]);
        return;
    }

    // Jika mode paket, bisa pilih banyak
    const updated = exists 
      ? current.filter((id) => id !== menuId) 
      : [...current, menuId];
    setData('package_items', updated);
  };

  // helper class untuk input agar konsisten (gray-400 ke gray-500, no blue, no shadow, no bold)
  const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-500 focus:ring-0 shadow-none font-normal";

  return (
    <ConfigProvider 
      locale={idID}
      theme={{
        token: { 
          colorPrimary: '#9ca3af', 
          borderRadius: 12, 
          controlOutline: 'transparent',
          fontFamily: 'SF Pro Display'
        },
        components: {
          DatePicker: { 
            activeBorderColor: '#6b7280', 
            hoverBorderColor: '#9ca3af',
            activeShadow: 'none',
          },
          TimePicker: { 
            activeBorderColor: '#6b7280',
            hoverBorderColor: '#9ca3af', 
            activeShadow: 'none',
          }
        }
      }}
    >
      <AdminLayout>
        <div className="min-h-screen flex items-start justify-center">
          <div className="w-full max-w-2xl px-6 pt-8 pb-12 font-sfPro">
            <div className="mb-6 mt-4">
              <Link href={route('admin.kasir.promo.index')} className="inline-flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors text-sm">
                <ArrowLeft size={18} /> <span>Kembali</span>
              </Link>
            </div>

            <div className="bg-white rounded-[30px] border border-gray-200 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              <form onSubmit={handleSubmit} className="p-8 space-y-7">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-sfPro text-gray-900 tracking-tight">
                    Edit {isPackageMode ? 'Paket Bundling' : 'Diskon Menu'}
                  </h1>
                </div>

                {!isPackageMode && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex gap-3 items-center border border-blue-100">
                    <AlertCircle size={20} className="shrink-0" />
                    <div>
                        <p className="font-sfPro">Mode Diskon Satuan</p>
                        <p className="text-xs opacity-80 font-sfPro">Mengubah harga promo untuk menu <strong>{promo.name}</strong>.</p>
                    </div>
                  </div>
                )}

                {isPackageMode && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500 ml-1 tracking-wider font-sfPro">Nama Paket</label>
                        <input 
                          type="text" 
                          value={data.name} 
                          onChange={(e) => setData('name', e.target.value)} 
                          className={inputClass} 
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500 ml-1 tracking-wider font-sfPro">Kategori</label>
                        <select 
                          value={data.category_id} 
                          onChange={(e) => setData('category_id', e.target.value)} 
                          className={`${inputClass} appearance-none`}
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                        </select>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm text-gray-900 font-sfPro">{isPackageMode ? 'Pilih Isi Paket:' : 'Menu yang Didiskon:'}</label>
                  <div className="border border-gray-200 rounded-2xl max-h-52 overflow-y-auto bg-gray-50/30 font-normal">
                    {allMenus.map((menu) => {
                      const checked = data.package_items.includes(menu.id);
                      // Jika mode satuan, kita hanya tampilkan menu yang sedang diedit saja
                      if (!isPackageMode && !checked) return null;

                      return (
                        <button 
                            key={menu.id} 
                            type="button"
                            onClick={() => togglePackageItem(menu.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors ${checked ? 'bg-red-50/40' : 'hover:bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                               {checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-800 font-normal">{menu.name}</p>
                                <p className="text-[10px] text-gray-400 font-sfPro tracking-tight">Normal: Rp {Number(menu.price).toLocaleString('id-ID')}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 ml-1 tracking-wider font-sfPro">Harga Diskon Baru</label>
                  <input 
                    type="text" 
                    placeholder="0"
                    value={formatRupiah(data.price)} 
                    onChange={(e) => {
                      const rawValue = cleanThousandSeparator(e.target.value);
                      setData('price', rawValue);
                    }} 
                    className={`${inputClass} text-lg`} 
                  />
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100">
                   <h3 className="text-xs text-gray-400 uppercase tracking-widest font-normal text-center">Periode Aktif Promo</h3>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                          <label className="text-[11px] text-gray-400 uppercase block ml-1 font-sfPro">Mulai Berlaku</label>
                          <DatePicker 
                            placeholder="Pilih Tanggal" format="YYYY-MM-DD" className="w-full rounded-xl border-gray-300 py-2.5 shadow-none transition-all font-sfPro"
                            value={data.promo_start_date ? dayjs(data.promo_start_date) : null}
                            onChange={(date, dateString) => setData('promo_start_date', dateString)}
                          />
                          <TimePicker 
                            placeholder="Pilih Jam" format="HH:mm" className="w-full rounded-xl border-gray-300 py-2.5 shadow-none transition-all font-sfPro"
                            value={data.promo_start_time ? dayjs(data.promo_start_time, 'HH:mm') : null}
                            onChange={(time, timeString) => setData('promo_start_time', timeString)}
                          />
                      </div>
                      <div className="space-y-3">
                          <label className="text-[11px] text-gray-400 uppercase block ml-1 font-sfPro">Selesai Pada</label>
                          <DatePicker 
                            placeholder="Pilih Tanggal" format="YYYY-MM-DD" className="w-full rounded-xl border-gray-300 py-2.5 shadow-none transition-all font-sfPro"
                            value={data.promo_end_date ? dayjs(data.promo_end_date) : null}
                            onChange={(date, dateString) => setData('promo_end_date', dateString)}
                          />
                          <TimePicker 
                            placeholder="Pilih Jam" format="HH:mm" className="w-full rounded-xl border-gray-300 py-2.5 shadow-none transition-all font-sfPro"
                            value={data.promo_end_time ? dayjs(data.promo_end_time, 'HH:mm') : null}
                            onChange={(time, timeString) => setData('promo_end_time', timeString)}
                          />
                      </div>
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={processing} 
                  className="w-full bg-[#EF5350] text-white py-4 rounded-xl text-sm font-sfPro transition-all flex items-center justify-center gap-2 hover:bg-[#e53935] active:bg-[#d32f2f] shadow-lg shadow-red-100"
                >
                  {processing ? 'Menyimpan...' : <><Save size={18}/> Simpan Perubahan</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
}