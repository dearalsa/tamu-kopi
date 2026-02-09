<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    // Generate invoice number
    private function generateInvoiceNumber()
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $lastTransaction = Transaction::whereDate('created_at', today())
            ->orderBy('id', 'desc')
            ->first();
        
        $number = $lastTransaction ? (int)substr($lastTransaction->invoice_number, -4) + 1 : 1;
        
        return $prefix . $date . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public function index()
    {
        $transactions = Transaction::with(['admin', 'items.menu'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
        ]);
    }

    // Store transaksi CASH
    public function storeCash(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:menus,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'cash_amount' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $changeAmount = $validated['cash_amount'] - $validated['total'];

            if ($changeAmount < 0) {
                return back()->withErrors(['cash_amount' => 'Uang tidak cukup!']);
            }

            $transaction = Transaction::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'admin_id' => Auth::guard('admin')->id(),
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'],
                'discount' => $validated['discount'],
                'total' => $validated['total'],
                'payment_method' => 'cash',
                'payment_status' => 'paid',
                'cash_amount' => $validated['cash_amount'],
                'change_amount' => $changeAmount,
                'paid_at' => now(),
            ]);

            foreach ($validated['cart'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'menu_id' => $item['id'],
                    'menu_name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            DB::commit();

            return redirect()->route('admin.transactions.index')
                ->with('success', 'Transaksi berhasil! Kembalian: Rp ' . number_format($changeAmount, 0, ',', '.'));
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    // Store transaksi QRIS (generate QRIS dinamis)
    public function storeQris(Request $request)
    {
        $validated = $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.id' => 'required|exists:menus,id',
            'cart.*.quantity' => 'required|integer|min:1',
            'cart.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'discount' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $transaction = Transaction::create([
                'invoice_number' => $this->generateInvoiceNumber(),
                'admin_id' => Auth::guard('admin')->id(),
                'subtotal' => $validated['subtotal'],
                'tax' => $validated['tax'],
                'discount' => $validated['discount'],
                'total' => $validated['total'],
                'payment_method' => 'qris',
                'payment_status' => 'pending',
                'qris_expired_at' => now()->addMinutes(5), // QRIS expired 5 menit
            ]);

            foreach ($validated['cart'] as $item) {
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'menu_id' => $item['id'],
                    'menu_name' => $item['name'],
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            // TODO: Integrate dengan Payment Gateway untuk generate QRIS
            // Contoh: Midtrans, Xendit, DOKU, dll
            // $qrisData = $this->generateQRISFromGateway($transaction);

            // Sementara pakai dummy data
            $transaction->update([
                'qris_code' => 'QRIS-' . $transaction->invoice_number,
                // 'qris_image' => $qrisData['image_url'], // dari payment gateway
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'transaction' => $transaction->load('items'),
                'message' => 'QRIS berhasil di-generate. Silakan scan untuk membayar.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    // Webhook dari payment gateway untuk update status
    public function webhookPayment(Request $request)
    {
        // TODO: Verify webhook signature dari payment gateway
        
        $paymentGatewayId = $request->input('order_id'); // sesuaikan dengan gateway
        $status = $request->input('transaction_status'); // sesuaikan

        $transaction = Transaction::where('payment_gateway_id', $paymentGatewayId)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        if ($status === 'settlement' || $status === 'capture') {
            $transaction->update([
                'payment_status' => 'paid',
                'paid_at' => now(),
            ]);
        } elseif ($status === 'pending') {
            $transaction->update([
                'payment_status' => 'pending',
            ]);
        } else {
            $transaction->update([
                'payment_status' => 'failed',
            ]);
        }

        return response()->json(['message' => 'Webhook processed']);
    }
}