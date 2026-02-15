<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class MenuPromoController extends Controller
{
    protected function generateSlugForPromo(string $name): string
    {
        return Str::slug($name . '-' . Str::random(5));
    }

    public function index()
    {
        $menus = Menu::with('category')
            ->where(function($query) {
                $query->where('is_package', true)
                      ->orWhereNotNull('promo_price');
            })
            ->latest()
            ->get()
            ->map(function ($menu) {
                return [
                    'id'               => $menu->id,
                    'name'             => $menu->name,
                    'category'         => $menu->category,
                    'price'            => (float) $menu->price,
                    'promo_price'      => $menu->promo_price ? (float) $menu->promo_price : null,
                    'is_available'     => (bool) $menu->is_available,
                    'is_package'       => (bool) $menu->is_package,
                    'image'            => $menu->image,
                    'promo_start_at'   => $menu->promo_start_at ? $menu->promo_start_at->toIso8601String() : null, 
                    'promo_end_at'     => $menu->promo_end_at ? $menu->promo_end_at->toIso8601String() : null,
                ];
            });

        return Inertia::render('Admin/Kasir/Promo/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();
        $allMenus = Menu::where('is_package', false)->where('is_available', true)->get();

        return Inertia::render('Admin/Kasir/Promo/Create', [
            'categories' => $categories,
            'allMenus'   => $allMenus,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'nullable|string|max:255',
            'category_id'      => 'nullable|exists:categories,id',
            'price'            => 'required|numeric|min:0',
            'package_items'    => 'required|array|min:1',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable',
            'image'            => 'nullable|file|image|max:2048',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time']) 
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_start_date'] . ' ' . $validated['promo_start_time']) 
            : null;
            
        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time']) 
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_end_date'] . ' ' . $validated['promo_end_time']) 
            : null;

        $isPackageMode = count($validated['package_items']) > 1 || !empty($validated['name']);

        if (!$isPackageMode) {
            $targetMenuId = $validated['package_items'][0];
            $menu = Menu::findOrFail($targetMenuId);
            $menu->update([
                'promo_price'    => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
            ]);
            return redirect()->route('admin.kasir.promo.index')->with('success', 'Promo Satuan berhasil dibuat!');
        } else {
            if (empty($validated['name'])) return back()->withErrors(['name' => 'Nama Paket wajib diisi.']);
            if (empty($validated['category_id'])) return back()->withErrors(['category_id' => 'Kategori wajib dipilih.']);

            $imagePath = $request->hasFile('image') ? $request->file('image')->store('menus', 'public') : null;

            $package = Menu::create([
                'name'           => $validated['name'],
                'slug'           => $this->generateSlugForPromo($validated['name']),
                'category_id'    => $validated['category_id'],
                'price'          => $validated['price'],
                'image'          => $imagePath,
                'is_available'   => true,
                'is_package'     => true,
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
            ]);

            $package->packageItems()->sync($validated['package_items']);
            return redirect()->route('admin.kasir.promo.index')->with('success', 'Paket Bundling berhasil dibuat!');
        }
    }

    public function edit($id)
    {
        $menu = Menu::with(['packageItems', 'category'])->findOrFail($id);
        $categories = Category::where('is_active', true)->get();
        $allMenus = Menu::where('is_package', false)->where('is_available', true)->get();

        $promoData = [
            'id'               => $menu->id,
            'name'             => $menu->name,
            'category_id'      => $menu->category_id,
            'is_available'     => (bool) $menu->is_available,
            'is_package'       => (bool) $menu->is_package,
            'image_url'        => $menu->image ? asset('storage/' . $menu->image) : null,
            'price'            => $menu->is_package ? (float)$menu->price : (float)$menu->promo_price,
            'package_items'    => $menu->is_package ? $menu->packageItems->pluck('id') : [$menu->id],
            'promo_start_date' => $menu->promo_start_at ? $menu->promo_start_at->format('Y-m-d') : '',
            'promo_start_time' => $menu->promo_start_at ? $menu->promo_start_at->format('H:i') : '',
            'promo_end_date'   => $menu->promo_end_at ? $menu->promo_end_at->format('Y-m-d') : '',
            'promo_end_time'   => $menu->promo_end_at ? $menu->promo_end_at->format('H:i') : '',
        ];

        return Inertia::render('Admin/Kasir/Promo/Edit', [
            'promo'      => $promoData,
            'categories' => $categories,
            'allMenus'   => $allMenus,
        ]);
    }

    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $validated = $request->validate([
            'price'            => 'required|numeric|min:0',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time']) 
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_start_date'] . ' ' . $validated['promo_start_time']) 
            : null;
            
        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time']) 
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_end_date'] . ' ' . $validated['promo_end_time']) 
            : null;

        $menu->update([
            'promo_price'    => $validated['price'],
            'promo_start_at' => $promoStartAt,
            'promo_end_at'   => $promoEndAt,
        ]);

        return redirect()->route('admin.kasir.promo.index')->with('success', 'Promo berhasil diperbarui!');
    }

    public function toggle($id)
    {
        $menu = Menu::findOrFail($id);
        $now = Carbon::now();
        $isExpired = $menu->promo_end_at && $menu->promo_end_at->isPast();
        $isPromoActive = $menu->promo_price && !$isExpired;

        if ($isPromoActive) {
            $menu->update(['promo_end_at' => $now->subMinute()]);
        } else {
            $menu->update([
                'promo_start_at' => $now,
                'promo_end_at'   => $now->copy()->addDay()
            ]);
        }
        return back();
    }

    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        if ($menu->is_package) {
            if ($menu->image) Storage::disk('public')->delete($menu->image);
            $menu->delete();
        } else {
            $menu->update(['promo_price' => null, 'promo_start_at' => null, 'promo_end_at' => null]);
        }
        return redirect()->route('admin.kasir.promo.index');
    }
}