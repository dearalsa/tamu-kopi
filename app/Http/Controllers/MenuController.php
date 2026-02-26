<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class MenuController extends Controller
{
    /**
     * tampilan landing page
     */
    public function landing()
    {
        $now = Carbon::now();

        $menus = Menu::with(['category', 'packageItems.category'])
            ->where('is_available', true) 
            ->latest()
            ->get()
            ->map(function ($menu) use ($now) {
                
                $isPromoActive = true;

                if ($menu->promo_start_at && $now->lt(Carbon::parse($menu->promo_start_at))) {
                    $isPromoActive = false;
                }
                
                if ($menu->promo_end_at && $now->gt(Carbon::parse($menu->promo_end_at))) {
                    $isPromoActive = false;
                }

                return [
                    'id'               => $menu->id,
                    'name'             => $menu->name,
                    'price'            => (float) $menu->price,
                    'promo_price'      => ($isPromoActive && $menu->promo_price) ? (float) $menu->promo_price : null,
                    'image'            => $menu->image,
                    'category'         => $menu->category,
                    'is_available'     => (bool) $menu->is_available,
                    'is_best_seller'   => (bool) $menu->is_best_seller,
                    'is_package'       => (bool) $menu->is_package,
                    'promo_start_at'   => $menu->promo_start_at ? Carbon::parse($menu->promo_start_at)->format('Y-m-d H:i:s') : null,
                    'promo_end_at'     => $menu->promo_end_at ? Carbon::parse($menu->promo_end_at)->format('Y-m-d H:i:s') : null,
                    'package_items'    => $menu->package_items ?? $menu->packageItems,
                ];
            });

        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Home', [
            'menus'      => $menus,
            'categories' => $categories,
        ]);
    }

    public function index()
    {
        $menus = Menu::with('category')
            ->where('is_package', false)
            ->latest()
            ->paginate(20);

        $menus->getCollection()->transform(function ($menu) {
            return [
                'id'             => $menu->id,
                'name'           => $menu->name,
                'price'          => (float) $menu->price,
                'promo_price'    => $menu->promo_price ? (float) $menu->promo_price : null,
                'image'          => $menu->image,
                'category'       => $menu->category,
                'category_id'    => $menu->category_id,
                'is_available'   => (bool) $menu->is_available,
                'is_best_seller' => (bool) $menu->is_best_seller,
            ];
        });

        return Inertia::render('Admin/Kasir/Menu/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Admin/Kasir/Menu/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'price'          => 'required|numeric|min:0',
            'image'          => 'nullable|file|image|max:10240',
            'is_available'   => 'required|boolean',
            'is_best_seller' => 'required|boolean',
        ], [
            // Pesan
            'name.required'        => 'Nama menu wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'price.required'       => 'Harga wajib diisi.',
            'image.image'          => 'File harus berupa gambar.',
            'image.max'            => 'Ukuran gambar maksimal adalah 10 MB.',
        ]);

        $validated['slug']           = Str::slug($validated['name']);
        $validated['is_available']   = (bool) $validated['is_available'];
        $validated['is_best_seller'] = (bool) $validated['is_best_seller'];
        $validated['is_package']     = false;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menus', 'public');
        }

        Menu::create($validated);

        return redirect()->route('admin.kasir.menus.index')
            ->with('success', 'Menu berhasil ditambahkan!');
    }

    public function edit(Menu $menu)
    {
        $categories = Category::where('is_active', true)->orderBy('name')->get();

        $menu->load('category');
        $menu->image_url = $menu->image ? asset('storage/' . $menu->image) : null;

        return Inertia::render('Admin/Kasir/Menu/Edit', [
            'menu'       => $menu,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'price'          => 'required|numeric|min:0',
            'image'          => 'nullable|file|image|max:10240',
            'is_available'   => 'required|boolean',
            'is_best_seller' => 'required|boolean',
        ], [
            // Pesan 
            'name.required'        => 'Nama menu wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'price.required'       => 'Harga wajib diisi.',
            'image.image'          => 'File harus berupa gambar.',
            'image.max'            => 'Ukuran gambar maksimal adalah 10 MB.',
        ]);

        $validated['slug']           = Str::slug($validated['name']);
        $validated['is_available']   = (bool) $validated['is_available'];
        $validated['is_best_seller'] = (bool) $validated['is_best_seller'];

        if ($request->hasFile('image')) {
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $validated['image'] = $request->file('image')->store('menus', 'public');
        } else {
            unset($validated['image']);
        }

        $menu->update($validated);

        return redirect()->route('admin.kasir.menus.index')
            ->with('success', 'Menu berhasil diupdate!');
    }

    public function destroy(Menu $menu)
    {
        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }

        $menu->delete();

        return redirect()->route('admin.kasir.menus.index')
            ->with('success', 'Menu berhasil dihapus!');
    }
}