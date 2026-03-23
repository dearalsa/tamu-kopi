<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $start_date = $request->query('start_date') ?? Carbon::today()->toDateString();
        $end_date   = $request->query('end_date')   ?? Carbon::today()->toDateString();

        $dateFilter = [$start_date . ' 00:00:00', $end_date . ' 23:59:59'];
        $baseQuery  = Transaction::whereBetween('created_at', $dateFilter);

        $total_income = (int) $baseQuery->sum('total');
        $total_orders = $baseQuery->count();

        $busy_hour_query = Transaction::whereBetween('created_at', $dateFilter)
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('count(*) as count'))
            ->groupBy('hour')
            ->orderBy('count', 'desc')
            ->first();

        $busy_hours = $busy_hour_query
            ? str_pad($busy_hour_query->hour, 2, '0', STR_PAD_LEFT) . ':00'
            : '-';

        $transactions = Transaction::with(['items'])
            ->whereBetween('created_at', $dateFilter)
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($trx) => [
                'id'             => $trx->id,
                'invoice_number' => $trx->invoice_number,
                'queue_number'   => $trx->queue_number,
                'subtotal'       => $trx->subtotal,
                'discount'       => $trx->discount,
                'total'          => $trx->total,
                'payment_method' => $trx->payment_method,
                'cash_amount'    => $trx->cash_amount,
                'change'         => $trx->change,
                'order_type'     => $trx->order_type,
                'created_at'     => $trx->created_at,
                'cashier_name'   => $trx->cashier_name,
                'items'          => $trx->items->map(fn ($item) => [
                    'menu_name'   => $item->menu_name,
                    'price'       => $item->price,
                    'quantity'    => $item->quantity,
                    'description' => $item->description,
                ]),
            ]);

        return Inertia::render('Admin/Kasir/Transaksi/Index', [
            'transactions' => $transactions,
            'stats' => [
                'total_income' => $total_income,
                'total_orders' => $total_orders,
                'busy_hours'   => $busy_hours,
            ],
            'filters' => [
                'start_date' => $start_date,
                'end_date'   => $end_date,
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
            'cart.*.menu_id' => 'required|exists:menus,id',
        ]);

        try {
            $transaction = DB::transaction(function () use ($request) {
                $invoice     = 'TRX-' . now()->format('ymdHis') . rand(10, 99);
                $todayCount  = Transaction::whereDate('created_at', Carbon::today())->count();
                $orderNumber = 'C' . str_pad($todayCount + 1, 3, '0', STR_PAD_LEFT);

                $admin = Auth::guard('admin')->user();

                $newTransaction = Transaction::create([
                    'user_id'        => $admin?->id,
                    'cashier_name'   => $admin?->name,
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
                        'description'    => $item['note'] ?? null,
                    ]);

                    $menu = Menu::find($item['menu_id']);
                    if ($menu && !is_null($menu->stock)) {
                        $menu->decrement('stock', $item['quantity']);
                    }
                }

                return $newTransaction->load('items');
            });

            // Data untuk struk (dipakai di React)
            $flashData = [
                'invoice_number' => $transaction->invoice_number,
                'queue_number'   => $transaction->queue_number,
                'subtotal'       => $transaction->subtotal,
                'discount'       => $transaction->discount,
                'total'          => $transaction->total,
                'payment_method' => $transaction->payment_method,
                'cash_amount'    => $transaction->cash_amount,
                'change'         => $transaction->change,
                'order_type'     => $transaction->order_type,
                'created_at'     => $transaction->created_at,
                'cashier_name'   => $transaction->cashier_name,
                'items'          => $transaction->items->map(fn ($item) => [
                    'menu_name'   => $item->menu_name,
                    'price'       => $item->price,
                    'quantity'    => $item->quantity,
                    'description' => $item->description,
                ])->toArray(),
            ];

            // Redirect ke halaman katalog kasir yang benar
            return redirect()
                ->route('admin.kasir.katalog.index')
                ->with('success_transaction', $flashData);

        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal: ' . $e->getMessage()]);
        }
    }
}
