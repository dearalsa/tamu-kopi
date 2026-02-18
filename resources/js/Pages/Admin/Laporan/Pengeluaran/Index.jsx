import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faFileExcel } from '@fortawesome/free-regular-svg-icons';
import {
  Search,
  FileText,
  Calendar,
  Users,
  ArrowDownCircle,
  Package, // <--- Ganti ikon ini (Paket/Barang)
} from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function PengeluaranIndex({ products, start, end, summary }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(dayjs(start));
  const [endDate, setEndDate] = useState(dayjs(end));

  const formatIDR = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(num ?? 0)
      .replace('Rp', 'Rp ');
  };

  const handleFilter = () => {
    router.get(
      route('admin.laporan.pengeluaran'),
      {
        start: startDate.format('YYYY-MM-DD'),
        end: endDate.format('YYYY-MM-DD'),
      },
      { preserveState: true }
    );
  };

  const handleExport = (format) => {
    const url = route('admin.laporan.export', { tipe: 'pengeluaran' });
    const params = new URLSearchParams({
      start: startDate.format('YYYY-MM-DD'),
      end: endDate.format('YYYY-MM-DD'),
      format: format,
    }).toString();

    window.open(`${url}?${params}`, '_blank');
  };

  const filteredData = products?.data
    ? products.data.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <AdminLayout>
      <Head title="Laporan Pengeluaran" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">
              Laporan Pengeluaran
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100">
            <ConfigProvider locale={idID}>
              <div className="flex items-center gap-2 px-2">
                <span className="text-[13px] text-gray-600 font-sfPro">
                  Dari
                </span>
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
                <span className="text-[13px] text-gray-600 font-sfPro">
                  Sampai
                </span>
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
              className="bg-[#1E1C1C] text-white px-8 py-2.5 rounded-xl text-xs font-sfPro hover:bg-black transition-all active:scale-95"
            >
              Cari
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                <ArrowDownCircle size={22} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 uppercase font-sfPro tracking-[0.10em]">
                  Total Pengeluaran
                </p>
                <p className="text-[22px] font-sfPro text-gray-900 mt-1">
                  {formatIDR(summary?.total_pengeluaran || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-50 text-green-600">
                {/* GANTI ICON DI SINI JADI PACKAGE (KARDUS/BARANG) */}
                <Package size={22} />
              </div>
              <div>
                <p className="text-[11px] text-gray-600 uppercase font-sfPro tracking-[0.10em]">
                  Jumlah Pembelian
                </p>
                <p className="text-[22px] font-sfPro text-gray-900 mt-1">
                  {summary?.jumlah_transaksi || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* action bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama produk..."
              className="w-[260px] pl-10 pr-4 py-2.5 bg-white border border-gray-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl text-sm text-gray-600 placeholder-gray-400 appearance-none focus:outline-none focus:ring-0 focus:border-gray-50"
            />
          </div>

          {/* export buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-sfPro hover:bg-red-600 transition-all active:scale-95 shadow-sm"
            >
              <FontAwesomeIcon icon={faFilePdf} className="text-base" />
              <span>PDF</span>
            </button>

            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-sfPro hover:bg-emerald-600 transition-all active:scale-95 shadow-sm"
            >
              <FontAwesomeIcon icon={faFileExcel} className="text-base" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-[25px] border border-gray-50 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  No
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  Nama Produk
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  Kategori
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  Dibeli Oleh
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  Tanggal
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">
                  Keterangan
                </th>
                <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest text-right">
                  Harga
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/40 transition-colors"
                  >
                    <td className="px-8 py-4 align-middle">
                      <span className="text-[13px] font-sfPro text-gray-600">
                        {(products.from || 0) + index}
                      </span>
                    </td>

                    <td className="px-8 py-4 align-middle">
                      <span className="inline-flex items-center text-[13px] font-sfPro text-gray-800 tracking-tight">
                        {item.name}
                      </span>
                    </td>

                    <td className="px-8 py-4 align-middle">
                      <span className="text-[13px] font-sfPro text-gray-700">
                        {item.category?.name || '-'}
                      </span>
                    </td>

                    <td className="px-8 py-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                          <Users size={14} />
                        </div>
                        <span className="text-[13px] font-sfPro text-gray-800">
                          {item.created_by_name || 'Tidak diketahui'}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-4 align-middle">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-800">
                        <Calendar size={12} className="text-gray-800" />
                        <span className="font-sfPro">
                          {dayjs(item.date).format('DD MMM YYYY')}
                        </span>
                      </div>
                    </td>

                    <td className="px-8 py-4 align-middle">
                      <span className="text-[13px] font-sfPro text-gray-700">
                        {item.description || '-'}
                      </span>
                    </td>

                    <td className="px-8 py-4 align-middle text-right">
                      <span className="inline-flex items-center justify-end text-sm font-sfPro text-gray-800 px-3 py-1.5 rounded-xl">
                        {formatIDR(item.price)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <FileText size={48} />
                      <p className="text-sm font-sfPro text-gray-900">
                        Belum ada data pengeluaran.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <p className="text-xs text-gray-500 font-sfPro">
            Menampilkan {products.from || 0}–{products.to || 0} dari{' '}
            {products.total || 0} data
          </p>

          <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-50">
            {products.links?.map((link, index) => {
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
                    ${
                      link.active
                        ? 'bg-[#E5534B] text-white'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }
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