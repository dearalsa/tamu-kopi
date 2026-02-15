<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        // ambil input tanggal atau default ke hari ini
        $start_date = $request->query('start_date') ?? Carbon::today()->toDateString();
        $end_date = $request->query('end_date') ?? Carbon::today()->toDateString();

        // query dasar untuk filter tanggal (untuk statistik dan tabel)
        $dateFilter = [$start_date . ' 00:00:00', $end_date . ' 23:59:59'];
        $baseQuery = Transaction::whereBetween('created_at', $dateFilter);

        // hitung statistik berdasarkan filter
        $total_income = (int) $baseQuery->sum('total');
        $total_orders = $baseQuery->count();
        
        // logika jam tersibuk
        $busy_hour_query = Transaction::whereBetween('created_at', $dateFilter)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();

        $busy_hours = $busy_hour_query 
            ? str_pad($busy_hour_query->hour, 2, '0', STR_PAD_LEFT) . ':00' 
            : '-';

        // ambil data transaksi untuk tabel (paginated)
        $transactions = Transaction::with(['user', 'items'])
            ->whereBetween('created_at', $dateFilter)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Kasir/Transaksi/Index', [
            'transactions' => $transactions,
            'stats' => [
                'total_income' => $total_income,
                'total_orders' => $total_orders,
                'busy_hours'   => $busy_hours,
            ],
            'filters' => [
                'start_date' => $start_date, 
                'end_date'   => $end_date
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subtotal'       => 'required|numeric',
            'discount'       => 'required|numeric',
            'total'          => 'required|numeric',
            'payment_method' => 'required|in:cash,qris',
            'order_type'     => 'required|in:dine-in,takeaway',
            'cart'           => 'required|array|min:1',
        ]);

        try {
            $transaction = DB::transaction(function () use ($request) {
                $invoice = 'TRX-' . now()->format('ymdHis') . rand(10, 99);
                $todayCount = Transaction::whereDate('created_at', Carbon::today())->count();
                $orderNumber = 'C' . str_pad($todayCount + 1, 3, '0', STR_PAD_LEFT);

                $newTransaction = Transaction::create([
                    'user_id'        => Auth::guard('admin')->id(), 
                    'invoice_number' => $invoice,
                    'queue_number'   => $orderNumber, 
                    'subtotal'       => $request->subtotal,
                    'discount'       => $request->discount,
                    'total'          => $request->total,
                    'payment_method' => $request->payment_method,
                    'cash_amount'    => $request->cash_amount ?? 0,
                    'change'         => $request->change ?? 0,
                    'order_type'     => $request->order_type,
                ]);

                foreach ($request->cart as $item) {
                    TransactionDetail::create([
                        'transaction_id' => $newTransaction->id,
                        'menu_name'      => $item['name'],
                        'price'          => $item['price'],
                        'quantity'       => $item['quantity'],
                    ]);
                }

                return $newTransaction;
            });

            return redirect()->back()->with('success_transaction', [
                'invoice_number' => $transaction->invoice_number,
                'queue_number'   => $transaction->queue_number,
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }
}