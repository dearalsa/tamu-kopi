import React, { useState, useRef } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Download, AlertCircle, Save } from 'lucide-react';
import { DatePicker, TimePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function Edit({ categories, allMenus, promo }) {
  const isPackageInitial = promo.is_package === 1 || promo.is_package === true;
  const [isPackageMode] = useState(isPackageInitial);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(promo.image_url || null);

  const { data, setData, post, processing, errors } = useForm({
    _method: 'PUT',
    name: promo.name || '',
    category_id: promo.category_id || '',
    price: promo.price || '',
    image: null,
    keep_old_image: promo.image_path || null,
    is_available: promo.is_available,
    package_items: promo.package_items || [],
    promo_start_date: promo.promo_start_date || null,
    promo_start_time: promo.promo_start_time || null,
    promo_end_date: promo.promo_end_date || null,
    promo_end_time: promo.promo_end_time || null,
  });

  const formatRupiah = (value) => {
    if (!value) return '';
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

  const cleanThousandSeparator = (value) => value.toString().replace(/\./g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.kasir.promo.update', promo.id), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const togglePackageItem = (menuId) => {
    const current = data.package_items || [];
    if (!isPackageMode) {
        setData('package_items', [menuId]);
        return;
    }
    const updated = current.includes(menuId) 
        ? current.filter((id) => id !== menuId) 
        : [...current, menuId];
    setData('package_items', updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({ ...prev, image: file, keep_old_image: 'has_new' }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setData((prev) => ({ ...prev, image: null, keep_old_image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputClass = 'w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none transition-all focus:border-gray-500 focus:ring-0 shadow-none font-normal';

  return (
    <ConfigProvider locale={idID} theme={{ token: { colorPrimary: '#9ca3af', borderRadius: 12 }, components: { DatePicker: { activeBorderColor: '#6b7280' }, TimePicker: { activeBorderColor: '#6b7280' } } }}>
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
                <h1 className="text-xl font-sfPro text-gray-900 tracking-tight text-center">Edit {isPackageMode ? 'Paket Bundling' : 'Diskon Menu'}</h1>

                {!isPackageMode && (
                  <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm flex gap-3 items-center border border-blue-100">
                    <AlertCircle size={20} className="shrink-0" />
                    <div><p className="font-sfPro">Mode Diskon Satuan</p><p className="text-xs opacity-80">Mengubah harga promo untuk menu <strong>{promo.name}</strong>.</p></div>
                  </div>
                )}

                {isPackageMode && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 ml-1 tracking-wider uppercase font-sfPro">Nama Paket</label>
                      <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 ml-1 tracking-wider uppercase font-sfPro">Kategori</label>
                      <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className={inputClass}>
                        <option value="">Pilih Kategori</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm text-gray-900">Gambar Promo:</label>
                        <div onClick={() => fileInputRef.current?.click()} className="w-full border border-gray-300 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer min-h-[160px] relative overflow-hidden bg-gray-50/40 hover:bg-gray-100 transition-colors">
                            {preview ? (
                                <><img src={preview} alt="Promo" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20 flex items-center justify-center"><button type="button" onClick={removeImage} className="bg-black/60 text-white rounded-full px-3 py-1.5 text-[11px] hover:bg-black/80">Hapus gambar</button></div></>
                            ) : (
                                <div className="flex flex-col items-center gap-2"><div className="bg-black text-white p-2.5 rounded-lg"><Download size={20} /></div><p className="text-xs text-gray-500">Pilih / ganti gambar promo</p></div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="block text-sm text-gray-900">{isPackageMode ? 'Pilih Isi Paket:' : 'Menu yang Didiskon:'}</label>
                  <div className="border border-gray-200 rounded-2xl max-h-52 overflow-y-auto bg-gray-50/30 font-normal">
                    {allMenus.map((menu) => {
                      const checked = data.package_items.includes(menu.id);
                      if (!isPackageMode && !checked) return null;
                      return (
                        <button key={menu.id} type="button" onClick={() => togglePackageItem(menu.id)} className={`w-full flex items-center justify-between px-4 py-3 border-b last:border-b-0 transition-colors ${checked ? 'bg-red-50/40' : 'hover:bg-white'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}>
                              {checked && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div className="text-left"><p className="text-sm text-gray-800">{menu.name}</p><p className="text-[10px] text-gray-400">Normal: Rp {Number(menu.price).toLocaleString('id-ID')}</p></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 ml-1 tracking-wider uppercase font-sfPro">Harga Diskon Baru</label>
                  <input type="text" value={formatRupiah(data.price)} onChange={(e) => setData('price', cleanThousandSeparator(e.target.value))} className={`${inputClass} text-lg`} placeholder="0" />
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-6 border border-gray-100 font-sfPro">
                  <h3 className="text-xs text-gray-400 uppercase tracking-widest text-center">Periode Aktif Promo</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 uppercase block ml-1">Mulai Berlaku</label>
                      <DatePicker placeholder="Pilih Tanggal" format="YYYY-MM-DD" value={data.promo_start_date ? dayjs(data.promo_start_date) : null} onChange={(_, ds) => setData('promo_start_date', ds)} className="w-full rounded-xl py-2.5" />
                      <TimePicker placeholder="Pilih Jam" format="HH:mm" value={data.promo_start_time ? dayjs(data.promo_start_time, 'HH:mm') : null} onChange={(_, ts) => setData('promo_start_time', ts)} className="w-full rounded-xl py-2.5" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] text-gray-400 uppercase block ml-1">Selesai Pada</label>
                      <DatePicker placeholder="Pilih Tanggal" format="YYYY-MM-DD" value={data.promo_end_date ? dayjs(data.promo_end_date) : null} onChange={(_, ds) => setData('promo_end_date', ds)} className="w-full rounded-xl py-2.5" />
                      <TimePicker placeholder="Pilih Jam" format="HH:mm" value={data.promo_end_time ? dayjs(data.promo_end_time, 'HH:mm') : null} onChange={(_, ts) => setData('promo_end_time', ts)} className="w-full rounded-xl py-2.5" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={processing} className="w-full bg-[#EF5350] text-white py-4 rounded-xl text-sm font-sfPro transition-all flex items-center justify-center gap-2 hover:bg-[#e53935] shadow-lg shadow-red-100">
                  {processing ? 'Menyimpan...' : <><Save size={18} /> Simpan Perubahan</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ConfigProvider>
  );
}