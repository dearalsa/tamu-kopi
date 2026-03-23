import { useState, useMemo, useEffect } from 'react'
import { Head, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  Star,
  ShoppingCart,
  Tag,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import dayjs from 'dayjs'

export default function CatalogIndex({ menus = [], categories = [], auth }) {
  const { flash } = usePage().props

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showClearCartModal, setShowClearCartModal] = useState(false)
  const [orderType, setOrderType] = useState('dine-in')

  const categoryFilters = [
    { value: 'all', label: 'Semua Menu' },
    ...categories.map(cat => ({ value: String(cat.id), label: cat.name })),
  ]

  const formatRupiah = value => {
    if (!value) return ''
    const stringValue = value.toString().replace(/\D/g, '')
    return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const cleanNumber = value => value.toString().replace(/\D/g, '')

  const resetState = () => {
    setCart([])
    setPaymentMethod(null)
    setCashAmount('')
    setOrderType('dine-in')
    setIsProcessing(false)
    setShowClearCartModal(false)
  }

  useEffect(() => {
    if (flash?.success_transaction) {
      const data = flash.success_transaction
      handleSilentPrint(data)
      setShowSuccessPopup(true)
      resetState()
      const timer = setTimeout(() => setShowSuccessPopup(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [flash])

  const handleSilentPrint = (data) => {
    const windowPrint = window.open('', '', 'width=450,height=600')

    const itemsHtml = data.items.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${item.menu_name} x${item.quantity}</span>
        <span>${Number(item.price * item.quantity).toLocaleString('id-ID')}</span>
      </div>
      ${item.description ? `<div style="font-size: 9px; font-style: italic; margin-bottom: 4px; padding-left: 5px;">Catatan: ${item.description}</div>` : ''}
    `).join('')

    windowPrint.document.write(`
      <html>
        <head>
          <title>Print Struk</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; width: 58mm; padding: 2mm; font-size: 11px; line-height: 1.3; color: #000; margin: 0; }
            .text-center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 4px 0; width: 100%; }
            .total { font-weight: bold; margin-top: 5px; font-size: 12px; }
            img { max-width: 35mm; height: auto; filter: grayscale(100%); margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <img src="/asset/Tamu.svg" />
            <p style="font-size: 9px; margin: 0;">Jl. Dadali No.7, Bogor<br>081218420963</p>
          </div>
          <div class="line"></div>
          <div style="display: flex; justify-content: space-between;">
            <span>${dayjs(data.created_at).format('DD MMM YYYY')}</span>
            <span>${dayjs(data.created_at).format('HH:mm')}</span>
          </div>
          <div style="display: flex; justify-content: space-between;"><b>No. Inv</b><span>${data.invoice_number}</span></div>
          <div style="display: flex; justify-content: space-between;"><b>Kasir</b><span>${data.cashier_name || auth?.user?.name}</span></div>
          <div class="line"></div>
          <div class="text-center" style="font-weight: bold; margin: 5px 0;">${data.order_type === 'dine-in' ? 'MAKAN DITEMPAT' : 'TAKE AWAY'}</div>
          <div class="line"></div>
          ${itemsHtml}
          <div class="line"></div>
          <div style="display: flex; justify-content: space-between;"><span>Subtotal</span><span>${Number(data.subtotal).toLocaleString('id-ID')}</span></div>
          ${data.discount > 0 ? `<div style="display: flex; justify-content: space-between;"><span>Diskon</span><span>-${Number(data.discount).toLocaleString('id-ID')}</span></div>` : ''}
          <div style="display: flex; justify-content: space-between;" class="total"><span>TOTAL</span><span>${Number(data.total).toLocaleString('id-ID')}</span></div>
          <div style="display: flex; justify-content: space-between;"><span>Bayar</span><span>${Number(data.cash_amount || data.total).toLocaleString('id-ID')}</span></div>
          ${data.payment_method === 'cash' ? `<div style="display: flex; justify-content: space-between;"><span>Kembali</span><span>${Number(data.change).toLocaleString('id-ID')}</span></div>` : ''}
          <div class="line"></div>
          <div class="text-center" style="margin-top: 10px; font-size: 9px;">Terima Kasih!</div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
  }

  const filteredAndSortedMenus = useMemo(() => {
    const menuData = Array.isArray(menus) ? menus : (menus?.data || [])
    let result = menuData.filter(menu => {
      const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryId = menu.category?.id || menu.category_id
      const matchesCategory = selectedCategory === 'all' || String(categoryId) === String(selectedCategory)
      return matchesSearch && matchesCategory
    })

    result.sort((a, b) => {
      const aIsPackage = a.is_package
      const bIsPackage = b.is_package
      if (aIsPackage !== bIsPackage) return aIsPackage ? 1 : -1
      const scoreA = (!aIsPackage && a.promo_price && a.is_best_seller ? 3 : 0) + (!aIsPackage && a.is_best_seller ? 2 : 0) + (!aIsPackage && a.promo_price ? 1 : 0)
      const scoreB = (!bIsPackage && b.promo_price && b.is_best_seller ? 3 : 0) + (!bIsPackage && b.is_best_seller ? 2 : 0) + (!bIsPackage && b.promo_price ? 1 : 0)
      if (scoreB !== scoreA) return scoreB - scoreA
      return a.name.localeCompare(b.name)
    })
    return result
  }, [menus, searchTerm, selectedCategory])

  const getEffectivePrice = menu => (menu.promo_price ? menu.promo_price : menu.price)

  const addToCart = menu => {
    const price = getEffectivePrice(menu)
    setCart(prev => {
      const existing = prev.find(item => item.id === menu.id)
      if (existing) {
        return prev.map(item => item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...menu, price, original_price: menu.price, quantity: 1, note: '' }]
    })
  }

  const updateQuantity = (id, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + change
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const updateNote = (id, newNote) => {
    setCart(prev => prev.map(item => item.id === id ? { ...item, note: newNote } : item))
  }

  const removeFromCart = id => setCart(prev => prev.filter(item => item.id !== id))

  const subtotalNormal = cart.reduce((sum, item) => sum + item.original_price * item.quantity, 0)
  const totalDiscount = cart.reduce((sum, item) => sum + (item.original_price - item.price) * item.quantity, 0)
  const total = Math.max(0, subtotalNormal - totalDiscount)
  
  // Real-time calculation
  const cashValue = parseInt(cashAmount || 0)
  const changeAmount = cashValue - total

  const processPayment = () => {
    if (!paymentMethod) return
    if (paymentMethod === 'cash') {
      if (!cashAmount || isNaN(cashValue)) {
        alert('Masukkan nominal uang terlebih dahulu.')
        return
      }
      if (cashValue < total) {
        alert('Uang yang diterima kurang dari total pembayaran.')
        return
      }
    }

    if (cart.length === 0) {
      alert('Keranjang masih kosong.')
      return
    }

    setIsProcessing(true)

    const transactionData = {
      subtotal: subtotalNormal,
      discount: totalDiscount,
      total: total,
      payment_method: paymentMethod,
      cash_amount: paymentMethod === 'cash' ? cashValue : 0,
      change: paymentMethod === 'cash' ? Math.max(0, changeAmount) : 0,
      order_type: orderType,
      cart: cart.map(item => ({
        menu_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        note: item.note,
      })),
    }

    router.post(route('admin.kasir.transactions.store'), transactionData, {
      preserveScroll: false,
      preserveState: false,
      onFinish: () => setIsProcessing(false),
      onError: errors => alert(`Transaksi gagal! ${errors.error || ''}`),
    })
  }

  return (
    <AdminLayout>
      <Head title="Katalog Menu" />

      <div className="relative font-sfPro bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          <div className="flex justify-start items-center mb-8 gap-4">
            <div className="relative w-56">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm"
              />
            </div>
            <div className="relative w-56">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500"
              >
                <span className="truncate">{categoryFilters.find(f => f.value === String(selectedCategory))?.label}</span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute left-0 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden outline-none">
                  {categoryFilters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => { setSelectedCategory(filter.value); setShowCategoryDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-sm font-normal ${String(selectedCategory) === String(filter.value) ? 'bg-red-50 text-[#ef5350]' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
            {filteredAndSortedMenus.length > 0 ? (
              filteredAndSortedMenus.map(menu => (
                <motion.div
                  key={menu.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col h-full cursor-pointer"
                >
                  <div className="aspect-square bg-gray-50 relative">
                    <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
                      {menu.is_best_seller && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-1 border border-yellow-100">
                          <Star size={10} className="fill-[#f59e0b] text-[#f59e0b]" />
                          <span className="text-[10px] uppercase tracking-wider text-[#b45309]">BEST SELLER</span>
                        </div>
                      )}
                      {menu.promo_price && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 border border-red-100">
                          <Tag size={10} className="fill-red-500 text-red-500" />
                          <span className="text-[10px] uppercase tracking-wider text-red-500">PROMO</span>
                        </div>
                      )}
                    </div>
                    <img src={menu.image ? `/storage/${menu.image}` : '/asset/no-image.png'} alt={menu.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-gray-800 truncate text-base mb-1 font-normal">{menu.name}</h3>
                    <p className="text-xs text-gray-400 mb-2 font-sfPro">{typeof menu.category === 'object' ? menu.category?.name : menu.category}</p>
                    {menu.description && <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 leading-relaxed font-sfPro italic">{menu.description}</p>}
                    <div className="mt-auto mb-4">
                      {menu.promo_price ? (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-400 line-through font-sfPro">Rp {Number(menu.price).toLocaleString('id-ID')}</span>
                          <span className="text-lg text-[#ef5350] font-sfPro">Rp {Number(menu.promo_price).toLocaleString('id-ID')}</span>
                        </div>
                      ) : (
                        <p className="text-lg text-gray-900 font-normal">Rp {Number(menu.price).toLocaleString('id-ID')}</p>
                      )}
                    </div>
                    <button onClick={() => addToCart(menu)} className="w-full bg-gray-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                      <ShoppingCart size={16} />
                      <span className="text-sm font-sfPro">Tambah</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4"><Search size={40} className="text-gray-300" /></div>
                <h3 className="text-lg font-telegraf text-gray-700 mb-2">Belum ada menu</h3>
              </div>
            )}
          </div>
        </div>

        {/* Modals & Popups */}
        <AnimatePresence>
          {showClearCartModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6"><AlertCircle size={32} className="text-red-500" /></div>
                  <h3 className="text-xl font-telegraf text-gray-900 mb-2">Hapus Pesanan?</h3>
                  <div className="flex gap-3 w-full mt-6">
                    <button onClick={() => setShowClearCartModal(false)} className="flex-1 py-3.5 rounded-2xl bg-gray-100 text-gray-700 font-telegraf text-sm">Batal</button>
                    <button onClick={() => { resetState(); setShowClearCartModal(false); }} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-telegraf text-sm">Ya, Hapus</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessPopup && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
                <CheckCircle size={48} className="text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-telegraf text-gray-900 mb-2">Berhasil!</h3>
                <p className="text-gray-500">Pesanan telah diproses dan struk dicetak otomatis.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cart Sidebar */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-4 top-4 bottom-4 w-[340px] bg-white/80 backdrop-blur-xl border shadow-xl z-50 flex flex-col rounded-[2.5rem] overflow-hidden">
              <div className="p-7 pb-4 flex justify-between items-center">
                {paymentMethod ? (
                  <button onClick={() => {setPaymentMethod(null); setCashAmount('')}} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm">
                    <ArrowLeft size={18} /> Kembali
                  </button>
                ) : (
                  <div>
                    <h2 className="text-xl font-telegraf text-gray-800">Pesanan</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-telegraf">{cart.reduce((a, b) => a + b.quantity, 0)} Item Terpilih</p>
                  </div>
                )}
                {!paymentMethod && (
                  <button onClick={() => setShowClearCartModal(true)} className="p-2.5 rounded-2xl bg-red-50 text-red-500"><Trash2 size={18} /></button>
                )}
              </div>

              {!paymentMethod && (
                <div className="px-6 mb-4 flex gap-2">
                  <button onClick={() => setOrderType('dine-in')} className={`flex-1 py-2.5 rounded-xl text-xs font-telegraf ${orderType === 'dine-in' ? 'bg-black text-white' : 'bg-gray-100'}`}>Dine In</button>
                  <button onClick={() => setOrderType('takeaway')} className={`flex-1 py-2.5 rounded-xl text-xs font-telegraf ${orderType === 'takeaway' ? 'bg-black text-white' : 'bg-gray-100'}`}>Take Away</button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 space-y-4 py-2 no-scrollbar">
                {paymentMethod === null ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-3xl bg-white/50 border">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                          <img src={item.image ? `/storage/${item.image}` : '/asset/no-image.png'} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-red-500">Rp {item.price.toLocaleString()}</p>
                          <div className="flex justify-between mt-2">
                            <div className="flex gap-2 items-center bg-gray-100 rounded-lg px-2">
                              <button onClick={() => updateQuantity(item.id, -1)}><Minus size={12} /></button>
                              <span className="text-xs">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)}><Plus size={12} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                      <input type="text" placeholder="Tambah catatan..." value={item.note || ''} onChange={(e) => updateNote(item.id, e.target.value)} className="w-full px-3 py-1.5 text-[10px] bg-gray-50 border-none rounded-xl font-sfPro" />
                    </div>
                  ))
                ) : (
                  <div className="pt-4 text-center">
                    <div className="bg-gray-50 p-6 rounded-[2rem] mb-6">
                      <p className="text-[12px] text-gray-600 uppercase font-telegraf">Total Pembayaran</p>
                      <p className="text-[23px] font-sfPro">Rp {total.toLocaleString('id-ID')}</p>
                    </div>

                    {paymentMethod === 'cash' && (
                      <div className="text-left space-y-4">
                        <div>
                          <label className="text-xs font-sfPro px-2 text-gray-500 uppercase">Uang Diterima</label>
                          <input
                            type="text"
                            value={formatRupiah(cashAmount)}
                            onChange={e => setCashAmount(cleanNumber(e.target.value))}
                            className="w-full mt-1.5 p-4 border-2 border-gray-100 rounded-2xl text-xl text-center outline-none focus:outline-none focus:ring-0 focus:border-gray-100 font-sfPro transition-none"
                            placeholder="0"
                            autoFocus
                          />
                        </div>

                        {/* Tampilan Kembalian Otomatis */}
                        <AnimatePresence>
                          {cashValue >= total && (
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }} 
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center"
                            >
                              <p className="text-[10px] text-green-600 uppercase font-sfPro mb-1">Uang Kembalian</p>
                              <p className="text-lg font-sfPro text-green-700">
                                Rp {changeAmount.toLocaleString('id-ID')}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                    
                    {paymentMethod === 'qris' && (
                      <div className="flex flex-col items-center">
                        <img src="/asset/qris.jpeg" className="w-48 rounded-2xl border mb-4" />
                        <p className="text-[11px] text-gray-500">Scan QRIS untuk pembayaran otomatis</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/40 border-t">
                {!paymentMethod ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPaymentMethod('cash')} className="bg-gray-200 py-3 rounded-2xl text-[12px] font-telegraf hover:bg-gray-300 transition-colors">CASH</button>
                    <button onClick={() => setPaymentMethod('qris')} className="bg-black text-white py-3 rounded-2xl text-[12px] font-telegraf hover:bg-gray-800 transition-colors">QRIS</button>
                  </div>
                ) : (
                  <button
                    onClick={processPayment}
                    disabled={isProcessing || (paymentMethod === 'cash' && (cashValue < total))}
                    className="text-[14px] w-full bg-black text-white py-4 rounded-2xl disabled:bg-gray-300 hover:bg-gray-800 transition-colors font-telegraf"
                  >
                    {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}