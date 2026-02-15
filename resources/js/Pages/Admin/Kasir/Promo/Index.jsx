import React, { useState, useMemo, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Search, ChevronDown, Pencil, Trash2, ToggleLeft } from 'lucide-react';
import dayjs from 'dayjs';

export default function Index({ menus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // State untuk trigger re-render otomatis setiap detik
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Update waktu setiap detik agar status "Habis" berubah tepat waktu secara LIVE
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dynamicCategoryFilters = useMemo(() => {
    const map = new Map();
    menus.forEach((menu) => {
      if (menu.category && !map.has(menu.category.slug)) {
        map.set(menu.category.slug, menu.category.name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({
      value: slug,
      label: name,
    }));
  }, [menus]);

  const filters = [{ value: 'all', label: 'Semua Paket' }, ...dynamicCategoryFilters];

  const filteredMenus = menus.filter((menu) => {
    const matchSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedFilter === 'all' || (menu.category && menu.category.slug === selectedFilter);
    return matchSearch && matchCategory;
  });

  const toggleAvailability = (menu) => {
    router.patch(route('admin.kasir.promo.toggle', menu.id), {}, { preserveScroll: true });
  };

  const handleDelete = (menu) => {
    if (confirm("Yakin ingin menghapus menu promo ini?")) {
      router.delete(route('admin.kasir.promo.destroy', menu.id), { preserveScroll: true });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro select-none">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <div className="relative w-56">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari paket promo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl focus:outline-none focus:ring-0 focus:border-gray-50 text-sm text-gray-600 placeholder-gray-400 appearance-none transition-none"
              />
            </div>
            <div className="relative w-56">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500 focus:outline-none outline-none transition-none"
              >
                <span className="truncate">
                  {filters.find((f) => f.value === selectedFilter)?.label || 'Filter Paket'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showFilterDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-50 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedFilter(filter.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm outline-none transition-none ${
                        selectedFilter === filter.value ? 'bg-red-50 text-[#ef5350]' : 'text-gray-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Link
            href={route('admin.kasir.promo.create')}
            className="flex items-center gap-2 bg-[#ef5350] text-white px-6 py-2.5 rounded-2xl shadow-sm text-sm hover:bg-[#e53935] transition-none"
          >
            <Plus size={18} /> Tambah Diskon
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => {
            const displayPrice = menu.promo_price ? menu.promo_price : menu.price;
            const promoEnd = menu.promo_end_at ? dayjs(menu.promo_end_at) : null;
            const promoStart = menu.promo_start_at ? dayjs(menu.promo_start_at) : null;
            
            // cek status berdasarkan waktu sekarang
            const isExpired = promoEnd && currentTime.isAfter(promoEnd);
            const isNotStarted = promoStart && currentTime.isBefore(promoStart);
            const showAsHabis = isExpired || isNotStarted; 

            return (
              <motion.div
                key={menu.id}
                whileHover={!showAsHabis ? { scale: 1.02 } : {}}
                whileTap={!showAsHabis ? { scale: 0.98 } : {}}
                transition={{ duration: 0.15 }}
                className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden border border-gray-50 relative group transition-all duration-300 ${
                  showAsHabis ? 'opacity-90' : ''
                }`}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-[0.12em] shadow-sm transition-colors ${
                        !showAsHabis ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {!showAsHabis ? 'Tersedia' : 'Habis'}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAvailability(menu)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
                        !showAsHabis ? 'bg-white/90 text-gray-500 hover:text-red-500' : 'bg-gray-800 text-white'
                      }`}
                    >
                      <ToggleLeft size={13} className={showAsHabis ? 'opacity-50' : ''} />
                    </button>
                  </div>

                  {showAsHabis && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/10 backdrop-blur-[1.5px] transition-all">
                      <div className="px-5 py-2 rounded-full border border-white/20 bg-black/20 backdrop-blur-md">
                        <span className="text-[11px] text-white/90 font-sfPro tracking-[0.25em] uppercase">
                            {isExpired ? 'HABIS' : 'BELUM MULAI'}
                        </span>
                      </div>
                    </div>
                  )}

                  <img
                    src={menu.image ? `/storage/${menu.image}` : "/asset/no-image.png"}
                    className={`w-full h-full object-cover transition-all duration-300 ${
                        showAsHabis ? 'saturate-[0.1] brightness-90' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                <div className={`p-5 transition-all duration-500 ${showAsHabis ? 'bg-gray-50/50' : ''}`}>
                  <h3 className={`truncate text-base leading-tight mb-1 font-medium transition-colors ${
                    showAsHabis ? 'text-gray-400' : 'text-gray-800'
                  }`}>
                    {menu.name}
                  </h3>
                  <p className={`text-sm mb-4 transition-colors ${
                    showAsHabis ? 'text-gray-400' : 'text-red-500 font-semibold'
                  }`}>
                    Rp {Number(displayPrice).toLocaleString('id-ID')}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={route('admin.kasir.promo.edit', menu.id)}
                      className={`flex-1 flex items-center justify-center py-2 rounded-xl outline-none border transition-all ${
                        showAsHabis ? 'bg-white border-gray-200 text-gray-400' : 'bg-[#f26c66] border-transparent text-white hover:bg-[#e53935]'
                      }`}
                    >
                      <Pencil size={13} />
                    </Link>
                    <button
                      onClick={() => handleDelete(menu)}
                      className={`flex-1 flex items-center justify-center py-2 rounded-xl outline-none border transition-all ${
                        showAsHabis ? 'bg-white border-gray-200 text-gray-400' : 'bg-[#ef5350] border-transparent text-white hover:bg-[#d32f2f]'
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}