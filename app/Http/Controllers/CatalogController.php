<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        // Ambil semua menu yang available
        // Kita ambil promo_price langsung dari DB
        $allMenus = Menu::where('is_available', true)
            ->with('category:id,name')
            ->orderBy('name')
            ->get()
            ->map(function ($menu) {
                // Pastikan tipe data float agar perhitungan di JS aman
                $price = (float) $menu->price;
                $promoPrice = (float) $menu->promo_price;
                
                // Cek apakah ada promo aktif (harga promo harus > 0 dan < harga asli)
                $isPromoActive = ($promoPrice > 0 && $promoPrice < $price);
                
                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'price' => $price,
                    // Kirim harga promo HANYA jika valid
                    'promo_price' => $isPromoActive ? $promoPrice : null,
                    'image' => $menu->image ? asset('storage/' . $menu->image) : null,
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