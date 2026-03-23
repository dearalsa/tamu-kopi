<?php

namespace App\Http\Middleware;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Carbon\Carbon;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $now = Carbon::now();

        // Ambil data produk untuk periode bulan ini
        $allProducts = Product::whereMonth('date', $now->month)
            ->whereYear('date', $now->year)
            ->get();

        // Filter produk berdasarkan status untuk isi dropdown pesan
        $habisProducts = $allProducts->where('status', 'habis');
        $menipisProducts = $allProducts->where('status', 'menipis');
        
        // Hitung jumlah bahan yang statusnya masih 'tersedia'
        $tersediaCount = $allProducts->where('status', 'tersedia')->count();
        $habisCount = $habisProducts->count();
        $menipisCount = $menipisProducts->count();

        $messages = [];

        // Logika Pesan Notifikasi Habis
        if ($habisCount > 0) {
            if ($habisCount <= 4) {
                foreach ($habisProducts as $product) {
                    $messages[] = "🚨 {$product->name} habis";
                }
            } else {
                $messages[] = "🚨 {$habisCount} bahan habis";
            }
        }

        // Logika Pesan Notifikasi Menipis
        if ($menipisCount > 0) {
            if ($menipisCount <= 4) {
                foreach ($menipisProducts as $product) {
                    $messages[] = "⚠️ {$product->name} menipis";
                }
            } else {
                $messages[] = "⚠️ {$menipisCount} bahan menipis";
            }
        }
        
        // Logika Status Notifikasi
        $status = 'tersedia';

        if ($habisCount > 0) {
            // Jika ada satu saja yang habis, lonceng langsung merah (habis)
            $status = 'habis';
        } elseif ($tersediaCount < 5 && $allProducts->count() > 0) {
            // Jika bahan yang 'tersedia' jumlahnya sudah kurang dari 5, lonceng jadi kuning (menipis)
            $status = 'menipis';
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user('admin') ?? $request->user(),
            ],

            'notif' => [
                'status'   => $status,
                'messages' => $messages,
                'total'    => $habisCount + $menipisCount
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'success_transaction' => fn () => $request->session()->get('success_transaction'),
            ],
        ]);
    }
}