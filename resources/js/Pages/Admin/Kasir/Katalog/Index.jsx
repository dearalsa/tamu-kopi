import { useState, useMemo, useRef, useEffect } from 'react'
import { Head, router, Link } from '@inertiajs/react'
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
} from 'lucide-react'

export default function CatalogIndex({ menus = [], categories = [], auth }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [orderType, setOrderType] = useState('dine-in')

  const [printData, setPrintData] = useState(null)
  const printRef = useRef(null)

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

  const formatDate = () => {
    const now = new Date()
    const day = now.getDate()
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    const month = monthNames[now.getMonth()]
    const year = now.getFullYear()
    return `${day} ${month} ${year}`
  }

  const formatTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const resetState = () => {
    setCart([])
    setPaymentMethod(null)
    setCashAmount('')
    setOrderType('dine-in')
    setIsProcessing(false)
    setPrintData(null)
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
      const scoreA =
        (a.promo_price && a.is_best_seller ? 3 : 0) +
        (a.is_best_seller ? 2 : 0) +
        (a.promo_price ? 1 : 0)
      const scoreB =
        (b.promo_price && b.is_best_seller ? 3 : 0) +
        (b.is_best_seller ? 2 : 0) +
        (b.promo_price ? 1 : 0)
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
        return prev.map(item =>
          item.id === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...menu, price, original_price: menu.price, quantity: 1 }]
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

  const removeFromCart = id => setCart(prev => prev.filter(item => item.id !== id))

  const clearCart = () => {
    if (confirm('Hapus semua pesanan?')) {
      setCart([])
      setPaymentMethod(null)
      setOrderType('dine-in')
    }
  }

  const subtotalNormal = cart.reduce((sum, item) => sum + item.original_price * item.quantity, 0)
  const totalDiscount = cart.reduce(
    (sum, item) => sum + (item.original_price - item.price) * item.quantity,
    0
  )
  const total = Math.max(0, subtotalNormal - totalDiscount)
  const changeAmount = cashAmount ? parseInt(cashAmount) - total : 0

  useEffect(() => {
    if (!printData || !printRef.current) return

    const printContent = printRef.current
    const windowPrint = window.open('', '', 'width=300,height=600')

    windowPrint.document.write(`
<html>
<head>
<title>Struk Pembayaran</title>
<style>
body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 10px; font-size: 12px; }
.text-center { text-align: center; }
.line { border-top: 1px dashed #000; margin: 5px 0; }
.item { display: flex; justify-content: space-between; margin-bottom: 2px; }
.total { font-weight: bold; margin-top: 5px; }
</style>
</head>
<body>
${printContent.innerHTML}
</body>
</html>
`)

    windowPrint.document.close()
    windowPrint.focus()
    setTimeout(() => {
      windowPrint.print()
      windowPrint.close()
    }, 500)
  }, [printData])

  const processPayment = () => {
    if (!paymentMethod) return

    if (paymentMethod === 'cash') {
      const cash = parseInt(cashAmount || 0)
      if (!cashAmount || isNaN(cash)) {
        alert('Masukkan nominal uang terlebih dahulu.')
        return
      }
      if (cash < total) {
        alert('Uang yang diterima kurang dari total pembayaran.')
        return
      }
    }

    setIsProcessing(true)

    const transactionData = {
      subtotal: subtotalNormal,
      discount: totalDiscount,
      total: total,
      payment_method: paymentMethod,
      cash_amount: paymentMethod === 'cash' ? parseInt(cashAmount || 0) : 0,
      change: paymentMethod === 'cash' ? changeAmount : 0,
      order_type: orderType,
      cart: cart.map(item => ({
        menu_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    }

    router.post(route('admin.kasir.transactions.store'), transactionData, {
      onSuccess: page => {
        const latestData = page.props?.flash?.success_transaction

        if (latestData) {
          setPrintData({
            invoice_number: latestData.invoice_number,
            queue_number: latestData.queue_number,
            date: formatDate(),
            time: formatTime(),
            kasir: auth?.user?.name || 'Admin',
            payment_method: paymentMethod === 'cash' ? 'Tunai' : 'QRIS',
            order_type: orderType,
            cart: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            subtotal: subtotalNormal,
            discount: totalDiscount,
            total: total,
            // tambahan untuk struk
            cash_amount: paymentMethod === 'cash' ? parseInt(cashAmount || 0) : 0,
            change: paymentMethod === 'cash' ? changeAmount : 0,
          })

          setShowSuccessPopup(true)
          setTimeout(() => {
            setShowSuccessPopup(false)
            resetState()
          }, 4000)
        }

        setIsProcessing(false)
      },
      onError: errors => {
        setIsProcessing(false)
        let errorMsg = 'Transaksi gagal!'
        if (errors.error) errorMsg += ` ${errors.error}`
        if (errors.invoice_number) errorMsg += ' (Invoice Duplicate)'
        alert(errorMsg)
      },
    })
  }

  return (
    <AdminLayout>
      <Head title="Katalog Menu" />

      {/* struk (hidden) */}
      <div ref={printRef} style={{ display: 'none' }}>
        {printData && (
          <>
            <div className="text-center">
              <img
                src="/asset/Tamu.svg"
                alt="Logo"
                style={{ width: '120px', margin: '0 auto 5px auto', display: 'block' }}
              />
              <p style={{ fontSize: '9px', margin: '0', lineHeight: '1.3' }}>
                Jl. Dadali No.7, RT. 03/RW. 05,<br /> Tanah Sereal, Kec. Tanah Sereal, Kota
                Bogor, Jawa Barat 16161 Indonesia<br /> 081218420963
              </p>
            </div>

            <div className="line" />
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                  width: '100%',
                }}
              >
                <span>{printData.date}</span>
                <span>{printData.time}</span>
              </div>

              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold' }}>Transaksi</span>
                  <span style={{ textAlign: 'right' }}>{printData.invoice_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold' }}>Pesanan</span>
                  <span style={{ textAlign: 'right' }}>{printData.queue_number}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold' }}>Kasir</span>
                  <span style={{ textAlign: 'right' }}>{printData.kasir}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontWeight: 'bold' }}>Metode</span>
                  <span style={{ textAlign: 'right' }}>{printData.payment_method}</span>
                </div>
              </div>
            </div>

            <div className="line" />

            <div
              className="text-center"
              style={{ fontSize: '11px', fontWeight: 'bold', margin: '5px 0' }}
            >
              {printData.order_type === 'dine-in' ? 'MAKAN DITEMPAT' : 'TAKE AWAY'}
            </div>
            <div className="line" />

            {printData.cart.map(item => (
              <div key={item.id} style={{ fontSize: '10px', marginBottom: '3px' }}>
                <div>{item.name}</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingLeft: '10px',
                  }}
                >
                  <span>
                    {item.quantity}x{Number(item.price).toLocaleString('id-ID')}
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
              </div>
            ))}

            <div className="line" />
            <div className="item" style={{ fontSize: '10px' }}>
              <span>Subtotal</span>
              <span>{printData.subtotal.toLocaleString('id-ID')}</span>
            </div>
            {printData.discount > 0 && (
              <div className="item" style={{ fontSize: '10px' }}>
                <span>Diskon</span>
                <span>- {printData.discount.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="item total" style={{ fontSize: '11px', marginTop: '4px' }}>
              <span>Total</span>
              <span>{printData.total.toLocaleString('id-ID')}</span>
            </div>

            {/* Tambahan: uang diterima & kembalian */}
            <div className="item" style={{ fontSize: '10px' }}>
              <span>{printData.payment_method === 'Tunai' ? 'TUNAI' : 'NON TUNAI'}</span>
              <span>
                {printData.payment_method === 'Tunai'
                  ? printData.cash_amount.toLocaleString('id-ID')
                  : printData.total.toLocaleString('id-ID')}
              </span>
            </div>
            {printData.payment_method === 'Tunai' && (
              <div className="item" style={{ fontSize: '10px' }}>
                <span>Kembalian</span>
                <span>{printData.change.toLocaleString('id-ID')}</span>
              </div>
            )}

            <div className="line" />

            <div
              className="text-center"
              style={{ marginTop: '10px', fontSize: '9px', lineHeight: '1.5' }}
            >
              Wifi<br />
              Indoor: Tataptemu<br />
              Outdoor: tatapaku<br />
              <p>Terima kasih telah berkunjung!</p>
            </div>
          </>
        )}
      </div>

      <div className="relative font-sfPro bg-gray-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          <div className="flex justify-start items-center mb-8 gap-4">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-600 placeholder-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-gray-50"
              />
            </div>
            <div className="relative w-56">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full flex items-center justify-between px-5 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-500 font-normal"
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
                      className={`w-full text-left px-4 py-3 text-sm transition-colors font-normal ${
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
                          <Star
                            size={10}
                            className="fill-[#f59e0b] text-[#f59e0b]"
                          />
                          <span className="text-[10px] uppercase tracking-wider text-[#b45309]">
                            BEST SELLER
                          </span>
                        </div>
                      )}
                      {menu.promo_price && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 border border-red-100">
                          <Tag size={10} className="fill-red-500 text-red-500" />
                          <span className="text-[10px] uppercase tracking-wider text-red-500">
                            PROMO
                          </span>
                        </div>
                      )}
                    </div>
                    <img
                      src={menu.image ? `/storage/${menu.image}` : '/asset/no-image.png'}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-gray-800 truncate text-base mb-1 font-normal">
                      {menu.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3 font-sfPro">
                      {typeof menu.category === 'object' ? menu.category?.name : menu.category}
                    </p>
                    <div className="mt-auto mb-4">
                      {menu.promo_price ? (
                        <div className="flex flex-col items-start">
                          <span className="text-xs text-gray-400 line-through font-sfPro">
                            Rp {Number(menu.price).toLocaleString('id-ID')}
                          </span>
                          <span className="text-lg text-[#ef5350] font-sfPro">
                            Rp {Number(menu.promo_price).toLocaleString('id-ID')}
                          </span>
                        </div>
                      ) : (
                        <p className="text-lg text-gray-900 font-normal">
                          Rp {Number(menu.price).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(menu)}
                      className="w-full bg-gray-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <ShoppingCart size={16} />
                      <span className="text-sm font-sfPro">Tambah</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search size={40} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-telegraf text-gray-700 mb-2">
                  Belum ada menu
                </h3>
                <p className="text-sm text-gray-400 font-sfPro text-center">
                  {searchTerm || selectedCategory !== 'all'
                    ? 'Tidak ada menu yang sesuai dengan pencarian Anda'
                    : 'Belum ada menu tersedia'}
                </p>
              </div>
            )}
          </div>

          {/* pagination */}
          {menus?.links && filteredAndSortedMenus.length > 0 && (
            <div className="flex justify-start pb-6">
              <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-100">
                {menus.links.map((link, index) => {
                  const isPrev = link.label.includes('Previous')
                  const isNext = link.label.includes('Next')
                  const label = isPrev ? '<' : isNext ? '>' : link.label

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
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* success popup */}
        <AnimatePresence>
          {showSuccessPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center"
              >
                <CheckCircle size={48} className="text-green-600 mx-auto mb-6" />
                <h3 className="text-2xl font-telegraf text-gray-900 mb-2">Berhasil!</h3>
                <p className="text-gray-500">
                  Pesanan telah diproses
                  <br />
                  dan struk dicetak.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* cart sidebar */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-4 top-4 bottom-4 w-[340px] bg-white/80 backdrop-blur-xl border shadow-xl z-50 flex flex-col rounded-[2.5rem] overflow-hidden"
            >
              <div className="p-7 pb-4 flex justify-between items-center">
                {paymentMethod ? (
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"
                  >
                    <ArrowLeft size={18} /> Kembali
                  </button>
                ) : (
                  <div>
                    <h2 className="text-xl font-telegraf text-gray-800">Pesanan</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-telegraf">
                      {cart.reduce((a, b) => a + b.quantity, 0)} Item Terpilih
                    </p>
                  </div>
                )}
                {!paymentMethod && (
                  <button
                    onClick={clearCart}
                    className="p-2.5 rounded-2xl bg-red-50 text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {!paymentMethod && (
                <div className="px-6 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOrderType('dine-in')}
                      className={`py-2.5 rounded-xl text-xs transition-all font-telegraf ${
                        orderType === 'dine-in' ? 'bg-black text-white' : 'bg-gray-100'
                      }`}
                    >
                      Dine In
                    </button>
                    <button
                      onClick={() => setOrderType('takeaway')}
                      className={`py-2.5 rounded-xl text-xs transition-all font-telegraf ${
                        orderType === 'takeaway' ? 'bg-black text-white' : 'bg-gray-100'
                      }`}
                    >
                      Take Away
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 space-y-4 py-2">
                {paymentMethod === null ? (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 rounded-3xl bg-white/50 border"
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden">
                        <img
                          src={
                            item.image ? `/storage/${item.image}` : '/asset/no-image.png'
                          }
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-red-500">
                          Rp {item.price.toLocaleString()}
                        </p>
                        <div className="flex justify-between mt-2">
                          <div className="flex gap-2 items-center bg-gray-100 rounded-lg px-2">
                            <button onClick={() => updateQuantity(item.id, -1)}>
                              <Minus size={12} />
                            </button>
                            <span className="text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : paymentMethod === 'cash' ? (
                  <div className="space-y-6 pt-4 text-center">
                    <div className="bg-gray-50 p-6 rounded-[2rem]">
                      <p className="text-[12px] text-gray-600 uppercase font-telegraf">
                        Total Pembayaran
                      </p>
                      <p className="text-[23px] font-sfPro">
                        Rp {total.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-sfPro px-2">Uang Diterima</label>
                      <input
                        type="text"
                        value={formatRupiah(cashAmount)}
                        onChange={e => setCashAmount(cleanNumber(e.target.value))}
                        className="w-full mt-2 p-4 border rounded-2xl text-lg font-sfPro border-gray-500 focus:border-black focus:ring-0"
                        placeholder="0"
                        autoFocus
                      />
                    </div>
                    {cashAmount && (
                      <div className="flex justify-between p-4 rounded-2xl bg-emerald-100/25 backdrop-blur-md">
                        <span className="text-xs font-sfPro">Kembalian</span>
                        <span className="font-sfPro">
                          Rp {changeAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="pt-4">
                    <div className="bg-gray-50 p-4 rounded-2xl mb-4 text-center">
                      <p className="text-[12px] text-gray-600 uppercase font-telegraf">
                        Total Pembayaran
                      </p>
                      <p className="text-xl font-sfPro text-gray-900">
                        Rp {total.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <img
                        src="/asset/qris.jpg"
                        className="w-48 mx-auto rounded-2xl border mb-3"
                      />

                      <div className="mt-1 w-full flex items-start gap-2 rounded-2xl bg-sky-100/60 px-3 py-2">
                        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/80 shrink-0">
                          <span className="text-[11px] font-bold text-white">!</span>
                        </div>
                        <p className="text-[11px] text-sky-900 font-sfPro text-left leading-relaxed">
                          Silakan scan kode QR terlebih dahulu dan tunggu hingga transaksi
                          berhasil, lalu tekan tombol{' '}
                          <span className="font-telegraf">Konfirmasi Pembayaran</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/40 border-t">
                {!paymentMethod ? (
                  <>
                    {totalDiscount > 0 ? (
                      <div className="mb-4 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="font-telegraf text-[12px]">Subtotal</span>
                          <span>
                            Rp {subtotalNormal.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-500 pt-2">
                          <span className="font-telegraf text-[12px]">Diskon</span>
                          <span>
                            - Rp {totalDiscount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-gray-200 mt-1">
                          <span className="font-telegraf text-[15px]">
                            Total Pembayaran
                          </span>
                          <span className="font-sfPro text-[19px]">
                            Rp {total.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between mb-4">
                        <span className="text-sm font-telegraf">
                          Total Pembayaran
                        </span>
                        <span className="text-xl font-sfPro text-gray-900">
                          Rp {total.toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className="bg-gray-200 py-3 rounded-2xl text-[12px] font-telegraf"
                      >
                        CASH
                      </button>
                      <button
                        onClick={() => setPaymentMethod('qris')}
                        className="bg-black text-white py-3 rounded-2xl text-[12px] font-poppins"
                      >
                        QRIS
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={processPayment}
                    disabled={
                      isProcessing ||
                      (paymentMethod === 'cash' && (!cashAmount || changeAmount < 0))
                    }
                    className="w-full bg-black text-white py-4 rounded-2xl font-telegraf text-[12px] disabled:bg-gray-400"
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
