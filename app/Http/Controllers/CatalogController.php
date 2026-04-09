<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $now = Carbon::now();

        // Query menu dengan logika
        $menus = Menu::where('is_available', true)
            ->with('category:id,name')
            ->where(function ($query) use ($now) {
                $query->where('is_package', false)
                      ->orWhere(function ($q) use ($now) {
                          $q->where('is_package', true)
                            ->where(function($s) {
                                $s->whereNull('stock')->orWhere('stock', '>', 0);
                            })
                            ->where(function ($t) use ($now) {
                                $t->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', $now);
                            })
                            ->where(function ($t) use ($now) {
                                $t->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', $now);
                            });
                      });
            })
            ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                $query->where('category_id', $request->category);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('name')
            ->paginate(24)
            ->withQueryString();

        // Transformasi data untuk frontend
        $menus->getCollection()->transform(function ($menu) use ($now) {
            $price = (float) $menu->price;
            $promoPrice = $menu->promo_price ? (float) $menu->promo_price : null;
            $stock = $menu->stock; 
            $isOutOfStock = !is_null($stock) && $stock <= 0;

            $isPromoActive = false;
            // Harga promo hanya berlaku jika stok ada dan waktu sesuai
            if ($promoPrice > 0 && !$isOutOfStock) {
                $start = $menu->promo_start_at ? Carbon::parse($menu->promo_start_at) : null;
                $end = $menu->promo_end_at ? Carbon::parse($menu->promo_end_at) : null;
                $isPromoActive = true;
                if ($start && $now->lt($start)) $isPromoActive = false;
                if ($end && $now->gt($end)) $isPromoActive = false;
            }

            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'description' => $menu->description, 
                'price' => $price, 
                'promo_price' => $isPromoActive ? $promoPrice : null, 
                'image' => $menu->image, 
                'category' => $menu->category?->name,
                'category_id' => $menu->category_id,
                'stock' => $stock,
                'is_promo' => $isPromoActive,
                'is_out_of_stock' => $isOutOfStock, 
                'is_best_seller' => (bool) $menu->is_best_seller,
                'is_package' => (bool) $menu->is_package,
            ];
        });

        // -Query kategori untuk dropdown filter di katalog
        // Hanya ambil kategori yang sedang memiliki menu layak jual (sesuai logika di atas)
        $categories = Category::where('is_active', true)
            ->whereHas('menus', function($query) use ($now) {
                $query->where('is_available', true)
                      ->where(function ($q) use ($now) {
                          $q->where('is_package', false)
                            ->orWhere(function ($qp) use ($now) {
                                $qp->where('is_package', true)
                                   ->where(function($s) {
                                       $s->whereNull('stock')->orWhere('stock', '>', 0);
                                   })
                                   ->where(function($t) use ($now) {
                                       $t->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', $now);
                                   })
                                   ->where(function($t) use ($now) {
                                       $t->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', $now);
                                   });
                            });
                      });
            })
            ->orderBy('name')
            ->get()
            ->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ]);

        return Inertia::render('Admin/Kasir/Katalog/Index', [
            'menus' => $menus, 
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }
}