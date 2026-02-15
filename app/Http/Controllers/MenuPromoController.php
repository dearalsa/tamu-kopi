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
    protected function updateExpiredPromos()
    {
        $now = Carbon::now();

        Menu::whereNotNull('promo_end_at')
            ->where('promo_end_at', '<', $now)
            ->whereNotNull('promo_price')
            ->update([
                'promo_price'    => null,
                'promo_start_at' => null,
                'promo_end_at'   => null,
            ]);
    }

    public function index(Request $request)
    {
        $now = Carbon::now();

        $perPage = 20;
        $menus = Menu::with('category')
            ->where(function ($query) {
                $query->where('is_package', true)
                      ->orWhereNotNull('promo_price');
            })
            ->latest()
            ->paginate($perPage)
            ->through(function ($menu) use ($now) {
                $isPromoActive = false;

                if ($menu->promo_price && $menu->promo_start_at && $menu->promo_end_at) {
                    $isPromoActive = $now->between(
                        Carbon::parse($menu->promo_start_at),
                        Carbon::parse($menu->promo_end_at)
                    );
                }

                if ($menu->is_package && $menu->promo_start_at && $menu->promo_end_at) {
                    $isPromoActive = $now->between(
                        Carbon::parse($menu->promo_start_at),
                        Carbon::parse($menu->promo_end_at)
                    );
                }

                return [
                    'id'              => $menu->id,
                    'name'            => $menu->name,
                    'category'        => $menu->category,
                    'price'           => (float) $menu->price,
                    'promo_price'     => $menu->promo_price ? (float) $menu->promo_price : null,
                    'is_available'    => (bool) $menu->is_available,
                    'is_package'      => (bool) $menu->is_package,
                    'image'           => $menu->image,
                    'promo_start_at'  => $menu->promo_start_at ? $menu->promo_start_at->toIso8601String() : null,
                    'promo_end_at'    => $menu->promo_end_at ? $menu->promo_end_at->toIso8601String() : null,
                    'is_promo_active' => $isPromoActive, // buat bedain "masih berjalan" / "sudah habis"
                ];
            });

        return Inertia::render('Admin/Kasir/Promo/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        // menu normal yang bisa dijadikan isi paket / target promo
        $allMenus = Menu::where('is_package', false)
            ->where('is_available', true)
            ->get();

        return Inertia::render('Admin/Kasir/Promo/Create', [
            'categories' => $categories,
            'allMenus'   => $allMenus,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'nullable|string|max:255',
            'category_id'       => 'nullable|exists:categories,id',
            'price'             => 'required|numeric|min:0',
            'package_items'     => 'required|array|min:1',
            'promo_start_date'  => 'nullable|date',
            'promo_start_time'  => 'nullable',
            'promo_end_date'    => 'nullable|date',
            'promo_end_time'    => 'nullable',
            'image'             => 'nullable|file|image|max:2048',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time'])
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_start_date'].' '.$validated['promo_start_time'])
            : null;

        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time'])
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_end_date'].' '.$validated['promo_end_time'])
            : null;

        // mode paket kalau lebih dari satu isi atau ada nama paket
        $isPackageMode = count($validated['package_items']) > 1 || !empty($validated['name']);

        // mode diskon satuan
        if (!$isPackageMode) {
            $targetMenuId = $validated['package_items'][0];
            $menu = Menu::findOrFail($targetMenuId);

            $menu->update([
                'promo_price'    => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
                'is_available'   => true,
            ]);

            return redirect()->route('admin.kasir.promo.index')
                ->with('success', 'Promo Satuan berhasil dibuat!');
        }

        // mode paket bundling
        if (empty($validated['name'])) {
            return back()->withErrors(['name' => 'Nama Paket wajib diisi.']);
        }

        if (empty($validated['category_id'])) {
            return back()->withErrors(['category_id' => 'Kategori wajib dipilih.']);
        }

        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('menus', 'public')
            : null;

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

        return redirect()->route('admin.kasir.promo.index')
            ->with('success', 'Paket Bundling berhasil dibuat!');
    }

    public function edit($id)
    {
        $menu = Menu::with(['packageItems', 'category'])->findOrFail($id);

        $categories = Category::where('is_active', true)->get();

        $allMenus = Menu::where('is_package', false)
            ->where('is_available', true)
            ->get();

        $promoData = [
            'id'               => $menu->id,
            'name'             => $menu->name,
            'category_id'      => $menu->category_id,
            'is_available'     => (bool) $menu->is_available,
            'is_package'       => (bool) $menu->is_package,
            'image_url'        => $menu->image ? asset('storage/'.$menu->image) : null,
            'price'            => $menu->is_package ? (float) $menu->price : (float) $menu->promo_price,
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
            'price'             => 'required|numeric|min:0',
            'promo_start_date'  => 'nullable|date',
            'promo_start_time'  => 'nullable',
            'promo_end_date'    => 'nullable|date',
            'promo_end_time'    => 'nullable',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time'])
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_start_date'].' '.$validated['promo_start_time'])
            : null;

        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time'])
            ? Carbon::createFromFormat('Y-m-d H:i', $validated['promo_end_date'].' '.$validated['promo_end_time'])
            : null;

        if ($menu->is_package) {
            // paket: update harga paket & periode
            $menu->update([
                'price'          => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
                'is_available'   => true,
            ]);
        } else {
            // promo satuan: update promo_price & periode
            $menu->update([
                'promo_price'    => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
                'is_available'   => true,
            ]);
        }

        return redirect()->route('admin.kasir.promo.index')
            ->with('success', 'Promo berhasil diperbarui!');
    }

    public function toggle($id)
    {
        $menu = Menu::findOrFail($id);
        $now = Carbon::now();

        $isExpired = $menu->promo_end_at && $menu->promo_end_at->isPast();
        $hasPromo  = $menu->promo_price || $menu->is_package;

        $isPromoActive = $hasPromo && !$isExpired;

        if ($isPromoActive) {
            // matikan promo sekarang (anggap selesai)
            $menu->update([
                'promo_end_at' => $now->copy()->subMinute(),
            ]);
        } else {
            $menu->update([
                'promo_start_at' => $now,
                'promo_end_at'   => $now->copy()->addDay(),
            ]);
        }

        // tidak ubah is_available: menu tetap ada di Kelola Menu
        return back();
    }

    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);

        if ($menu->is_package) {
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $menu->delete(); // paket hilang dari sistem promo & menu (karena memang entitas paket)
        } else {
            // hapus promo satuan, menu kembali normal
            $menu->update([
                'promo_price'    => null,
                'promo_start_at' => null,
                'promo_end_at'   => null,
                'is_available'   => true,
            ]);
        }

        return redirect()->route('admin.kasir.promo.index');
    }
}
