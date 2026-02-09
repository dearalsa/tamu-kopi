import React, { useState, useRef, useEffect } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ArrowLeft, CheckSquare, Square, Download, X } from 'lucide-react';

export default function Edit({ promo, categories, allMenus }) {
  const [isPackageMode, setIsPackageMode] = useState(
    (promo.package_items || []).length > 1
  );

  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(promo.image_url || null);
  const [nameTouched, setNameTouched] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    name: promo.name || '',
    category_id: promo.category_id || '',
    price: promo.price || '',
    image: null,
    is_available: promo.is_available ? 1 : 0,
    package_items: promo.package_items || [],
    promo_start_date: promo.promo_start_date || '',
    promo_start_time: promo.promo_start_time || '',
    promo_end_date: promo.promo_end_date || '',
    promo_end_time: promo.promo_end_time || '',
    _method: 'PUT',
    remove_image: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('admin.kasir.promo.update', promo.id), {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const togglePackageItem = (menuId) => {
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
      setData('remove_image', false);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setData('image', null);
    setData('remove_image', true);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (!isPackageMode && data.package_items.length > 1) {
      setData('package_items', [data.package_items[0]]);
      return;
    }

    if (!isPackageMode && data.package_items.length === 1) {
      const selectedId = data.package_items[0];
      const selectedMenu = allMenus.find((m) => m.id === selectedId);

      if (selectedMenu) {
        if (!nameTouched) {
          setData('name', selectedMenu.name);
        }

        if (!data.image && !data.remove_image && selectedMenu.image) {
          const imgUrl = `/storage/${selectedMenu.image}`;
          setPreview(imgUrl);
        }
      }
    }
  }, [isPackageMode, data.package_items, allMenus, nameTouched, data.image, data.remove_image, setData]);

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
              <div className="mb-2">
                <h1 className="text-xl font-semibold text-gray-900 text-center tracking-tight">
                  Edit Menu Promo
                </h1>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Nama Promo:
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama promo"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  onBlur={() => {
                    if (data.name && data.name !== promo.name) {
                      setNameTouched(true);
                    }
                  }}
                  className={`w-full bg-white border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Kategori:
                </label>
                <select
                  value={data.category_id}
                  onChange={(e) => setData('category_id', e.target.value)}
                  className={`w-full bg-white border ${
                    errors.category_id ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="text-xs text-red-500">{errors.category_id}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Harga Promo:
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Masukkan harga promo"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  className={`w-full bg-white border ${
                    errors.price ? 'border-red-500' : 'border-gray-300'
                  } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Status:
                </label>
                <select
                  value={data.is_available}
                  onChange={(e) =>
                    setData('is_available', Number(e.target.value))
                  }
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0"
                >
                  <option value={1}>Tersedia</option>
                  <option value={0}>Habis</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Jenis Promo:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPackageMode(false)}
                    className={`flex-1 border rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-center gap-2 ${
                      !isPackageMode
                        ? 'border-[#EF5350] bg-red-50 text-[#EF5350]'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>Promo 1 Menu</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPackageMode(true)}
                    className={`flex-1 border rounded-xl px-3.5 py-2.5 text-sm flex items-center justify-center gap-2 ${
                      isPackageMode
                        ? 'border-[#EF5350] bg-red-50 text-[#EF5350]'
                        : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>Paket (Beberapa Menu)</span>
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Pilih &quot;Promo 1 Menu&quot; kalau diskon satu menu saja, atau &quot;Paket&quot; kalau menggabungkan beberapa menu.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  Periode Promo:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500">
                      Tanggal Mulai:
                    </span>
                    <input
                      type="date"
                      value={data.promo_start_date}
                      onChange={(e) =>
                        setData('promo_start_date', e.target.value)
                      }
                      className={`w-full bg-white border ${
                        errors.promo_start_date
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                    />
                    {errors.promo_start_date && (
                      <p className="text-xs text-red-500">
                        {errors.promo_start_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500">
                      Jam Mulai:
                    </span>
                    <input
                      type="time"
                      value={data.promo_start_time}
                      onChange={(e) =>
                        setData('promo_start_time', e.target.value)
                      }
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      className={`w-full bg-white border ${
                        errors.promo_start_time
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                    />
                    {errors.promo_start_time && (
                      <p className="text-xs text-red-500">
                        {errors.promo_start_time}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500">
                      Tanggal Berakhir:
                    </span>
                    <input
                      type="date"
                      value={data.promo_end_date}
                      onChange={(e) =>
                        setData('promo_end_date', e.target.value)
                      }
                      className={`w-full bg-white border ${
                        errors.promo_end_date
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                    />
                    {errors.promo_end_date && (
                      <p className="text-xs text-red-500">
                        {errors.promo_end_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-gray-500">
                      Jam Berakhir:
                    </span>
                    <input
                      type="time"
                      value={data.promo_end_time}
                      onChange={(e) =>
                        setData('promo_end_time', e.target.value)
                      }
                      onFocus={(e) =>
                        e.target.showPicker && e.target.showPicker()
                      }
                      className={`w-full bg-white border ${
                        errors.promo_end_time
                          ? 'border-red-500'
                          : 'border-gray-300'
                      } rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-gray-700 focus:ring-0`}
                    />
                    {errors.promo_end_time && (
                      <p className="text-xs text-red-500">
                        {errors.promo_end_time}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  Boleh dikosongkan kalau promo tidak dibatasi tanggal dan jam.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
                  {isPackageMode ? 'Pilih Menu Dalam Paket' : 'Pilih Menu Promo'}
                </label>

                <div className="border border-gray-200 rounded-2xl max-h-60 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                  {allMenus.length === 0 && (
                    <p className="text-xs text-gray-500 px-3 py-3">
                      Belum ada menu yang bisa dipilih.
                    </p>
                  )}

                  {allMenus.map((menu) => {
                    const checked = data.package_items.includes(menu.id);

                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => {
                          if (isPackageMode) {
                            togglePackageItem(menu.id);
                          } else {
                            setData('package_items', [menu.id]);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm border-b last:border-b-0 transition-colors ${
                          checked
                            ? 'bg-red-50 border-red-100'
                            : 'bg-transparent border-transparent hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 flex items-center justify-center">
                            {checked ? (
                              <CheckSquare className="w-4 h-4 text-[#EF5350]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] text-gray-900">
                              {menu.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              Rp {Number(menu.price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {errors.package_items && (
                  <p className="text-xs text-red-500">{errors.package_items}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-900">
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
                  <p className="text-xs text-red-500">{errors.image}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-[#EF5350] text-white py-3.5 rounded-xl text-sm hover:bg-[#e53935] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {processing ? 'Menyimpan...' : 'Perbarui Menu Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
