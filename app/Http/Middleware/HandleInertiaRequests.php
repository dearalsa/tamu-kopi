<?php

namespace App\Http\Middleware;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Carbon\Carbon;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    { 
        // Filter hanya ambil data bermasalah di bulan dan tahun ini saja
        $problematicProducts = Product::whereIn('status', ['habis', 'menipis'])
            ->whereMonth('date', Carbon::now()->month)
            ->whereYear('date', Carbon::now()->year)
            ->get();

        $habisItems = $problematicProducts->where('status', 'habis');
        $menipisItems = $problematicProducts->where('status', 'menipis');
        
        $notifMessage = null;
        $statusBahan = 'aman';

        if ($habisItems->count() > 0) {
            $statusBahan = 'habis';
            $notifMessage = ($habisItems->count() <= 3) 
                ? $habisItems->pluck('name')->implode(', ') . " habis" 
                : $habisItems->count() . " bahan habis";
        } 
        elseif ($menipisItems->count() > 0) {
            $statusBahan = 'menipis';
            $notifMessage = ($menipisItems->count() <= 3) 
                ? $menipisItems->pluck('name')->implode(', ') . " mulai menipis" 
                : $menipisItems->count() . " bahan menipis";
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user('admin') ?? $request->user(), 
            ],
            'notif' => [
                'message' => $notifMessage,
                'status'  => $statusBahan, 
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);
    }
}