import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function Index({ menus, type, filters }) {
  const [searchTerm, setSearchTerm] = useState(filters?.search || '');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    router.get(
      route('admin.kasir.summary.index'), 
      { type, search: value },
      { 
        preserveState: true, 
        preserveScroll: true,
        only: ['menus', 'filters']
      }
    );
  };

  const handleTabChange = (newType) => {
    router.get(
      route('admin.kasir.summary.index', { type: newType }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['menus', 'type']
      }
    );
  };

  return (
    <AdminLayout>
      <Head title="Summary Menu" />
      
      <div className="relative font-sfPro bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          
          <div className="mb-8">
            <h1 className="text-2xl font-telegraf text-gray-800 mb-6">Summary Menu</h1>
            
            <div className="flex justify-between items-center gap-4 mb-6">
              {/* tabs */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleTabChange('top')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-telegraf transition-all ${
                    type === 'top'
                      ? 'bg-[#ef5350] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  Menu Terlaris
                </button>
                <button
                  onClick={() => handleTabChange('least')}
                  className={`px-6 py-2.5 rounded-xl text-sm font-telegraf transition-all ${
                    type === 'least'
                      ? 'bg-[#ef5350] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  Menu Kurang Diminati
                </button>
              </div>

              {/* search */}
              <div className="relative w-56">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-600 placeholder-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
            {menus.data && menus.data.length > 0 ? (
              menus.data.map((menu, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col h-full cursor-pointer"
                >
                  <div className="aspect-square bg-gray-50 relative">
                    {menu.image ? (
                      <img
                        src={`/storage/${menu.image}`}
                        alt={menu.menu_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100 text-5xl opacity-20">
                        🍽️
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-gray-800 truncate text-base mb-1 font-normal">
                      {menu.menu_name}
                    </h3>
                    {menu.price && (
                      <p className="text-xs text-gray-400 mb-3 font-sfPro">
                        Rp {Number(menu.price).toLocaleString('id-ID')}
                      </p>
                    )}
                    
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-telegraf">Total Terjual</span>
                        <span className="text-lg font-sfPro text-gray-900">{menu.total_sold}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-telegraf text-gray-700 mb-2">Belum ada data</h3>
                <p className="text-sm text-gray-400 font-sfPro text-center">
                  {searchTerm 
                    ? 'Tidak ada menu yang sesuai dengan pencarian Anda' 
                    : `Belum ada menu yang ${type === 'top' ? 'terjual' : 'masuk kategori kurang diminati'}`
                  }
                </p>
              </div>
            )}
          </div>

          {menus?.links && menus.data.length > 0 && (
            <div className="flex justify-start pb-6">
              <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-100">
                {menus.links.map((link, index) => {
                  const isPrev = link.label.includes('Previous');
                  const isNext = link.label.includes('Next');
                  const label = isPrev ? '<' : isNext ? '>' : link.label;

                  return (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      preserveScroll
                      className={`
                        w-8 h-8 flex items-center justify-center rounded-lg text-xs font-sfPro transition-all
                        ${link.active ? 'bg-[#ef5350] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-200'}
                        ${!link.url ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}
                      `}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </AdminLayout>
  );
}