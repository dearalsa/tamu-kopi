import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Search, ChevronDown, Pencil, Trash2, Star, ToggleLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index({ menus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // ambil data array dari object pagination
  const menuData = menus.data;

  const dynamicCategoryFilters = useMemo(() => {
    const map = new Map();
    menuData.forEach((menu) => {
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
  }, [menuData]);

  const filters = [
    { value: 'all', label: 'Semua Menu' },
    ...dynamicCategoryFilters,
    { value: 'best-seller', label: 'Best Seller' },
  ];

  const filteredMenus = menuData.filter((menu) => {
    const matchSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'best-seller') return menu.is_best_seller === true;
    return menu.category && menu.category.slug === selectedFilter;
  });

  const toggleAvailability = (menu) => {
    router.post(
      route('admin.kasir.menus.update', menu.id),
      {
        _method: 'PUT',
        name: menu.name,
        category_id: menu.category_id,
        price: menu.price,
        is_available: menu.is_available ? 0 : 1,
        is_best_seller: menu.is_best_seller ? 1 : 0,
      },
      { preserveScroll: true }
    );
  };

  const handleDelete = (menu) => {
    if (confirm(`Yakin ingin menghapus menu "${menu.name}"?`)) {
      router.delete(route('admin.kasir.menus.destroy', menu.id), { preserveScroll: true });
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
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-600 placeholder-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-gray-50"
              />
            </div>

            <div className="relative w-56">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500 focus:outline-none"
              >
                <span className="truncate">
                  {filters.find((f) => f.value === selectedFilter)?.label || 'Filter Menu'}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showFilterDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-50 rounded-2xl shadow-xl z-50 overflow-hidden">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => {
                        setSelectedFilter(filter.value);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm ${
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
            href={route('admin.kasir.menus.create')}
            className="flex items-center gap-2 bg-[#ef5350] text-white px-6 py-2.5 rounded-2xl shadow-sm text-sm hover:bg-[#e53935]"
          >
            <Plus size={18} />
            Tambah Menu
          </Link>
        </div>

        {filteredMenus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-xl text-gray-600 mb-2">Belum Ada Menu</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredMenus.map((menu) => (
                <motion.div
                  key={menu.id}
                  whileHover={menu.is_available ? { scale: 1.02 } : {}}
                  whileTap={menu.is_available ? { scale: 0.98 } : {}}
                  className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden border border-gray-50 relative group ${
                    !menu.is_available ? 'opacity-90' : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-[0.12em] ${
                        menu.is_available ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {menu.is_available ? 'Tersedia' : 'Habis'}
                      </span>
                      <button
                        onClick={() => toggleAvailability(menu)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full shadow-sm transition-all ${
                          menu.is_available ? 'bg-white/90 text-gray-500 hover:text-red-500' : 'bg-gray-800 text-white'
                        }`}
                      >
                        <ToggleLeft size={13} />
                      </button>
                    </div>

                    {!menu.is_available && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/10 backdrop-blur-[2px]">
                        <div className="px-4 py-1.5 rounded-full border border-white/20 bg-black/20 backdrop-blur-md">
                          <span className="text-[10px] text-white/80 font-medium tracking-[0.2em] uppercase">Habis</span>
                        </div>
                      </div>
                    )}

                    {menu.image ? (
                      <img
                        src={`/storage/${menu.image}`}
                        alt={menu.name}
                        className={`w-full h-full object-cover transition-all duration-700 ${
                          !menu.is_available ? 'saturate-[0.2] brightness-90' : 'group-hover:scale-110'
                        }`}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50 text-3xl opacity-30">🍽️</div>
                    )}
                  </div>

                  <div className={`p-5 ${!menu.is_available ? 'bg-gray-50/50' : ''}`}>
                    <h3 className={`truncate text-base leading-tight mb-2 font-medium tracking-tight ${
                      !menu.is_available ? 'text-gray-400' : 'text-gray-800'
                    }`}>
                      {menu.name}
                    </h3>

                    <p className={`text-sm mb-2 ${!menu.is_available ? 'text-gray-400' : 'text-gray-900'}`}>
                      Rp <span className="font-semibold">{Number(menu.price).toLocaleString('id-ID')}</span>
                    </p>

                    <div className="mb-4 h-6 flex items-center">
                      {menu.is_best_seller && (
                        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${
                          !menu.is_available ? 'bg-gray-100/50 grayscale' : 'bg-yellow-50'
                        }`}>
                          <Star size={10} className={!menu.is_available ? 'fill-gray-300 text-gray-300' : 'fill-[#f59e0b] text-[#f59e0b]'} />
                          <span className={`text-[10px] font-sfPro uppercase tracking-[0.18em] ${
                            !menu.is_available ? 'text-gray-300' : 'text-[#b45309]'
                          }`}>Best Seller</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={route('admin.kasir.menus.edit', menu.id)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-xl border transition-all ${
                          !menu.is_available ? 'bg-white text-gray-400' : 'bg-[#f26c66] text-white hover:bg-[#e53935]'
                        }`}
                      >
                        <Pencil size={13} />
                      </Link>
                      <button
                        onClick={() => handleDelete(menu)}
                        className={`flex-1 flex items-center justify-center py-2 rounded-xl border transition-all ${
                          !menu.is_available ? 'bg-white text-gray-400' : 'bg-[#ef5350] text-white hover:bg-[#d32f2f]'
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* pagination */}
            <div className="mt-10 flex justify-end">
              <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-50">
                {menus.links.map((link, index) => {
                  const isPrev = link.label.includes('Previous');
                  const isNext = link.label.includes('Next');
                  return (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      as="button"
                      disabled={!link.url}
                      preserveScroll
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-sfPro transition-all ${
                        link.active ? 'bg-[#ef5350] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      } ${!link.url ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
                    >
                      {isPrev ? '<' : isNext ? '>' : link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}