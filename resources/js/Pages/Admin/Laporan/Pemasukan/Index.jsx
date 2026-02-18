import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel } from '@fortawesome/free-regular-svg-icons';
import {
  Search,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Coins,
  User,
  Calendar
} from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function PemasukanIndex({ transactions, start, end, summary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(dayjs(start));
  const [endDate, setEndDate] = useState(dayjs(end));

  const formatIDR = (num) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num).replace('Rp', 'Rp ');

  const handleFilter = () => {
    router.get(route('admin.laporan.pemasukan'), {
      start: startDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
    }, { preserveState: true });
  };

  const handleExport = (format) => {
    const url = route('admin.laporan.export', { tipe: 'pemasukan' });
    const params = new URLSearchParams({
      start: startDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
      format,
    }).toString();
    window.open(`${url}?${params}`, '_blank');
  };

  const filteredData = transactions.data.filter((item) =>
    item.invoice?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cashier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Head title="Laporan Pemasukan" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">

        {/* header & filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">Laporan Pemasukan</h1>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100">
            <ConfigProvider locale={idID}>
              <div className="flex items-center gap-2 px-2">
                <span className="text-[13px] text-gray-600">Dari</span>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  format="DD MMM YYYY"
                  variant="borderless"
                  className="font-medium"
                />
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <div className="flex items-center gap-2 px-2">
                <span className="text-[13px] text-gray-600">Sampai</span>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  format="DD MMM YYYY"
                  variant="borderless"
                  className="font-medium"
                />
              </div>
            </ConfigProvider>
            <button
              onClick={handleFilter}
              className="bg-[#1E1C1C] text-white px-8 py-2.5 rounded-xl text-xs hover:bg-black transition-all active:scale-95"
            >
              Cari
            </button>
          </div>
        </div>

        {/* summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                <ArrowUpCircle size={22} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Total Penjualan</p>
                <p className="text-[22px] text-gray-900 mt-1">{formatIDR(summary?.total_pemasukan ?? 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                <ArrowDownCircle size={22} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Beli Bahan</p>
                <p className="text-[22px] text-gray-900 mt-1">- {formatIDR(summary?.total_pengeluaran ?? 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
                <Coins size={22} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Sisa Dana</p>
                <p className="text-[22px] text-gray-900 mt-1">{formatIDR(summary?.saldo_bersih ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* action bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Kasir atau No. Transaksi..."
              className="w-[260px] pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm hover:bg-red-600 transition-all active:scale-95 shadow-sm"
            >
              <FontAwesomeIcon icon={faFilePdf} className="text-base" />
              <span>PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-base" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[25px] border border-gray-50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                {['No', 'No. Transaksi', 'Tanggal', 'Jam', 'Penerima (Kasir)', 'Total Pemasukan'].map((h, i) => (
                  <th
                    key={i}
                    className={`px-8 py-5 text-[10px] font-medium text-gray-800 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-8 py-4">
                      <span className="text-[12px] text-gray-600">{transactions.from + index}</span>
                    </td>

                    <td className="px-8 py-4">
                      <span className="text-[12px] text-gray-800 tracking-tight">{item.invoice}</span>
                    </td>

                    <td className="px-8 py-4">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <Calendar size={12} className="text-gray-400" />
                        <span>{dayjs(item.created_at).format('DD MMM YYYY')}</span>
                      </div>
                    </td>

                    <td className="px-8 py-4">
                      <span className="text-[12px] text-gray-700">
                        {dayjs(item.created_at).format('HH:mm')} WIB
                      </span>
                    </td>

                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <User size={14} />
                        </div>
                        <span className="text-[13px] text-gray-700">
                          {item.cashier_name || '-'}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-4 text-right">
                      <span className="text-sm text-gray-800 px-3 py-1.5 rounded-xl">
                        {formatIDR(item.total)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FileText size={48} />
                      <p className="text-sm text-gray-900">Belum ada data transaksi.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <p className="text-xs text-gray-500">
            Menampilkan {transactions.from || 0}–{transactions.to || 0} dari {transactions.total || 0} data
          </p>

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
                    w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all
                    ${link.active ? 'bg-[#E5534B] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
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
    </AdminLayout>
  );
}