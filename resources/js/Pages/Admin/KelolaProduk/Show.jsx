import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
  ArrowLeft,
  Calendar,
  Tag,
  CircleDollarSign,
  FileText,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

export default function Show({ product }) {
  const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace('Rp', 'Rp ');
  };

  return (
    <AdminLayout>
      <Head title={`Detail - ${product.name}`} />

      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 font-sfPro bg-gray-50/30 min-h-screen">
        <div className="mb-6 mt-4">
          <Link
            href={route('admin.kelola-produk.index')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#EF5350] transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-sfPro">Kembali</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-gray-100 p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[250px_minmax(0,1fr)] gap-8 items-start">
            {/* Foto / Proof */}
            <div className="w-full flex justify-center md:justify-start">
              <div className="w-full max-w-xs rounded-2xl bg-gray-100 border border-gray-100 overflow-hidden">
                <div className="aspect-[4/5] w-full">
                  {product.proof ? (
                    <img
                      src={product.proof}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <ImageIcon size={40} strokeWidth={1.4} />
                      <p className="text-[11px] mt-2 tracking-wide font-sfPro">
                        Tidak ada foto
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* detail */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h1 className="text-xl md:text-2xl font-sfPro text-gray-900 leading-snug">
                      {product.name}
                    </h1>

                    {/* nama admin yang menambahkan produk yang baru saja dibeli */}
                    <div className="flex items-center gap-1.5 text-gray-600 mt-1">
                      <User size={14} className="text-gray-400" />
                      <span className="text-[13px] font-sfPro">
                        Ditambahkan oleh:{' '}
                        <span className="font-sfPro text-gray-900">
                          {product.created_by_name || 'Tidak diketahui'}
                        </span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-sfPro uppercase tracking-widest ${
                      product.status === 'tersedia'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}
                  >
                    {product.status === 'tersedia' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {product.status}
                  </span>
                </div>

                <div>
                  <p className="text-[15px] font-telegraf text-gray-600 mb-1">
                    Nominal Harga:
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-lg md:text-xl font-sfPro text-[#EF5350]">
                    <CircleDollarSign size={16} />
                    {formatIDR(product.price)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                    <Tag size={16} />
                    <span className="text-[15px] font-telegraf text-gray-600">
                      Kategori
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 capitalize">
                    {product.category || '-'}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <div className="flex items-center gap-2 text-gray-400 mb-1.5">
                    <Calendar size={16} />
                    <span className="text-[15px] font-telegraf text-gray-600">
                      Tanggal
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    {dayjs(product.date).format('DD MMMM YYYY')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-900">
                  <FileText size={16} className="text-[#EF5350]" />
                  <h3 className="text-[15px] font-telegraf text-gray-600">
                    Keterangan
                  </h3>
                </div>
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4 max-h-48 overflow-auto font-sfPro">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description ||
                      'Tidak ada keterangan tambahan untuk produk ini.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
