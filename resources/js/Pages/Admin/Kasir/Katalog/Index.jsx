import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  X,
  Star,
  ShoppingCart,
  Tag,
} from 'lucide-react'

export default function CatalogIndex({ menus, categories }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  // State Keranjang & Pembayaran
  const [cart, setCart] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const categoryFilters = [
    { value: 'all', label: 'Semua Menu' },
    ...categories.map(cat => ({ value: String(cat.id), label: cat.name })),
  ]

  // Filter & Sorting Menu
  const filteredAndSortedMenus = useMemo(() => {
    // Filter dulu berdasarkan search & kategori
    let result = menus.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || String(menu.category_id) === String(selectedCategory)
      return matchesSearch && matchesCategory
    })

    // Sorting berdasarkan Prioritas
    // Urutan: Promo+BestSeller, BestSeller, Promo, Biasa
    result.sort((a, b) => {
        const scoreA = (a.is_promo && a.is_best_seller ? 3 : 0) + (a.is_best_seller ? 2 : 0) + (a.is_promo ? 1 : 0);
        const scoreB = (b.is_promo && b.is_best_seller ? 3 : 0) + (b.is_best_seller ? 2 : 0) + (b.is_promo ? 1 : 0);
        
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.name.localeCompare(b.name);
    });

    return result;
  }, [menus, searchTerm, selectedCategory])

  // logika harga efektif (promo atau reguler)
  const getEffectivePrice = menu =>
    menu.promo_price ? menu.promo_price : menu.price

  // logika keranjang
  const addToCart = menu => {
    const price = getEffectivePrice(menu)

    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id)
      if (existing) {
        return prev.map(item =>
          item.id === menu.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...menu, price, quantity: 1 }]
    })
  }

  const updateQuantity = (id, change) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.quantity + change
            return newQty > 0 ? { ...item, quantity: newQty } : item
          }
          return item
        })
        .filter(item => item.quantity > 0)
    )
  }

  const removeFromCart = id => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  // perhitungan total
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const tax = subtotal * 0.1
  const discount = 0 
  const total = Math.max(0, subtotal + tax - discount)
  const changeAmount = cashAmount ? parseFloat(cashAmount) - total : 0

  const handleCheckout = method => {
    setPaymentMethod(method)
    setShowPaymentModal(true)
  }

  const processPayment = () => {
    setIsProcessing(true)
    setTimeout(() => {
        setCart([])
        setShowPaymentModal(false)
        setCashAmount('')
        setIsProcessing(false)
    }, 1000)
  }

  return (
    <AdminLayout>
      <Head title="Katalog Menu" />

      <div className="relative font-sfPro bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          
          {/* header dan filters */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-telegraf text-gray-800">Katalog menu</h1>
              <p className="text-xs text-gray-500 font-telegraf">
                Pilih menu dan proses pesanan langsung dari sini!
              </p>
            </div>

            <div className="flex gap-4">
              {/* button search */}
              <div className="relative w-56">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl focus:outline-none focus:ring-0 focus:border-gray-50 text-sm text-gray-600 placeholder-gray-400 appearance-none transition-none"
                />
              </div>

              {/* kategori filter */}
              <div className="relative w-56">
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500 focus:outline-none outline-none transition-none"
                >
                  <span className="truncate">
                    {categoryFilters.find(f => f.value === String(selectedCategory))?.label}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                    {categoryFilters.map(filter => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setSelectedCategory(filter.value)
                          setShowCategoryDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm outline-none transition-colors ${
                          String(selectedCategory) === String(filter.value)
                            ? 'bg-red-50 text-[#ef5350]'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* grid menu */}
          {filteredAndSortedMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <h3 className="text-xl text-gray-600 mb-2 font-telegraf">Belum ada menu</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
              {filteredAndSortedMenus.map(menu => {
                const currentPrice = getEffectivePrice(menu)

                return (
                  <div
                    key={menu.id}
                    className="bg-white rounded-[1.5rem] border border-gray-200 overflow-hidden flex flex-col h-full hover:border-gray-300 transition-colors duration-200"
                  >
                    <div className="aspect-square bg-gray-50 relative">
                      {/* badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                        {menu.is_best_seller && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 border border-yellow-100">
                            <Star size={10} className="fill-[#f59e0b] text-[#f59e0b]" />
                            <span className="text-[10px] font-poppins uppercase tracking-wider text-[#b45309]">
                              BEST SELLER
                            </span>
                          </div>
                        )}
                        {menu.is_promo && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 border border-red-100">
                            <Tag size={10} className="fill-red-500 text-red-500" />
                            <span className="text-[10px] font-poppins uppercase tracking-wider text-red-500">
                              PROMO
                            </span>
                          </div>
                        )}
                      </div>

                      <img
                        src={menu.image || '/placeholder-food.png'}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-gray-800 font-sfPro truncate text-base mb-1">
                        {menu.name}
                      </h3>

                      {menu.category && (
                        <p className="text-xs text-gray-400 mb-3 font-sfPro">
                          {menu.category}
                        </p>
                      )}

                      <div className="mt-auto mb-4">
                        {menu.is_promo && menu.promo_price ? (
                          <div className="flex flex-col items-start">
                            <span className="text-xs text-gray-400 line-through decoration-gray-400 mb-0.5">
                              Rp {Number(menu.price).toLocaleString('id-ID')}
                            </span>
                            <span className="text-lg text-red-500 font-sfPro">
                              Rp {Number(menu.promo_price).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          <p className="text-lg font-sfPro text-gray-900">
                            Rp {Number(menu.price).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(menu)}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black active:scale-[0.98] transition-all"
                        aria-label="Tambah ke keranjang"
                      >
                        <ShoppingCart size={16} className="text-white" />
                        <span className="text-sm font-telegraf">Tambah</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* cart sidebar */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-gray-800">Pesanan</h2>
                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-bold border border-gray-200">
                  {cart.reduce((a, b) => a + b.quantity, 0)} Item
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-200">
                      <img
                        src={item.image || '/placeholder-food.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate mb-0.5">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mb-2">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm hover:text-red-500 transition-all border border-gray-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md bg-white shadow-sm hover:text-red-500 transition-all border border-gray-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Pajak (10%)</span>
                    <span className="font-semibold text-gray-800">
                      Rp {tax.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 mb-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-gray-500">
                      Total
                    </span>
                    <span className="text-xl font-black text-gray-900 leading-none">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCheckout('cash')}
                      className="bg-white border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-bold text-xs tracking-wider uppercase"
                    >
                      Cash
                    </button>
                    <button
                      onClick={() => handleCheckout('qris')}
                      className="bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-bold text-xs tracking-wider uppercase"
                    >
                      QRIS
                    </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* payment */}
        <AnimatePresence>
          {showPaymentModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-[70] w-full max-w-sm p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-800">
                    {paymentMethod === 'cash' ? 'Bayar Tunai' : 'Scan QRIS'}
                  </h3>
                  <button
                    onClick={() => !isProcessing && setShowPaymentModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                      Total Tagihan
                    </p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">
                      Rp {total.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {paymentMethod === 'cash' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                          Uang Diterima
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                            Rp
                          </span>
                          <input
                            type="number"
                            value={cashAmount}
                            onChange={e => setCashAmount(e.target.value)}
                            autoFocus
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-black focus:ring-0 text-lg font-bold transition-all outline-none"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>

                      {cashAmount && (
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                          <span className="text-sm font-medium text-gray-500">
                            Kembalian
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              changeAmount >= 0 ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            Rp {changeAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-4">
                      <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-300 mb-3">
                         <span className="text-4xl">📱</span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        Menunggu pembayaran via EDC...
                      </p>
                    </div>
                  )}

                  <button
                    onClick={processPayment}
                    disabled={
                      isProcessing ||
                      (paymentMethod === 'cash' && (!cashAmount || changeAmount < 0))
                    }
                    className="w-full bg-black text-white py-3.5 rounded-xl hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all font-bold text-sm shadow-lg shadow-gray-200"
                  >
                    {isProcessing ? 'Memproses...' : 'Selesaikan Pembayaran'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}