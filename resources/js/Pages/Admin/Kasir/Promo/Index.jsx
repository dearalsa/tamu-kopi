import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Search, ChevronDown, Pencil, Trash2, ToggleLeft } from 'lucide-react';

export default function Index({ menus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const dynamicCategoryFilters = useMemo(() => {
    const map = new Map();
    menus.forEach((menu) => {
      if (menu.category) {
        if (!map.has(menu.category.slug)) {
          map.set(menu.category.slug, menu.category.name);
        }
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({
      value: slug,
      label: name,
    }));
  }, [menus]);

  const filters = [
    { value: 'all', label: 'Semua Paket' },
    ...dynamicCategoryFilters,
  ];

  const filteredMenus = menus.filter((menu) => {
    const matchSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (selectedFilter === 'all') return true;
    return menu.category && menu.category.slug === selectedFilter;
  });

  const toggleAvailability = (menu) => {
    router.patch(
      route('admin.kasir.promo.toggle', menu.id),
      {},
      { preserveScroll: true }
    );
  };

  const handleDelete = (menu) => {
    const msg = menu.is_package 
        ? `Yakin ingin menghapus paket "${menu.name}"?`
        : `Yakin ingin menonaktifkan promo untuk "${menu.name}"?`;
        
    if (confirm(msg)) {
      router.delete(route('admin.kasir.promo.destroy', menu.id), { preserveScroll: true });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro select-none">
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-4">
            <div className="relative w-56">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
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

              {/* menu dropdown filter */}
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
                        selectedFilter === filter.value
                          ? 'bg-red-50 text-[#ef5350]'
                          : 'text-gray-600'
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
            className="flex items-center gap-2 bg-[#ef5350] text-white px-6 py-2.5 rounded-2xl shadow-sm text-sm hover:bg-[#e53935] outline-none transition-none"
          >
            <Plus size={18} />
            Tambah Diskon
          </Link>
        </div>

        {filteredMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-xl text-gray-600 mb-2">Belum Ada Paket Promo</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenus.map((menu) => {
                // LOGIKA HARGA: Jika promo_price ada, pakai itu. Jika tidak, pakai price (untuk paket).
                const displayPrice = menu.promo_price ? menu.promo_price : menu.price;
                
                return (
                <motion.div
                key={menu.id}
                whileHover={{ scale: 1.03 }}      // efek saat hover
                whileTap={{ scale: 0.97 }}        // efek saat klik
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden border border-gray-50 cursor-pointer"
              >
                <div className="aspect-square bg-gray-50 relative">
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-[0.12em] ${
                            menu.is_available
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {menu.is_available ? 'Tersedia' : 'Habis'}
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleAvailability(menu)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-gray-500 hover:text-red-500 hover:bg-white shadow-sm transition-colors"
                        >
                          <ToggleLeft size={13} />
                        </button>
                        
                      </div>
                      
                      

                      {menu.image ? (
                        <img
                          src={`/storage/${menu.image}`}
                          alt={menu.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-4xl opacity-30">🍽️</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-gray-800 truncate text-base leading-tight mb-1">
                        {menu.name}
                      </h3>

                      {menu.category && (
                        <p className="text-[11px] text-gray-500 mb-2">
                          {menu.category.name}
                        </p>
                      )}

                      <p className="text-sm text-gray-900 mb-4">
                        Rp{' '}
                        <span className="font-semibold text-red-500">
                          {Number(displayPrice).toLocaleString('id-ID')}
                        </span>
                      </p>

                      <div className="flex gap-2">
                        <Link
                          href={route('admin.kasir.promo.edit', menu.id)}
                          className="flex-1 flex items-center justify-center bg-[#f26c66] text-white py-2 rounded-xl outline-none transition-none hover:bg-[#e53935]"
                        >
                          <Pencil size={13} />
                        </Link>
                        <button
                          onClick={() => handleDelete(menu)}
                          className="flex-1 flex items-center justify-center bg-[#ef5350] text-white py-2 rounded-xl outline-none transition-none hover:bg-[#d32f2f]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    </motion.div>
                );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}