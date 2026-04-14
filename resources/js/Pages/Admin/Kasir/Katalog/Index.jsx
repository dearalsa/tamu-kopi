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
  AlertCircle,
  Printer,
  CheckCircle2,
  User,
  Clock,
  Utensils,
  StickyNote
} from 'lucide-react'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

dayjs.locale('id')

export default function CatalogIndex({ menus = [], categories = [], auth, filters }) {
  const { flash } = usePage().props

  const [searchTerm, setSearchTerm] = useState(filters?.search || '')
  const [selectedCategory, setSelectedCategory] = useState(filters?.category || 'all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [cart, setCart] = useState([])
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [cashAmount, setCashAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showClearCartModal, setShowClearCartModal] = useState(false)
  const [orderType, setOrderType] = useState('dine-in')
  
  const [completedTransaction, setCompletedTransaction] = useState(null)

  const categoryFilters = [
    { value: 'all', label: 'Semua Menu' },
    ...categories.map(cat => ({ value: String(cat.id), label: cat.name })),
  ]

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setShowCategoryDropdown(false);
    router.get(route('admin.kasir.katalog.index'), 
      { category: value, search: searchTerm }, 
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      router.get(route('admin.kasir.katalog.index'), 
        { category: selectedCategory, search: searchTerm }, 
        { preserveState: true, preserveScroll: true }
      );
    }
  };

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
      setCompletedTransaction(flash.success_transaction)
      handlePrintReceipt(flash.success_transaction)
    }
  }, [flash])

  const handleDoneTransaction = () => {
    setCompletedTransaction(null)
    resetState()
  }

  const handlePrintReceipt = (data) => {
    if (!data) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    
    if (!printWindow) {
      alert('Mohon izinkan pop-up browser untuk mencetak struk.');
      return;
    }
    
    const itemsHtml = data.items?.map(item => {
      const noteText = item.note || item.pivot?.note || item.description;
      return `
        <tr>
            <td class="item-name">
                ${item.menu_name || item.name}
                ${noteText ? `<br><span class="note">* Catatan: ${noteText}</span>` : ''}
            </td>
            <td class="center-align qty">${item.quantity}</td>
            <td class="right-align price">${Number(item.price * item.quantity).toLocaleString('id-ID')}</td>
        </tr>
      `;
    }).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Transaksi</title>
          <style>
            @page { 
                size: 58mm auto; 
                margin: 0; 
            }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 48mm; 
                margin: 0 auto; 
                padding: 5mm 2mm; 
                font-size: 11px; 
                line-height: 1.3; 
                color: #000; 
                background: #fff; 
            }
            h1, h2, h3, p { margin: 0; padding: 0; }
            .center-align { text-align: center; }
            .right-align { text-align: right; }
            .left-align { text-align: left; }
            .bold { font-weight: bold; }
            
            .dashed-line { border-top: 1px dashed #000; margin: 5px 0; }
            .solid-line { border-top: 1px solid #000; margin: 5px 0; }
            
            table.meta-table { width: 100%; font-size: 10px; margin-bottom: 5px;}
            table.meta-table td { vertical-align: top; padding: 1px 0;}
            
            table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
            table.items-table th { 
                font-size: 10px; 
                border-top: 1px dashed #000; 
                border-bottom: 1px dashed #000; 
                padding: 4px 0;
                text-align: left;
            }
            table.items-table td { padding: 4px 0; vertical-align: top; }
            table.items-table .item-name { width: 55%; word-break: break-word; }
            table.items-table .qty { width: 15%; text-align: center; }
            table.items-table .price { width: 30%; text-align: right; }
            .note { font-size: 9px; font-style: italic; }

            table.total-table { width: 100%; font-size: 11px; }
            table.total-table td { padding: 2px 0; }
            
            .footer-info { margin-top: 10px; font-size: 10px; line-height: 1.4;}
          </style>
        </head>
        <body>
          <div class="center-align" style="margin-bottom: 10px;">
            <div class="bold" style="font-size: 14px;">TA-MU KOPI</div>
            <div style="font-size: 10px;">Jl. Dadali No. 7, Bogor</div>
            <div style="font-size: 10px;">081218420963</div>
          </div>
          
          <table class="meta-table">
            <tr>
                <td width="35%">Tanggal</td>
                <td width="5%">:</td>
                <td>${dayjs(data.created_at).format('DD/MM/YYYY')} ${dayjs(data.created_at).format('HH:mm')}</td>
            </tr>
            <tr>
                <td>ID</td>
                <td>:</td>
                <td>${data.invoice_number}</td>
            </tr>
            <tr>
                <td>Kasir</td>
                <td>:</td>
                <td>${data.cashier_name || auth?.user?.name || 'Kasir'}</td>
            </tr>
          </table>

          <div class="center-align bold" style="margin: 8px 0; font-size: 12px; text-transform: uppercase;">
            *** ${data.order_type.replace('-', ' ')} ***
          </div>

          <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="center-align">Qty</th>
                    <th class="right-align">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
          </table>

          <div class="solid-line"></div>

          <table class="total-table">
            <tr>
                <td width="60%">Subtotal</td>
                <td width="5%">:</td>
                <td class="right-align">${Number(data.subtotal).toLocaleString('id-ID')}</td>
            </tr>
            ${data.discount > 0 ? `
            <tr>
                <td>Diskon</td>
                <td>:</td>
                <td class="right-align">-${Number(data.discount).toLocaleString('id-ID')}</td>
            </tr>` : ''}
            <tr class="bold" style="font-size: 13px;">
                <td>TOTAL</td>
                <td>:</td>
                <td class="right-align">Rp ${Number(data.total).toLocaleString('id-ID')}</td>
            </tr>
          </table>

          <div class="dashed-line"></div>

          <table class="total-table" style="font-size: 10px;">
            <tr>
                <td width="60%">Metode Bayar</td>
                <td width="5%">:</td>
                <td class="right-align">${data.payment_method.toUpperCase()}</td>
            </tr>
            <tr>
                <td>Diterima</td>
                <td>:</td>
                <td class="right-align">${Number(data.cash_amount || data.total).toLocaleString('id-ID')}</td>
            </tr>
            ${data.payment_method === 'cash' ? `
            <tr>
                <td>Kembali</td>
                <td>:</td>
                <td class="right-align">${Number(data.change).toLocaleString('id-ID')}</td>
            </tr>` : ''}
          </table>
          
          <div class="solid-line" style="margin-top: 8px;"></div>

          <div class="center-align footer-info">
            <div class="bold" style="margin-bottom: 4px;">TERIMA KASIH!</div>
            <div>WiFi</div>
            <div>Indoor: Tatapku</div>
            <div>Outdoor: Tataptemu</div>
          </div>
          
          <script>
            // Perbaikan: Eksekusi langsung dengan timeout, tanpa menunggu window.onload
            setTimeout(function() {
              window.focus(); // Paksa window ke depan
              window.print(); // Panggil dialog print
            }, 500);

            // Menutup window setelah print selesai / dibatalkan
            window.onafterprint = function() { 
              window.close(); 
            };

            // Fallback: tutup otomatis setelah beberapa detik jika browser tidak support onafterprint
            setTimeout(function() { 
              window.close(); 
            }, 3000);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus(); 
  };

  const filteredAndSortedMenus = useMemo(() => {
    const menuData = menus.data || menus;
    let result = Array.isArray(menuData) ? [...menuData] : [];
    result.sort((a, b) => {
      if (a.is_package !== b.is_package) return a.is_package ? -1 : 1
      const scoreA = (a.promo_price ? 3 : 0) + (a.is_best_seller ? 2 : 0)
      const scoreB = (b.promo_price ? 3 : 0) + (b.is_best_seller ? 2 : 0)
      if (scoreB !== scoreA) return scoreB - scoreA
      return a.name.localeCompare(b.name)
    })
    return result
  }, [menus])

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
  
  const cashValue = parseInt(cashAmount || 0)
  const changeAmount = cashValue - total

  const processPayment = () => {
    if (!paymentMethod) return
    if (paymentMethod === 'cash') {
      if (!cashAmount || isNaN(cashValue)) { alert('Masukkan nominal uang.'); return; }
      if (cashValue < total) { alert('Uang diterima kurang.'); return; }
    }
    if (cart.length === 0) { alert('Keranjang kosong.'); return; }

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
        note: item.note 
      })),
    }
    router.post(route('admin.kasir.transactions.store'), transactionData, {
      onFinish: () => setIsProcessing(false),
      onError: errors => alert(`Gagal! ${errors.error || ''}`),
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
                onKeyDown={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm outline-none"
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
                      onClick={() => handleCategoryChange(filter.value)}
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
                <motion.div key={menu.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col h-full cursor-pointer">
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
                    <p className="text-xs text-gray-400 mb-2 font-sfPro">{menu.category}</p>
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
                    <button onClick={(e) => { e.stopPropagation(); addToCart(menu); }} className="w-full bg-gray-900 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                      <ShoppingCart size={16} /> <span className="text-sm font-sfPro">Tambah</span>
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 font-sfPro">
                <Search size={48} className="mb-4 opacity-20" />
                <p>Menu tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Hapus Keranjang */}
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

        {/* Modal PREVIEW STRUK DETAIL (SETELAH PEMBAYARAN) */}
        <AnimatePresence>
          {completedTransaction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[32px] w-full max-w-[420px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                
                {/* Header Success */}
                <div className="p-8 pb-4 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={28} strokeWidth={2.5} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 font-sfPro">Pembayaran Sukses</h3>
                  <p className="text-sm text-gray-500 font-sfPro mt-1 tracking-tight font-mono">INV: {completedTransaction.invoice_number}</p>
                </div>

                {/* Info Bar: Kasir, Jam, Tipe */}
                <div className="px-8 grid grid-cols-3 gap-2 py-4 border-y border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col items-center text-center">
                        <User size={14} className="text-gray-400 mb-1"/>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Kasir</span>
                        <span className="text-xs font-semibold text-gray-700 truncate w-full px-1">{completedTransaction.cashier_name || auth?.user?.name}</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Clock size={14} className="text-gray-400 mb-1"/>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Waktu</span>
                        <span className="text-xs font-semibold text-gray-700">{dayjs(completedTransaction.created_at).format('HH:mm')} WIB</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <Utensils size={14} className="text-gray-400 mb-1"/>
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Tipe</span>
                        <span className="text-xs font-semibold text-gray-700 capitalize">{completedTransaction.order_type.replace('-', ' ')}</span>
                    </div>
                </div>

                {/* Items List (Dengan Catatan) */}
                <div className="px-8 py-6 flex-1 overflow-y-auto font-sfPro no-scrollbar">
                  <div className="space-y-5">
                    {completedTransaction.items?.map((item, idx) => {
                      const noteText = item.note || item.pivot?.note || item.description;
                      return (
                      <div key={idx} className="flex flex-col">
                        <div className="flex justify-between items-start">
                            <div className="text-gray-900 text-sm font-medium pr-4">
                                <p className="leading-tight">{item.menu_name || item.name}</p>
                                <p className="text-gray-500 text-xs font-normal mt-0.5">{item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}</p>
                            </div>
                            <p className="text-gray-900 text-sm font-semibold whitespace-nowrap">Rp {Number(item.price * item.quantity).toLocaleString('id-ID')}</p>
                        </div>
                        
                        {/* CATATAN ITEM */}
                        {noteText && (
                            <div className="mt-2 flex items-start gap-1.5 px-3 py-2 bg-red-50/50 border-l-2 border-red-400 rounded-r-lg">
                                <StickyNote size={12} className="text-red-400 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-red-600 italic font-medium">Catatan: {noteText}</p>
                            </div>
                        )}
                      </div>
                    )})}
                  </div>

                  {/* Summary */}
                  <div className="border-t border-dashed border-gray-200 mt-6 pt-6 space-y-3">
                    <div className="flex justify-between text-sm text-gray-500 font-sfPro">
                      <span>Subtotal</span>
                      <span>Rp {Number(completedTransaction.subtotal).toLocaleString('id-ID')}</span>
                    </div>
                    {completedTransaction.discount > 0 && (
                      <div className="flex justify-between text-sm text-red-500">
                        <span>Diskon</span>
                        <span>-Rp {Number(completedTransaction.discount).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-sfPro text-gray-900 text-lg pt-1">
                      <span>Total Akhir</span>
                      <span className="font-bold">Rp {Number(completedTransaction.total).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Payment Detail */}
                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/30 p-3 rounded-2xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 uppercase font-sfPro tracking-widest">Metode Bayar</span>
                        <span className="text-sm font-sfPro text-gray-800 uppercase font-bold">{completedTransaction.payment_method}</span>
                    </div>
                    {completedTransaction.payment_method === 'cash' && (
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] text-gray-400 uppercase font-sfPro tracking-widest">Kembalian</span>
                            <span className="text-sm font-sfPro text-green-600 tracking-tight font-bold">Rp {Number(completedTransaction.change).toLocaleString('id-ID')}</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-8 pb-8 space-y-3 pt-2 bg-white border-t border-gray-50">
                  <button 
                    onClick={() => handlePrintReceipt(completedTransaction)} 
                    className="w-full bg-[#111827] text-white py-4 rounded-2xl font-sfPro text-[15px] flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-gray-200"
                  >
                    <Printer size={18} /> Cetak Struk Ulang
                  </button>
                  <button 
                    onClick={handleDoneTransaction} 
                    className="w-full bg-white text-gray-700 border border-gray-200 py-4 rounded-2xl font-sfPro text-[15px] hover:bg-gray-50 transition-colors active:scale-[0.98]"
                  >
                    Selesai & Tutup
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar Keranjang */}
        <AnimatePresence>
          {cart.length > 0 && !completedTransaction && (
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-4 top-4 bottom-4 w-[340px] bg-white/80 backdrop-blur-xl border shadow-xl z-50 flex flex-col rounded-[2.5rem] overflow-hidden">
              <div className="p-7 pb-4 flex justify-between items-center">
                {paymentMethod ? (
                  <button onClick={() => {setPaymentMethod(null); setCashAmount('')}} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"><ArrowLeft size={18} /> Kembali</button>
                ) : (
                  <div>
                    <h2 className="text-xl font-telegraf text-gray-800">Pesanan</h2>
                    <p className="text-[10px] text-gray-400 uppercase font-telegraf">{cart.reduce((a, b) => a + b.quantity, 0)} Item Terpilih</p>
                  </div>
                )}
                {!paymentMethod && <button onClick={() => setShowClearCartModal(true)} className="p-2.5 rounded-2xl bg-red-50 text-red-500"><Trash2 size={18} /></button>}
              </div>

              {!paymentMethod && (
                <div className="px-6 mb-4 flex gap-2">
                  <button onClick={() => setOrderType('dine-in')} className={`flex-1 py-2.5 rounded-xl text-xs font-telegraf ${orderType === 'dine-in' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>Dine In</button>
                  <button onClick={() => setOrderType('takeaway')} className={`flex-1 py-2.5 rounded-xl text-xs font-telegraf ${orderType === 'takeaway' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>Take Away</button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-6 space-y-4 py-2 no-scrollbar">
                {paymentMethod === null ? (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-3 rounded-3xl bg-white/50 border">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0"><img src={item.image ? `/storage/${item.image}` : '/asset/no-image.png'} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-red-500">Rp {item.price.toLocaleString('id-ID')}</p>
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
                          <input type="text" value={formatRupiah(cashAmount)} onChange={e => setCashAmount(cleanNumber(e.target.value))} className="w-full mt-1.5 p-4 border-2 border-gray-100 rounded-2xl text-xl text-center outline-none focus:border-gray-100 font-sfPro" placeholder="0" autoFocus />
                        </div>
                        <AnimatePresence>
                          {cashValue >= total && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                              <p className="text-[10px] text-green-600 uppercase font-sfPro mb-1">Uang Kembalian</p>
                              <p className="text-lg font-sfPro text-green-700">Rp {changeAmount.toLocaleString('id-ID')}</p>
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
                  <button onClick={processPayment} disabled={isProcessing || (paymentMethod === 'cash' && (cashValue < total))} className="text-[14px] w-full bg-black text-white py-4 rounded-2xl disabled:bg-gray-300 hover:bg-gray-800 transition-colors font-telegraf">
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