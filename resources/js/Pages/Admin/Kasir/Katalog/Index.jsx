import { useState, useMemo } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Plus, Minus, Trash2, X, Star, ShoppingCart } from 'lucide-react'

export default function CatalogIndex({ menus, categories }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [cart, setCart] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const categoryFilters = [
    { value: 'all', label: 'Semua Menu' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ]

  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' || menu.category_id === Number(selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [menus, searchTerm, selectedCategory])

  // Harga efektif: kalau promo dan ada promo_price, pakai promo_price
  const getEffectivePrice = menu => {
    if (menu.is_promo && menu.promo_price) {
      return menu.promo_price
    }
    return menu.price
  }

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
      // simpan harga yang sudah fix (normal/promo)
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

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const tax = subtotal * 0.1
  const discount = cart.length > 0 ? 5000 : 0
  const total = Math.max(0, subtotal + tax - discount)

  const handleCheckout = method => {
    setPaymentMethod(method)
    setShowPaymentModal(true)
  }

  const processPayment = () => {
    const payload = {
      cart: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      tax,
      discount,
      total,
    }

    if (paymentMethod === 'cash') {
      const cash = parseFloat(cashAmount)
      if (!cash || cash < total) {
        alert('Uang tidak cukup!')
        return
      }
      payload.cash_amount = cash
    }

    setIsProcessing(true)

    const endpoint =
      paymentMethod === 'cash'
        ? 'admin.transactions.store.cash'
        : 'admin.transactions.store.qris'

    router.post(route(endpoint), payload, {
      onSuccess: () => {
        setCart([])
        setShowPaymentModal(false)
        setCashAmount('')
        setIsProcessing(false)
      },
      onError: () => setIsProcessing(false),
    })
  }

  const changeAmount = cashAmount ? parseFloat(cashAmount) - total : 0

  return (
    <AdminLayout>
      <Head title="Katalog Menu" />

      <div className="relative font-sfPro bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-gray-800">Katalog Menu</h1>
              <p className="text-xs text-gray-500">
                Pilih menu dan proses pesanan langsung dari katalog.
              </p>
            </div>

            <div className="flex gap-4">
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

              <div className="relative w-56">
                <button
                  onClick={() =>
                    setShowCategoryDropdown(!showCategoryDropdown)
                  }
                  className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500 focus:outline-none outline-none transition-none"
                >
                  <span className="truncate">
                    {
                      categoryFilters.find(
                        f => f.value === selectedCategory
                      )?.label
                    }
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute left-0 mt-2 w-full bg-white border border-gray-50 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                    {categoryFilters.map(filter => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setSelectedCategory(filter.value)
                          setShowCategoryDropdown(false)
                        }}
                        className={`w-full text-left px-4 py-3 text-sm outline-none transition-none ${
                          selectedCategory === filter.value
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
          </div>

          {filteredMenus.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 bg-white/50 rounded-3xl border border-dashed border-gray-200">
              <h3 className="text-xl text-gray-600 mb-2">Belum Ada Menu di Katalog</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
              {filteredMenus.map(menu => {
                const price = getEffectivePrice(menu)

                return (
                  <div
                    key={menu.id}
                    className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden border border-gray-50 transition-none"
                  >
                    <div className="aspect-square bg-gray-50 relative">
                      {/* kalau dua-duanya true, dua label tampil */}
                      {menu.is_promo && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-3 py-1 rounded-full text-[10px] font-medium tracking-[0.12em] bg-red-500 text-white">
                            PROMO
                          </span>
                        </div>
                      )}

                      {menu.is_best_seller && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 border border-yellow-100">
                            <Star
                              size={10}
                              className="fill-[#f59e0b] text-[#f59e0b]"
                            />
                            <span className="text-[10px] font-sfPro uppercase tracking-[0.18em] text-[#b45309]">
                              Best
                            </span>
                          </div>
                        </div>
                      )}

                      <img
                        src={menu.image || '/placeholder-food.png'}
                        alt={menu.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-gray-800 truncate text-base leading-tight mb-1">
                        {menu.name}
                      </h3>

                      {menu.category && (
                        <p className="text-[11px] text-gray-500 mb-1">
                          {menu.category}
                        </p>
                      )}

                      <p className="text-sm text-gray-900 mb-4">
                        Rp{' '}
                        <span className="font-semibold">
                          {Number(price).toLocaleString('id-ID')}
                        </span>
                      </p>

                      <button
                        onClick={() => addToCart(menu)}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-2xl flex items-center justify-center"
                        aria-label="Tambah ke keranjang"
                      >
                        <ShoppingCart size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-80 bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col"
            >
              <div className="p-7 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Pesanan</h2>
                <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
                  {cart.length} Item
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                      <img
                        src={item.image || '/placeholder-food.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 truncate mb-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-medium mb-3">
                        Rp {Number(item.price).toLocaleString('id-ID')}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm hover:text-red-500 transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white shadow-sm hover:text-red-500 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-7 bg-gray-50/50 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      Rp {subtotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Pajak (10%)</span>
                    <span className="font-semibold text-gray-800">
                      Rp {tax.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Diskon Promo</span>
                    <span className="font-semibold">
                      - Rp {discount.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-end mb-6">
                    <span className="text-sm font-medium text-gray-500">
                      Total Tagihan
                    </span>
                    <span className="text-2xl font-black text-gray-900 leading-none">
                      Rp {total.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleCheckout('cash')}
                      className="bg-white border-2 border-gray-900 text-gray-900 py-3.5 rounded-2xl hover:bg-gray-900 hover:text-white transition-all font-bold text-xs tracking-widest"
                    >
                      CASH
                    </button>
                    <button
                      onClick={() => handleCheckout('qris')}
                      className="bg-red-500 text-white py-3.5 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-100 transition-all font-bold text-xs tracking-widest"
                    >
                      QRIS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPaymentModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[2.5rem] shadow-2xl z-[70] w-full max-w-md p-10"
              >
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {paymentMethod === 'cash' ? 'Bayar Tunai' : 'Scan QRIS'}
                  </h3>
                  <button
                    onClick={() => !isProcessing && setShowPaymentModal(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="bg-gray-50 rounded-3xl p-6 text-center">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Total yang harus dibayar
                    </p>
                    <p className="text-3xl font-black text-gray-900">
                      Rp {total.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {paymentMethod === 'cash' ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 ml-1">
                          Uang yang Diterima
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-gray-400">
                            Rp
                          </span>
                          <input
                            type="number"
                            value={cashAmount}
                            onChange={e => setCashAmount(e.target.value)}
                            autoFocus
                            placeholder="0"
                            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-red-500 focus:ring-0 text-xl font-bold transition-all"
                            disabled={isProcessing}
                          />
                        </div>
                      </div>

                      {cashAmount && (
                        <div className="flex justify-between items-center px-2">
                          <span className="text-sm font-medium text-gray-500">
                            Kembalian
                          </span>
                          <span
                            className={`text-xl font-black ${
                              changeAmount >= 0
                                ? 'text-green-600'
                                : 'text-red-500'
                            }`}
                          >
                            Rp {changeAmount.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-6 rounded-[2rem] shadow-inner border border-gray-100 mb-4">
                        <div className="w-48 h-48 flex items-center justify-center bg-gray-50 rounded-xl">
                          <span className="text-6xl animate-pulse">📱</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">
                        Silakan scan kode QR pada layar EDC
                      </p>
                    </div>
                  )}

                  <button
                    onClick={processPayment}
                    disabled={
                      isProcessing ||
                      (paymentMethod === 'cash' &&
                        (!cashAmount || changeAmount < 0))
                    }
                    className="w-full bg-gray-900 text-white py-4 rounded-2xl hover:bg-red-500 disabled:bg-gray-200 disabled:text-gray-400 transition-all font-bold text-lg shadow-xl shadow-gray-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      'Selesaikan Transaksi'
                    )}
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
