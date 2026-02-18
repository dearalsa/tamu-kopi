<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Product;
use Carbon\Carbon;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        // Menggunakan guard admin
        $admin = Auth::guard('admin')->user();

        // Statistik Total
        $totalIncome  = (float) Transaction::sum('total');
        $totalExpense = (float) Product::sum('price');

        // Logika Status Bahan
        $products    = Product::all();
        $statusBahan = 'aman';

        if ($products->isEmpty()) {
            $statusBahan = 'habis';
        } elseif ($products->where('status', 'habis')->isNotEmpty()) {
            $statusBahan = 'warning';
        } elseif ($products->where('status', 'tersedia')->isEmpty()) {
            $statusBahan = 'habis';
        }

        // Setup Waktu
        $today      = Carbon::today()->toDateString();
        $weekStart  = Carbon::now()->startOfWeek()->toDateString();
        $monthStart = Carbon::now()->startOfMonth()->toDateString();

        // Statistik Penjualan (Pemasukan)
        $incomeDaily   = (float) Transaction::whereDate('created_at', $today)->sum('total');
        $incomeWeekly  = (float) Transaction::whereBetween('created_at', [$weekStart . ' 00:00:00', $today . ' 23:59:59'])->sum('total');
        $incomeMonthly = (float) Transaction::whereBetween('created_at', [$monthStart . ' 00:00:00', $today . ' 23:59:59'])->sum('total');

        // Statistik Belanja Bahan (Pengeluaran)
        $expenseDaily   = (float) Product::whereDate('date', $today)->sum('price');
        $expenseWeekly  = (float) Product::whereBetween('date', [$weekStart, $today])->sum('price');
        $expenseMonthly = (float) Product::whereBetween('date', [$monthStart, $today])->sum('price');

        // Grafik Bulanan (12 bulan terakhir)
        $grafikBulanan = collect(range(11, 0))->map(function ($i) {
            $bulan = Carbon::now()->subMonths($i);
            return [
                'name'        => $bulan->translatedFormat('F'),
                'pemasukan'   => (float) Transaction::whereYear('created_at', $bulan->year)
                                    ->whereMonth('created_at', $bulan->month)
                                    ->sum('total'),
                'pengeluaran' => (float) Product::whereYear('date', $bulan->year)
                                    ->whereMonth('date', $bulan->month)
                                    ->sum('price'),
            ];
        })->values();

        // Grafik Mingguan (7 hari terakhir)
        $grafikMingguan = collect(range(6, 0))->map(function ($i) {
            $hari = Carbon::today()->subDays($i);
            return [
                'name'        => $hari->translatedFormat('D, d M'),
                'pemasukan'   => (float) Transaction::whereDate('created_at', $hari)->sum('total'),
                'pengeluaran' => (float) Product::whereDate('date', $hari)->sum('price'),
            ];
        })->values();

        // Grafik Harian (24 jam hari ini)
        $grafikHarian = collect(range(0, 23))->map(function ($jam) use ($today) {
            return [
                'name'        => str_pad($jam, 2, '0', STR_PAD_LEFT) . ':00',
                'pemasukan'   => (float) Transaction::whereDate('created_at', $today)
                                    ->whereRaw('HOUR(created_at) = ?', [$jam])
                                    ->sum('total'),
                'pengeluaran' => (float) Product::whereDate('date', $today)
                                    ->whereRaw('HOUR(date) = ?', [$jam]) // Pastikan field 'date' di model Product memiliki jam jika ingin detail per jam
                                    ->sum('price'),
            ];
        })->values();

        return Inertia::render('Admin/Dashboard', [
            'adminName'      => $admin->name,
            'adminRole'      => $admin->role,
            'totalIncome'    => $totalIncome,
            'totalExpense'   => $totalExpense,
            'statusBahan'    => $statusBahan,
            'incomeDaily'    => $incomeDaily,
            'incomeWeekly'   => $incomeWeekly,
            'incomeMonthly'  => $incomeMonthly,
            'expenseDaily'   => $expenseDaily,
            'expenseWeekly'  => $expenseWeekly,
            'expenseMonthly' => $expenseMonthly,
            'grafikBulanan'  => $grafikBulanan,
            'grafikMingguan' => $grafikMingguan,
            'grafikHarian'   => $grafikHarian,
        ]);
    }
}