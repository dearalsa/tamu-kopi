import { useState, useEffect } from 'react'; 
import AdminLayout from '@/Layouts/AdminLayout';
import { usePage, Link } from '@inertiajs/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    TrendingUp,
    TrendingDown,
    ShieldCheck,
    AlertTriangle,
    XCircle,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Dashboard({
    totalIncome = 0,
    totalExpense = 0,
    statusBahan = 'aman',
    incomeDaily = 0,
    incomeWeekly = 0,
    incomeMonthly = 0,
    expenseDaily = 0,
    expenseWeekly = 0,
    expenseMonthly = 0,
    grafikBulanan = [],
    grafikMingguan = [],
    grafikHarian = [],
}) {
    const { auth } = usePage().props;
    const [periode, setPeriode] = useState('Bulanan');

    // Efek notifikasi muncul setiap kali komponen Dashboard dimount (masuk halaman/refresh)
    useEffect(() => {
        if (statusBahan === 'warning') {
            toast.warning('PERINGATAN: Bahan hampir habis!', {
                toastId: 'warn-once', // Mencegah duplikasi jika status tidak berubah
                position: "top-right",
                autoClose: 5000,
                theme: "light",
            });
        } else if (statusBahan === 'habis') {
            toast.error('DARURAT: Bahan sudah habis!', {
                toastId: 'err-once', // Mencegah duplikasi
                position: "top-right",
                autoClose: 5000,
                theme: "colored",
            });
        }
    }, []); 

    const formattedDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date());

    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);

    const formatShort = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
        return value;
    };

    const statusConfig = {
        aman:    { color: 'bg-emerald-50 text-emerald-500', icon: <ShieldCheck size={26} />, label: 'Aman' },
        warning: { color: 'bg-yellow-50 text-yellow-500',   icon: <AlertTriangle size={26} />, label: 'Waspada' },
        habis:   { color: 'bg-rose-50 text-rose-500',       icon: <XCircle size={26} />,       label: 'Habis' },
    };
    const currentStatus = statusConfig[statusBahan] || statusConfig.aman;

    const dataGrafik = periode === 'Bulanan' ? grafikBulanan : periode === 'Mingguan' ? grafikMingguan : grafikHarian;
    const summaryIncome = periode === 'Bulanan' ? incomeMonthly : periode === 'Mingguan' ? incomeWeekly : incomeDaily;
    const summaryExpense = periode === 'Bulanan' ? expenseMonthly : periode === 'Mingguan' ? expenseWeekly : expenseDaily;
    const periodeLabel = periode === 'Bulanan' ? 'Bulan ini' : periode === 'Mingguan' ? 'Minggu ini' : 'Hari ini';

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-2xl shadow-lg p-4 text-sm border border-gray-100">
                    <p className="font-sfPro text-slate-700 mb-2 font-normal">{label}</p>
                    {payload.map((p, i) => (
                        <p key={i} style={{ color: p.color }} className="font-sfPro font-normal">
                            {p.name}: {formatRupiah(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout>
            <ToastContainer limit={1} />

            <style>{`
                @keyframes wave { 0% { transform: rotate(0deg); } 10% { transform: rotate(14deg); } 20% { transform: rotate(-8deg); } 30% { transform: rotate(14deg); } 40% { transform: rotate(-4deg); } 50% { transform: rotate(10deg); } 60% { transform: rotate(0deg); } 100% { transform: rotate(0deg); } }
                @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                .wave-emoji { display: inline-block; animation: wave 2s ease-in-out infinite; transform-origin: 70% 70%; }
                .fade-down { animation: fadeSlideDown 0.5s ease both; }
                .fade-up { animation: fadeSlideUp 0.6s ease both; }
                .card-animate { animation: fadeSlideUp 0.5s ease both; }
                .card-animate:nth-child(1) { animation-delay: 0.1s; }
                .card-animate:nth-child(2) { animation-delay: 0.2s; }
                .card-animate:nth-child(3) { animation-delay: 0.3s; }
            `}</style>

            <div className="px-2 md:px-0">
                <div className="flex items-center h-16 mb-4 fade-down font-sfPro">
                    <div className="-mt-2">
                        <h1 className="text-2xl text-gray-900 font-sfPro tracking-tight flex items-baseline gap-2">
                            Hello, {auth.user.name}
                            <span className="wave-emoji text-2xl">👋🏻</span>
                        </h1>
                        <p className="text-sm text-gray-400 capitalize font-sfPro mt-1">
                            {formattedDate}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card-animate bg-white p-6 rounded-[24px] shadow-[0_4px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-shadow duration-300 ease-out flex items-center gap-5">
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrendingUp size={26} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Total Pemasukan</p>
                            <h3 className="text-2xl font-sfPro text-slate-800 mt-0.5">{formatRupiah(summaryIncome)}</h3>
                            <p className="text-[11px] text-slate-400 mt-1">{periodeLabel}</p>
                        </div>
                    </div>

                    <div className="card-animate bg-white p-6 rounded-[24px] shadow-[0_4px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30_rgba(15,23,42,0.06)] transition-shadow duration-300 ease-out flex items-center gap-5">
                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <TrendingDown size={26} />
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Total Pengeluaran</p>
                            <h3 className="text-2xl font-sfPro text-slate-800 mt-0.5">{formatRupiah(summaryExpense)}</h3>
                            <p className="text-[11px] text-slate-400 mt-1">{periodeLabel}</p>
                        </div>
                    </div>

                    <div className="card-animate bg-white p-6 rounded-[24px] shadow-[0_4px_14px_rgba(15,23,42,0.03)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-shadow duration-300 ease-out flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${currentStatus.color}`}>
                            {currentStatus.icon}
                        </div>
                        <div>
                            <p className="text-[11px] text-gray-600 uppercase tracking-[0.10em]">Status Bahan</p>
                            <h3 className="text-2xl font-sfPro text-slate-800 mt-0.5">{currentStatus.label}</h3>
                            <Link
                                href={route('admin.kelola-produk.index')}
                                className="inline-flex items-center gap-1 text-[11px] font-sfPro text-slate-500 hover:text-red-600 mt-1 transition-colors duration-200 ease-out"
                            >
                                Cek Bahan <FontAwesomeIcon icon={faArrowRight} className="ml-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="fade-up bg-white p-8 rounded-[32px] shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-sfPro text-slate-800">Grafik Keuangan</h2>
                            <div className="flex flex-wrap gap-4 mt-1">
                                <p className="text-[12px] font-sfPro text-slate-500">
                                    Periode: <span className="font-medium text-slate-500">{periodeLabel}</span>
                                </p>
                            </div>
                        </div>
                        <select
                            value={periode}
                            onChange={(e) => setPeriode(e.target.value)}
                            className="min-w-[190px] text-sm rounded-2xl px-5 py-2.5 border border-slate-900 bg-white text-slate-800 cursor-pointer font-sfPro transition-all duration-200 ease-out outline-none focus:outline-none focus:ring-0 focus:border-gray-500"
                        >
                            <option>Harian</option>
                            <option>Mingguan</option>
                            <option>Bulanan</option>
                        </select>
                    </div>

                    <div className="h-[380px] w-full font-sfPro">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dataGrafik} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#686e77', fontSize: 11, fontFamily: 'SF Pro, sans-serif', fontWeight: 400 }} 
                                    dy={10} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#686e77', fontSize: 11, fontFamily: 'SF Pro, sans-serif', fontWeight: 400 }} 
                                    tickFormatter={formatShort} 
                                    width={45} 
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPemasukan)" dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: '#10b981' }} activeDot={{ r: 5 }} />
                                <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPengeluaran)" dot={{ r: 3, fill: '#fff', strokeWidth: 2, stroke: '#f43f5e' }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-xs font-sfPro text-slate-500">Pemasukan</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-xs font-sfPro text-slate-500">Pengeluaran</span>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}