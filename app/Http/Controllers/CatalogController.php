<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use Inertia\Inertia;
use Carbon\Carbon;

class CatalogController extends Controller
{
    public function index()
    {
        $now = Carbon::now(); // ambil waktu server saat ini

        $allMenus = Menu::where('is_available', true)
            ->with('category:id,name')
            ->orderBy('name')
            ->get()
            ->map(function ($menu) use ($now) {
                $price = (float) $menu->price;
                $promoPrice = $menu->promo_price ? (float) $menu->promo_price : null;

                // logika promo aktif atau tidak
                $isPromoActive = false;

                if ($promoPrice > 0) {
                    $isPromoActive = true;

                    // cek jika sekarang belum masuk waktu mulai promo
                    if ($menu->promo_start_at && $now->lt(Carbon::parse($menu->promo_start_at))) {
                        $isPromoActive = false;
                    }
                    
                    // cek jika sekarang sudah melewati waktu berakhir promo
                    if ($menu->promo_end_at && $now->gt(Carbon::parse($menu->promo_end_at))) {
                        $isPromoActive = false;
                    }
                }

                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'price' => $price,
                    // kalau promo tidak aktif, kembalikan null
                    'promo_price' => $isPromoActive ? $promoPrice : null,
                    'image' => $menu->image, 
                    'category' => $menu->category?->name,
                    'category_id' => $menu->category_id,
                    'is_promo' => $isPromoActive,
                    'is_best_seller' => (bool) $menu->is_best_seller,
                    'is_package' => (bool) $menu->is_package,
                ];
            });
        
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]);
        
        return Inertia::render('Admin/Kasir/Katalog/Index', [
            'menus' => $allMenus,
            'categories' => $categories,
        ]);
    }
}