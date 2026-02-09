<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $menus = Menu::with('category', 'packageItems')
            ->where('is_available', true)
            ->latest()
            ->get()
            ->map(function ($menu) {
                $isPromo = false;

                if ($menu->promo_start_at && $menu->promo_end_at) {
                    $now = now();

                    if ($now->between($menu->promo_start_at, $menu->promo_end_at)) {
                        $isPromo = true;
                    }
                }

                return [
                    'id' => $menu->id,
                    'name' => $menu->name,
                    'price' => $menu->price,
                    'image' => $menu->image ? asset('storage/' . $menu->image) : null,
                    'category' => $menu->category ? $menu->category->name : null,
                    'category_id' => $menu->category_id,
                    'is_promo' => $isPromo,
                    'is_best_seller' => $menu->is_best_seller,
                    'is_package' => $menu->is_package,
                    'promo_start_at' => $menu->promo_start_at,
                    'promo_end_at' => $menu->promo_end_at,
                ];
            });

        $categories = Category::where('is_active', true)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                ];
            });

        return Inertia::render('Admin/Kasir/Katalog/Index', [
            'menus' => $menus,
            'categories' => $categories,
        ]);
    }
}
