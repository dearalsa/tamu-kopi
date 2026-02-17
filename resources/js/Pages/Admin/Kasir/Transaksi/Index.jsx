import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '@/Layouts/AdminLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Eye, X, DollarSign, Coffee, Clock, Calendar, UtensilsCrossed, Package, User, ReceiptText, CreditCard, Wallet, Hash } from 'lucide-react'
import { DatePicker, ConfigProvider } from 'antd'
import idID from 'antd/lib/locale/id_ID'
import dayjs from 'dayjs'
import 'dayjs/locale/id'

// set locale dayjs 
dayjs.locale('id')

export default function TransactionIndex({ transactions, stats, filters }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  
  const [startDate, setStartDate] = useState(filters.start_date ? dayjs(filters.start_date) : dayjs())
  const [endDate, setEndDate] = useState(filters.end_date ? dayjs(filters.end_date) : dayjs())

  const handleSearchByDate = () => {
    if (!startDate || !endDate) {
      alert('Mohon pilih tanggal mulai dan tanggal akhir');
      return;
    }
    
    router.get('/admin/kasir/transaksi', {
      start_date: startDate.format('YYYY-MM-DD'),
      end_date: endDate.format('YYYY-MM-DD'),
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  }

  const filteredTransactions = transactions.data.filter(trx => 
    trx.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatIDR = (amount) => {
    if (amount === undefined || amount === null) return '0';
    return Number(amount).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <AdminLayout>
      <Head title="Data Transaksi" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">Riwayat Transaksi</h1>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <ConfigProvider locale={idID}>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[10px] text-gray-500 font-sfPro tracking-wider leading-none">Dari Tanggal</span>
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  format="DD MMM YYYY"
                  allowClear={false}
                  variant="borderless"
                  className="p-0 font-medium text-sm flex items-center"
                  style={{ lineHeight: '1' }}
                />
              </div>
              <div className="w-px h-5 bg-gray-200 self-center"></div>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[10px] text-gray-500 font-sfPro tracking-wider leading-none">Sampai Tanggal</span>
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  format="DD MMM YYYY"
                  allowClear={false}
                  variant="borderless"
                  className="p-0 font-medium text-sm flex items-center"
                  style={{ lineHeight: '1' }}
                />
              </div>
            </ConfigProvider>
            <button
              onClick={handleSearchByDate}
              className="bg-gray-900 text-white px-8 py-2.5 rounded-xl text-xs font-sfPro hover:bg-black transition-all active:scale-95 shadow-sm"
            >
              Cari
            </button>
          </div>
        </div>

        {/* stats cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <DollarSign size={24} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-telegraf mb-1">Pendapatan</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">Rp {formatIDR(stats?.total_income)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <Coffee size={24} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-telegraf mb-1">Total Pesanan</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">{stats?.total_orders || '0'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center gap-5">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center shrink-0">
              <Clock size={24} className="text-red-500" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-telegraf mb-1">Jam Tersibuk</p>
              <p className="text-xl font-sfPro text-gray-800 font-black">{stats?.busy_hours || '-'}</p>
            </div>
          </div>
        </div>

        {/* search & table */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          <div className="p-8 pb-0">
            <div className="relative w-full max-w-md mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari Id Transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[250px] pl-12 pr-4 py-3 bg-gray-50 border-none focus:outline-none focus:ring-0 rounded-2xl text-sm font-sfPro"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Invoice</th>
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
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-700">
                        {dayjs(trx.created_at).format('DD MMM YYYY, HH:mm')}
                      </td>
                      <td className="px-8 py-5 text-sm">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sfPro uppercase tracking-wider ${
                          trx.order_type === 'dine-in' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {trx.order_type === 'dine-in' ? <UtensilsCrossed size={12} /> : <Package size={12} />}
                          {trx.order_type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-medium text-gray-600 border border-gray-400 px-2 py-1 rounded-md uppercase font-sfPro">
                          {trx.payment_method}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-900">Rp {formatIDR(trx.total)}</td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => setSelectedTransaction(trx)}
                          className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-900 hover:text-white flex items-center justify-center mx-auto transition-all active:scale-95"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center font-sfPro text-gray-400 text-sm">Data tidak ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
        <p className="text-xs text-gray-500 font-sfPro">
            Menampilkan {transactions.from || 0}–{transactions.to || 0} dari {transactions.total || 0} data
        </p>

        {/* tombol-tombol angka */}
        <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-50">
            {transactions.links.map((link, index) => {
            const isPrevious = link.label.includes('Previous');
            const isNext = link.label.includes('Next');
            const label = isPrevious ? '<' : isNext ? '>' : link.label;

            return (
                <Link
                key={index}
                href={link.url || '#'}
                as="button"
                disabled={!link.url}
                preserveScroll
                className={`
                    w-8 h-8 flex items-center justify-center rounded-lg text-xs font-sfPro transition-all
                    ${link.active 
                    ? 'bg-[#E5534B] text-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                    ${!link.url ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}
                `}
                >
                <span dangerouslySetInnerHTML={{ __html: label }} />
                </Link>
            );
            })}
    </div>
        </div>
      </div>

      {/* lihat detail */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sfPro"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative p-8">
                {/* close button */}
                <button 
                  onClick={() => setSelectedTransaction(null)}
                  className="absolute right-6 top-6 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X size={20} />
                </button>

                {/* header info */}
                <div className="text-center mt-4 mb-6">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ReceiptText size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-telegraf text-gray-900 tracking-tight">Detail Transaksi</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-[10px] font-sfPro px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md uppercase tracking-wider">
                      Pesanan #{selectedTransaction.queue_number || '-'}
                    </span>
                    <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                      {selectedTransaction.invoice_number}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] uppercase font-sfPro text-gray-600 tracking-widest mb-1 flex items-center gap-1.5">
                      <Calendar size={10} /> Waktu
                    </p>
                    <p className="text-[11px] font-sfPro text-gray-700 leading-tight">
                      {dayjs(selectedTransaction.created_at).format('DD MMM YYYY')}
                    </p>
                    <p className="text-[10px] text-gray-500 font-sfPro">{dayjs(selectedTransaction.created_at).format('HH:mm')} WIB</p>
                  </div>
                  <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] uppercase font-sfPro text-gray-600 tracking-widest mb-1 flex items-center gap-1.5">
                      <User size={10} /> Operator
                    </p>
                    <p className="text-[11px] font-sfPro text-gray-700 leading-tight truncate">{selectedTransaction.user?.name || 'Kasir'}</p>
                    <div className={`inline-flex items-center gap-1 mt-1 text-[10px] uppercase tracking-tighter ${selectedTransaction.order_type === 'dine-in' ? 'text-red-500' : 'text-orange-500'}`}>
                      {selectedTransaction.order_type}
                    </div>
                  </div>
                </div>

                {/* item list */}
                <div className="space-y-4 mb-6 max-h-[180px] overflow-y-auto px-1 custom-scrollbar">
                  <p className="text-[10px] font-telegraf text-gray-900 uppercase tracking-[0.2em] mb-2">Item Pesanan</p>
                  {selectedTransaction.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-sfPro text-gray-800 leading-tight mb-0.5">{item.menu_name || item.name}</p>
                        <p className="text-[10px] text-gray-500 font-sfPro">{item.quantity} x Rp {formatIDR(item.price)}</p>
                      </div>
                      <p className="text-sm font-sfPro text-gray-900 ml-4">Rp {formatIDR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* total harga pembayaran */}
                <div className="border-t-2 border-dashed border-gray-100 pt-5 space-y-2.5">
                  <div className="flex justify-between text-xs font-telegraf text-gray-600 px-1">
                    <span>Subtotal</span>
                    <span className="text-gray-600 font-sfPro">Rp {formatIDR(selectedTransaction.subtotal)}</span>
                  </div>
                  {selectedTransaction.discount > 0 && (
                    <div className="flex justify-between text-xs font-telegraf text-red-500 bg-red-50/50 p-2 rounded-xl border border-red-100">
                      <span className="tracking-widest text-[10px]">Diskon</span>
                      <span className="font-sfPro">- Rp {formatIDR(selectedTransaction.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 px-1">
                    <span className="text-[15px] font-telegraf text-gray-800 tracking-widest">Total Bayar</span>
                    <span className="text-xl font-sfPro text-gray-900 tracking-tighter">Rp {formatIDR(selectedTransaction.total)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      {selectedTransaction.payment_method === 'qris' ? <CreditCard size={16} /> : <Wallet size={16} />}
                    </div>
                    <span className="text-[9px] font-telegraf uppercase text-gray-400 tracking-wider">Metode: {selectedTransaction.payment_method}</span>
                  </div>
                  {selectedTransaction.payment_method === 'cash' && (
                    <div className="text-right font-sfPro">
                      <p className="text-[12px] text-green-600 font-sfPro tracking-tighter">Kembali: Rp {formatIDR(selectedTransaction.change)}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}