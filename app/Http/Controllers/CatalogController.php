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
        $menus = Menu::where('is_available', true)
            ->with('category:id,name')
            // Jika ingin filter server-side (opsional tapi disarankan untuk pagination):
            ->when($request->category && $request->category !== 'all', function ($query) use ($request) {
                $query->where('category_id', $request->category);
            })
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        // Transformasi data di dalam collection pagination
        $menus->getCollection()->transform(function ($menu) use ($now) {
            $price = (float) $menu->price;
            $promoPrice = $menu->promo_price ? (float) $menu->promo_price : null;

            $isPromoActive = false;
            if ($promoPrice > 0) {
                $isPromoActive = true;
                if ($menu->promo_start_at && $now->lt(Carbon::parse($menu->promo_start_at))) {
                    $isPromoActive = false;
                }
                if ($menu->promo_end_at && $now->gt(Carbon::parse($menu->promo_end_at))) {
                    $isPromoActive = false;
                }
            }

            return [
                'id' => $menu->id,
                'name' => $menu->name,
                'price' => $price,
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
            'menus' => $menus, 
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }
}