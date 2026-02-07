<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function index()
    {
        $menus = Menu::with('category')->latest()->get();

        return Inertia::render('Admin/Kasir/Menu/Index', [
            'menus' => $menus,
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('Admin/Kasir/Menu/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|file',
            'is_available' => 'required|boolean',
            'is_best_seller' => 'required|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_available'] = (bool) $validated['is_available'];
        $validated['is_best_seller'] = (bool) $validated['is_best_seller'];

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('menus', 'public');
        }

        Menu::create($validated);

        return redirect()->route('admin.kasir.menus.index')
            ->with('success', 'Menu berhasil ditambahkan!');
    }

    public function edit(Menu $menu)
    {
        $categories = Category::where('is_active', true)->get();

        $menu->load('category');
        $menu->image_url = $menu->image ? asset('storage/' . $menu->image) : null;

        return Inertia::render('Admin/Kasir/Menu/Edit', [
            'menu' => $menu,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|file',
            'is_available' => 'required|boolean',
            'is_best_seller' => 'required|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['is_available'] = (bool) $validated['is_available'];
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
