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

        // Filter produk berdasarkan status asli dari database
        $habisProducts = $allProducts->where('status', 'habis');
        $menipisProducts = $allProducts->where('status', 'menipis');
        
        $habisCount = $habisProducts->count();
        $menipisCount = $menipisProducts->count();
        $totalBermasalah = $habisCount + $menipisCount;

        $messages = [];

        // Susun Pesan Notifikasi (🚨 Habis)
        if ($habisCount > 0) {
            if ($habisCount <= 4) {
                foreach ($habisProducts as $product) {
                    $messages[] = "{$product->name} habis";
                }
            } else {
                $messages[] = "{$habisCount} bahan habis";
            }
        }

        // Susun Pesan Notifikasi (⚠️ Menipis)
        if ($menipisCount > 0) {
            if ($menipisCount <= 4) {
                foreach ($menipisProducts as $product) {
                    $messages[] = "{$product->name} menipis";
                }
            } else {
                $messages[] = "{$menipisCount} bahan menipis";
            }
        }
        
        // Default awal adalah 'aman' atau 'tersedia'
        $status = 'aman';

        if ($habisCount > 0) {
            // Jika ada yang habis, status jadi 'habis' (prioritas tertinggi)
            $status = 'habis';
        } elseif ($menipisCount > 0) {
            // Jika tidak ada yang habis, tapi ada yang menipis, status jadi 'menipis'
            $status = 'menipis';
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user('admin') ?? $request->user(),
            ],

            'notif' => [
                'status'   => $status, // Status sekarang akurat sesuai kondisi bahan
                'messages' => $messages,
                'total'    => $totalBermasalah
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'success_transaction' => fn () => $request->session()->get('success_transaction'),
            ],
        ]);
    }
}