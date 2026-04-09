import { useState, useEffect, useRef } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, X, DollarSign, Coffee, Clock, Calendar, UtensilsCrossed, Package, User, ReceiptText, CreditCard, Wallet, Printer } from 'lucide-react'
import { DatePicker, ConfigProvider } from 'antd'
import idID from 'antd/lib/locale/id_ID'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

// set locale dayjs 
dayjs.locale('id')

export default function TransactionIndex({ transactions, stats, filters, auth }) {
  const { flash } = usePage().props;
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [printData, setPrintData] = useState(null)
  const printRef = useRef(null)
  
  const [startDate, setStartDate] = useState(filters.start_date ? dayjs(filters.start_date) : dayjs())
  const [endDate, setEndDate] = useState(filters.end_date ? dayjs(filters.end_date) : dayjs())

  useEffect(() => {
    if (flash?.success_transaction) {
      setPrintData(flash.success_transaction);
    }
  }, [flash]);

  // Logic Pencetakan agar Kompatibel Printer 58mm 
  useEffect(() => {
    if (!printData || !printRef.current) return
    const printContent = printRef.current.innerHTML
    const windowPrint = window.open('', '', 'width=450,height=600')
    
    windowPrint.document.write(`
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            @page { 
                size: 58mm auto; 
                margin: 0mm; 
            }
            html, body {
                margin: 0;
                padding: 0;
                width: 58mm;
                background-color: #fff;
            }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                padding: 2mm; 
                font-size: 11px; 
                line-height: 1.3;
                color: #000;
            }
            .text-center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 4px 0; width: 100%; }
            .item { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .total { font-weight: bold; margin-top: 5px; font-size: 12px; }
            .note { font-size: 9px; font-style: italic; margin-bottom: 4px; padding-left: 5px; }
            img { max-width: 35mm; height: auto; filter: grayscale(100%); margin-bottom: 5px; }
            
            @media print {
                header, footer { display: none !important; }
            }
          </style>
        </head>
        <body>
            <div style="width: 54mm; margin: 0 auto;">
                ${printContent}
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                };
            </script>
        </body>
      </html>
    `)
    windowPrint.document.close()
    setPrintData(null)
  }, [printData])

  const handleSearchByDate = () => {
    router.get('/admin/kasir/transaksi', {
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD'),
    }, { preserveState: true, preserveScroll: true, replace: true });
  }

  const filteredTransactions = transactions.data.filter(trx => 
    trx.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatIDR = (amount) => {
    return Number(amount || 0).toLocaleString('id-ID');
  };

  return (
    <AdminLayout>
      <Head title="Data Transaksi" />

      {/* Struk Template (Hidden) */}
      <div ref={printRef} style={{ display: 'none' }}>
        {printData && (
          <>
            <div className="text-center">
              {/* Logo diletakkan paling atas */}
              <img src="/asset/Tamu.svg" style={{ width: '120px', margin: '0 auto 5px auto', display: 'block' }} />
              <p style={{ fontSize: '9px', margin: '0', lineHeight: '1.3' }}>
                Jl. Dadali No.7, Tanah Sereal, Kota Bogor<br /> 081218420963
              </p>
            </div>
            <div className="line" />
            <div style={{ fontSize: '10px' }}>
              <div className="item"><span>Tgl</span><span>{dayjs(printData.created_at).format('DD MMM YYYY HH:mm')}</span></div>
              <div className="item"><span>ID</span><span>{printData.invoice_number}</span></div>
              <div className="item"><span>Kasir</span><span>{printData.cashier_name || auth?.user?.name}</span></div>
            </div>
            <div className="line" />
            <div className="text-center" style={{ fontWeight: 'bold', margin: '5px 0', textTransform: 'uppercase' }}>
              {printData.order_type === 'dine-in' ? 'MAKAN DITEMPAT' : 'TAKE AWAY'}
            </div>
            <div className="line" />
            {printData.items?.map((item, idx) => (
              <div key={idx} style={{ marginBottom: '5px' }}>
                <div className="item">
                  <span style={{ flex: 1, paddingRight: '5px' }}>{item.menu_name || item.name}</span>
                  <span>{formatIDR(item.price * item.quantity)}</span>
                </div>
                <div style={{ fontSize: '9px' }}>{item.quantity} x {formatIDR(item.price)}</div>
                {/* Menampilkan catatan/note jika ada */}
                {(item.note || item.description) && (
                  <div className="note">Catatan: {item.note || item.description}</div>
                )}
              </div>
            ))}
            <div className="line" />
            <div className="item"><span>Subtotal</span><span>{formatIDR(printData.subtotal)}</span></div>
            {printData.discount > 0 && <div className="item"><span>Diskon</span><span>-{formatIDR(printData.discount)}</span></div>}
            <div className="item total"><span>TOTAL</span><span>{formatIDR(printData.total)}</span></div>
            
            <div className="line" />
            <div className="item"><span style={{textTransform: 'uppercase'}}>Metode Bayar</span><span>{printData.payment_method}</span></div>
            <div className="item"><span>Bayar</span><span>{formatIDR(printData.cash_amount || printData.total)}</span></div>
            {printData.payment_method === 'cash' && (
              <div className="item"><span>Kembalian</span><span>{formatIDR(printData.change)}</span></div>
            )}
            
            <div className="line" />
            <div className="text-center" style={{ marginTop: '10px', fontSize: '9px' }}>Terima Kasih!</div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">Riwayat Transaksi</h1>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <ConfigProvider locale={idID}>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[10px] text-gray-500 font-sfPro tracking-wider leading-none">Dari Tanggal</span>
                <DatePicker value={startDate} onChange={setStartDate} format="DD MMM YYYY" allowClear={false} variant="borderless" className="p-0 font-medium text-sm flex items-center" />
              </div>
              <div className="w-px h-5 bg-gray-200 self-center"></div>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[10px] text-gray-500 font-sfPro tracking-wider leading-none">Sampai Tanggal</span>
                <DatePicker value={endDate} onChange={setEndDate} format="DD MMM YYYY" allowClear={false} variant="borderless" className="p-0 font-medium text-sm flex items-center" />
              </div>
            </ConfigProvider>
            <button onClick={handleSearchByDate} className="bg-gray-900 text-white px-8 py-2.5 rounded-xl text-xs font-sfPro hover:bg-black transition-all active:scale-95 shadow-sm">Cari</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0"><DollarSign size={24} className="text-red-500" strokeWidth={2.5} /></div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-sfPro mb-1">Pendapatan</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">Rp {formatIDR(stats?.total_income)}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0"><Coffee size={24} className="text-red-500" strokeWidth={2.5} /></div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-sfPro mb-1">Total Pesanan</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">{stats?.total_orders || '0'}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0"><Clock size={24} className="text-red-500" strokeWidth={2.5} /></div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-sfPro mb-1">Jam Tersibuk</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">{stats?.busy_hours || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[25px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          <div className="p-8 pb-0">
            <div className="relative w-full max-w-md mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Cari Id Transaksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[250px] pl-12 pr-4 py-3 bg-gray-50 border-none focus:outline-none focus:ring-0 rounded-2xl text-sm font-sfPro" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">ID Transaksi</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Waktu</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Tipe</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Metode</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-800">{trx.invoice_number}</td>
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-700">{dayjs(trx.created_at).format('DD MMM YYYY, HH:mm')}</td>
                      <td className="px-8 py-5 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sfPro uppercase tracking-wider ${trx.order_type === 'dine-in' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                          {trx.order_type === 'dine-in' ? <UtensilsCrossed size={12} /> : <Package size={12} />}
                          {trx.order_type}
                        </span>
                      </td>
                      <td className="px-8 py-5"><span className="text-[10px] font-medium text-gray-600 border border-gray-400 px-2 py-1 rounded-md uppercase font-sfPro">{trx.payment_method}</span></td>
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-900">Rp {formatIDR(trx.total)}</td>
                      <td className="px-8 py-5 flex justify-center gap-2">
                        <button onClick={() => setSelectedTransaction(trx)} className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all active:scale-95"><Eye size={18} /></button>
                        <button onClick={() => setPrintData(trx)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-95"><Printer size={18} /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center font-sfPro text-gray-400 text-sm">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <p className="text-xs text-gray-500 font-sfPro">Menampilkan {transactions.from || 0}–{transactions.to || 0} dari {transactions.total || 0} data</p>
          <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-50">
            {transactions.links.map((link, index) => (
              <Link key={index} href={link.url || '#'} as="button" disabled={!link.url} preserveScroll className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-sfPro transition-all ${link.active ? 'bg-[#E5534B] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'} ${!link.url ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`} dangerouslySetInnerHTML={{ __html: link.label.includes('Previous') ? '<' : link.label.includes('Next') ? '>' : link.label }} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTransaction && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sfPro" onClick={() => setSelectedTransaction(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[2.5rem] w-full max-w-sm max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.1)]" onClick={e => e.stopPropagation()}>
              <div className="relative p-8">
                <button onClick={() => setSelectedTransaction(null)} className="absolute right-6 top-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors z-10"><X size={20} /></button>
                <div className="text-center mt-4 mb-6">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4"><ReceiptText size={24} className="text-white" /></div>
                  <h3 className="text-lg font-telegraf text-gray-900 tracking-tight">Detail Transaksi</h3>
                  <div className="flex flex-col items-center justify-center gap-1 mt-1">
                    <span className="text-[10px] font-sfPro px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">Pesanan #{selectedTransaction.queue_number || '-'}</span>
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{selectedTransaction.invoice_number}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] uppercase font-sfPro text-gray-600 tracking-widest mb-1 flex items-center gap-1.5"><Calendar size={10} /> Waktu</p>
                    <p className="text-[11px] font-sfPro text-gray-700 leading-tight">{dayjs(selectedTransaction.created_at).format('DD MMM YYYY')}</p>
                    <p className="text-[10px] text-gray-500 font-sfPro">{dayjs(selectedTransaction.created_at).format('HH:mm')} WIB</p>
                  </div>
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] uppercase font-sfPro text-gray-600 tracking-widest mb-1 flex items-center gap-1.5"><User size={10} /> Operator</p>
                    <p className="text-[11px] font-sfPro text-gray-700 leading-tight truncate">{selectedTransaction.cashier_name || 'Kasir'}</p>
                    <div className={`inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-tighter ${selectedTransaction.order_type === 'dine-in' ? 'text-red-500' : 'text-orange-500'}`}>{selectedTransaction.order_type}</div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <p className="text-[10px] font-telegraf text-gray-900 uppercase tracking-[0.2em] mb-2 border-b border-gray-50 pb-2">Item Pesanan</p>
                  {selectedTransaction.items?.map((item, idx) => (
                    <div key={idx} className="flex flex-col mb-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-sfPro text-gray-800 leading-tight mb-0.5">{item.menu_name || item.name}</p>
                          <p className="text-[10px] text-gray-500 font-sfPro">{item.quantity} x Rp {formatIDR(item.price)}</p>
                        </div>
                        <p className="text-sm font-sfPro text-gray-900 ml-4">Rp {formatIDR(item.price * item.quantity)}</p>
                      </div>
                      {(item.note || item.description) && (
                        <p className="text-[10px] text-red-500 italic mt-1 font-sfPro">* {item.note || item.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-gray-100 pt-5 space-y-2.5">
                  <div className="flex justify-between text-xs font-telegraf text-gray-600 px-1"><span>Subtotal</span><span className="text-gray-600 font-sfPro">Rp {formatIDR(selectedTransaction.subtotal)}</span></div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-xs font-telegraf text-red-500 bg-red-50/50 p-2 rounded-xl border border-red-100"><span className="tracking-widest text-[10px]">Diskon</span><span className="font-sfPro">- Rp {formatIDR(selectedTransaction.discount)}</span></div>
                  )}
                  <div className="flex justify-between items-center pt-2 px-1"><span className="text-[15px] font-telegraf text-gray-800 tracking-widest">Total Bayar</span><span className="text-xl font-sfPro text-gray-900 tracking-tighter">Rp {formatIDR(selectedTransaction.total)}</span></div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">{selectedTransaction.payment_method === 'qris' ? <CreditCard size={16} /> : <Wallet size={16} />}</div>
                    <span className="text-[9px] font-telegraf uppercase text-gray-400 tracking-wider">Metode: {selectedTransaction.payment_method}</span>
                  </div>
                  {selectedTransaction.payment_method === 'cash' && <div className="text-right font-sfPro"><p className="text-[12px] text-green-600 font-sfPro tracking-tighter">Kembali: Rp {formatIDR(selectedTransaction.change)}</p></div>}
                </div>

                <button onClick={() => setPrintData(selectedTransaction)} className="w-full mt-6 bg-gray-900 text-white py-4 rounded-2xl font-telegraf text-[12px] flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <Printer size={16} /> Cetak Struk
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}