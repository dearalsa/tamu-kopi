<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuPromoController extends Controller
{
    public function index()
    {
        $menus = Menu::with('category', 'packageItems')
            ->where('is_package', true)
            ->latest()
            ->get();

        return Inertia::render('Admin/Kasir/Promo/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        $allMenus = Menu::where('is_package', false)
            ->where('is_available', true)
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Kasir/Promo/Create', [
            'categories' => $categories,
            'allMenus'   => $allMenus,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'category_id'      => 'required|exists:categories,id',
            'price'            => 'required|numeric|min:0',
            'image'            => 'nullable|file',
            'is_available'     => 'required|boolean',
            'package_items'    => 'required|array|min:1',
            'package_items.*'  => 'exists:menus,id',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable|date_format:H:i',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable|date_format:H:i',
        ]);

        $validated['slug']         = Str::slug($validated['name']);
        $validated['is_available'] = (bool) $validated['is_available'];
        $validated['is_package']   = true;

        $startDate = $validated['promo_start_date'] ?? null;
        $startTime = $validated['promo_start_time'] ?? null;
        $endDate   = $validated['promo_end_date'] ?? null;
        $endTime   = $validated['promo_end_time'] ?? null;

        $validated['promo_start_at'] = ($startDate && $startTime)
            ? $startDate.' '.$startTime.':00'
            : null;

        $validated['promo_end_at'] = ($endDate && $endTime)
            ? $endDate.' '.$endTime.':00'
            : null;

        unset(
            $validated['promo_start_date'],
            $validated['promo_start_time'],
            $validated['promo_end_date'],
            $validated['promo_end_time']
        );

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menus', 'public');
        }

        $menu = Menu::create($validated);
        $menu->packageItems()->sync($validated['package_items']);

        return redirect()->route('admin.kasir.promo.index')
            ->with('success', 'Menu promo berhasil dibuat!');
    }

    public function edit(Menu $menu)
    {
        abort_unless($menu->is_package, 404);

        $categories = Category::where('is_active', true)->get();

        $menu->load('category', 'packageItems');
        $menu->image_url = $menu->image ? asset('storage/' . $menu->image) : null;

        $allMenus = Menu::where('is_package', false)
            ->where('is_available', true)
            ->orderBy('name')
            ->get();

        $promo = [
            'id'               => $menu->id,
            'name'             => $menu->name,
            'category_id'      => $menu->category_id,
            'price'            => $menu->price,
            'is_available'     => (bool) $menu->is_available,
            'image_url'        => $menu->image_url,
            'promo_start_date' => $menu->promo_start_at ? $menu->promo_start_at->format('Y-m-d') : '',
            'promo_start_time' => $menu->promo_start_at ? $menu->promo_start_at->format('H:i') : '',
            'promo_end_date'   => $menu->promo_end_at ? $menu->promo_end_at->format('Y-m-d') : '',
            'promo_end_time'   => $menu->promo_end_at ? $menu->promo_end_at->format('H:i') : '',
            'package_items'    => $menu->packageItems->pluck('id')->toArray(),
        ];

        return Inertia::render('Admin/Kasir/Promo/Edit', [
            'promo'      => $promo,
            'categories' => $categories,
            'allMenus'   => $allMenus,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        abort_unless($menu->is_package, 404);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'category_id'      => 'required|exists:categories,id',
            'price'            => 'required|numeric|min:0',
            'image'            => 'nullable|file',
            'is_available'     => 'required|boolean',
            'package_items'    => 'required|array|min:1',
            'package_items.*'  => 'exists:menus,id',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable|date_format:H:i',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable|date_format:H:i',
            'remove_image'     => 'nullable|boolean',
        ]);

        $validated['slug']         = Str::slug($validated['name']);
        $validated['is_available'] = (bool) $validated['is_available'];

        $startDate = $validated['promo_start_date'] ?? null;
        $startTime = $validated['promo_start_time'] ?? null;
        $endDate   = $validated['promo_end_date'] ?? null;
        $endTime   = $validated['promo_end_time'] ?? null;

        $validated['promo_start_at'] = ($startDate && $startTime)
            ? $startDate.' '.$startTime.':00'
            : null;

        $validated['promo_end_at'] = ($endDate && $endTime)
            ? $endDate.' '.$endTime.':00'
            : null;

        unset(
            $validated['promo_start_date'],
            $validated['promo_start_time'],
            $validated['promo_end_date'],
            $validated['promo_end_time']
        );

        if (!empty($validated['remove_image']) && $menu->image) {
            Storage::disk('public')->delete($menu->image);
            $menu->image = null;
        }
        unset($validated['remove_image']);

        if ($request->hasFile('image')) {
            if ($menu->image) {
                Storage::disk('public')->delete($menu->image);
            }
            $validated['image'] = $request->file('image')->store('menus', 'public');
        } else {
            unset($validated['image']);
        }

        $menu->update($validated);
        $menu->packageItems()->sync($validated['package_items']);

        return redirect()->route('admin.kasir.promo.index')
            ->with('success', 'Menu promo berhasil diupdate!');
    }

    public function destroy(Menu $menu)
    {
        abort_unless($menu->is_package, 404);

        if ($menu->image) {
            Storage::disk('public')->delete($menu->image);
        }

        $menu->delete();

        return redirect()->route('admin.kasir.promo.index')
            ->with('success', 'Menu promo berhasil dihapus!');
    }
}
