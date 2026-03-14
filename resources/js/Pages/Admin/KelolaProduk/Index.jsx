import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
  Search, 
  Eye, 
  Plus, 
  Tag, 
  CheckCircle2,
  XCircle,
  FileText,
  Pencil,
  AlertTriangle 
} from 'lucide-react';
import { DatePicker, ConfigProvider } from 'antd';
import idID from 'antd/lib/locale/id_ID';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function ProductIndex({ products, filters }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // REVISI LOGIKA TANGGAL:
  // Mengambil rentang dari Controller (Default: Awal Bulan s/d Akhir Bulan)
  const [startDate, setStartDate] = useState(
    filters.start_date ? dayjs(filters.start_date) : dayjs().startOf('month')
  );
  const [endDate, setEndDate] = useState(
    filters.end_date ? dayjs(filters.end_date) : dayjs().endOf('month')
  );

  const handleSearchByDate = () => {
    router.get(
      route('admin.kelola-produk.index'),
      {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
  };

  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('Rp', 'Rp ');
  };

  const from = products.from ?? 0;
  const to = products.to ?? 0;
  const total = products.total ?? 0;

  const displayData = products.data.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <Head title="Kelola Bahan" />

      <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 font-sfPro bg-gray-50/30 min-h-screen">
        
        {/* Header & Filter Tanggal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-telegraf text-gray-800 tracking-tight">
              Kelola Bahan
            </h1>
            <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-wider font-medium">
              Periode: {dayjs(startDate).format('DD MMM')} — {dayjs(endDate).format('DD MMM YYYY')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <ConfigProvider locale={idID}>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[11px] text-gray-700">Dari Tanggal</span>
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  format="DD MMM YYYY"
                  allowClear={false}
                  variant="borderless"
                  className="p-0 font-medium text-sm flex items-center"
                />
              </div>
              <div className="w-px h-5 bg-gray-200 self-center"></div>
              <div className="flex items-center gap-2 px-2 h-full">
                <span className="text-[11px] text-gray-700">Sampai Tanggal</span>
                <DatePicker
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  format="DD MMM YYYY"
                  allowClear={false}
                  variant="borderless"
                  className="p-0 font-medium text-sm flex items-center"
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

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama bahan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[260px] pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-sfPro shadow-[0_2px_10px_rgba(0,0,0,0.02)] !outline-none !ring-0 focus:!border-gray-100"
            />
          </div>

          <Link
            href={route('admin.kelola-produk.create')}
            className="inline-flex items-center justify-center gap-2 bg-[#EF5350] hover:bg-[#E84949] text-white px-6 py-3 rounded-2xl text-sm font-medium transition-all active:scale-95 shadow-md"
          >
            <Plus size={18} />
            Tambah Barang
          </Link>
        </div>

        {/* Tabel */}
        <div className="bg-white rounded-[25px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Nama Produk</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Tanggal</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Harga</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Kategori</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-sfPro font-medium text-gray-800 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayData.length > 0 ? (
                  displayData.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-800 font-medium">{product.name}</td>
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-600">{dayjs(product.date).format('DD-MM-YYYY')}</td>
                      <td className="px-8 py-5 text-sm font-sfPro text-gray-900">{formatIDR(product.price)}</td>
                      <td className="px-8 py-5 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium capitalize text-[11px]">
                          <Tag size={12} /> {product.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sfPro uppercase tracking-wider ${
                            product.status === 'tersedia' ? 'bg-green-50 text-green-600' : 
                            product.status === 'menipis' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                          {product.status === 'tersedia' ? <CheckCircle2 size={12} /> : 
                           product.status === 'menipis' ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                          {product.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={route('admin.kelola-produk.show', product.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"><Eye size={18} /></Link>
                          <Link href={route('admin.kelola-produk.edit', product.id)} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all active:scale-95 shadow-sm"><Pencil size={18} /></Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center font-sfPro text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <FileText size={48} />
                        <p>Tidak ada riwayat pengeluaran untuk periode ini.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 pb-10">
          <p className="text-xs text-gray-500 font-sfPro">Menampilkan {from}–{to} dari {total.toLocaleString('id-ID')} data</p>
          <div className="flex gap-1.5 p-1.5 bg-white rounded-xl shadow-sm border border-gray-50">
            {products.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                as="button"
                disabled={!link.url}
                preserveScroll
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-sfPro transition-all ${
                    link.active ? 'bg-[#EF5350] text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  } ${!link.url ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <span dangerouslySetInnerHTML={{ __html: link.label.includes('Previous') ? '<' : link.label.includes('Next') ? '>' : link.label }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}