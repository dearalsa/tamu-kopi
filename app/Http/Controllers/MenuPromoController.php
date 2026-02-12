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
    protected function generateSlugForPromo(string $name): string
    {
        return Str::slug($name . '-' . Str::random(5));
    }

    public function index()
    {
        // Tampilkan Paket ATAU Menu yang sedang diskon
        $menus = Menu::with('category')
            ->where(function($query) {
                $query->where('is_package', true)
                      ->orWhereNotNull('promo_price');
            })
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
        // ... (Kode Store SAMA SEPERTI SEBELUMNYA, tidak saya ubah) ...
        // Agar tidak kepanjangan, saya singkat bagian ini karena sudah jalan
        // Intinya: Validasi -> Cek isPackage -> Create Paket atau Update Menu Lama
        
        $validated = $request->validate([
            'name'             => 'nullable|string|max:255',
            'category_id'      => 'nullable|exists:categories,id',
            'price'            => 'required|numeric|min:0',
            'package_items'    => 'required|array|min:1',
            'is_available'     => 'required',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable',
            'image'            => 'nullable|file|image|max:2048',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time']) ? $validated['promo_start_date'] . ' ' . $validated['promo_start_time'] : null;
        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time']) ? $validated['promo_end_date'] . ' ' . $validated['promo_end_time'] : null;

        $isPackage = count($validated['package_items']) > 1; 

        if (!$isPackage) {
            // PROMO SATUAN -> Update Menu Asli
            $targetMenuId = $validated['package_items'][0];
            $menu = Menu::findOrFail($targetMenuId);
            $menu->update([
                'promo_price'    => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
            ]);
            return redirect()->route('admin.kasir.promo.index')->with('success', 'Promo berhasil diaktifkan!');
        } else {
            // PAKET -> Buat Baru
            if (empty($validated['name'])) return back()->withErrors(['name' => 'Nama Paket wajib diisi.']);
            if (empty($validated['category_id'])) return back()->withErrors(['category_id' => 'Kategori wajib dipilih.']);

            $imagePath = $request->hasFile('image') ? $request->file('image')->store('menus', 'public') : null;

            $package = Menu::create([
                'name'           => $validated['name'],
                'slug'           => $this->generateSlugForPromo($validated['name']),
                'category_id'    => $validated['category_id'],
                'price'          => $validated['price'],
                'image'          => $imagePath,
                'is_available'   => (bool) $validated['is_available'],
                'is_package'     => true,
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
            ]);
            $package->packageItems()->sync($validated['package_items']);
            return redirect()->route('admin.kasir.promo.index')->with('success', 'Paket Bundling berhasil dibuat!');
        }
    }

    // --- INI YANG DITAMBAHKAN UNTUK MENGATASI ERROR ---
    public function edit($id)
    {
        // Cari menu berdasarkan ID
        $menu = Menu::with(['packageItems', 'category'])->findOrFail($id);

        $categories = Category::where('is_active', true)->get();
        $allMenus = Menu::where('is_package', false)->where('is_available', true)->get();

        // Siapkan data untuk dikirim ke React
        $promoData = [
            'id'               => $menu->id,
            'name'             => $menu->name,
            'category_id'      => $menu->category_id,
            'is_available'     => $menu->is_available,
            'is_package'       => $menu->is_package,
            'image_url'        => $menu->image ? asset('storage/' . $menu->image) : null,
            
            // Logika Harga: Kalau paket ambil price, kalau promo satuan ambil promo_price
            'price'            => $menu->is_package ? $menu->price : $menu->promo_price,
            
            // Logika Item: Kalau paket ambil dari relasi, kalau satuan ambil ID dirinya sendiri
            'package_items'    => $menu->is_package ? $menu->packageItems->pluck('id') : [$menu->id],
            
            // Format Tanggal untuk input type="date"
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
            'name'             => 'nullable|string|max:255',
            'category_id'      => 'nullable|exists:categories,id',
            'price'            => 'required|numeric|min:0',
            'package_items'    => 'required|array|min:1',
            'is_available'     => 'required',
            'promo_start_date' => 'nullable|date',
            'promo_start_time' => 'nullable',
            'promo_end_date'   => 'nullable|date',
            'promo_end_time'   => 'nullable',
            'image'            => 'nullable|file|image|max:2048',
        ]);

        $promoStartAt = ($validated['promo_start_date'] && $validated['promo_start_time']) ? $validated['promo_start_date'] . ' ' . $validated['promo_start_time'] : null;
        $promoEndAt = ($validated['promo_end_date'] && $validated['promo_end_time']) ? $validated['promo_end_date'] . ' ' . $validated['promo_end_time'] : null;

        // Cek mode berdasarkan apakah ini menu paket atau bukan
        if ($menu->is_package) {
            // === UPDATE PAKET ===
            if (empty($validated['name'])) return back()->withErrors(['name' => 'Nama Paket wajib diisi.']);
            
            $dataToUpdate = [
                'name'           => $validated['name'],
                'category_id'    => $validated['category_id'],
                'price'          => $validated['price'],
                'is_available'   => (bool) $validated['is_available'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
            ];

            if ($request->hasFile('image')) {
                if ($menu->image) Storage::disk('public')->delete($menu->image);
                $dataToUpdate['image'] = $request->file('image')->store('menus', 'public');
            }

            $menu->update($dataToUpdate);
            $menu->packageItems()->sync($validated['package_items']);

            return redirect()->route('admin.kasir.promo.index')->with('success', 'Paket berhasil diperbarui!');

        } else {
            // === UPDATE PROMO SATUAN ===
            // Kita hanya update harga promo, tanggal, dan status di menu utama
            // Nama & Kategori TIDAK diubah (ikut master data)
            
            $menu->update([
                'promo_price'    => $validated['price'],
                'promo_start_at' => $promoStartAt,
                'promo_end_at'   => $promoEndAt,
                // Kita biarkan is_available diupdate juga jika mau matikan dari sini
                // 'is_available' => (bool) $validated['is_available'], 
            ]);

            return redirect()->route('admin.kasir.promo.index')->with('success', 'Diskon menu berhasil diperbarui!');
        }
    }

    public function destroy(Menu $menu)
    {
        if ($menu->is_package) {
            if ($menu->image) Storage::disk('public')->delete($menu->image);
            $menu->delete();
            $msg = 'Paket promo berhasil dihapus permanen.';
        } else {
            $menu->update([
                'promo_price'    => null,
                'promo_start_at' => null,
                'promo_end_at'   => null,
            ]);
            $msg = 'Promo dinonaktifkan. Menu utama tetap ada.';
        }
        return redirect()->route('admin.kasir.promo.index')->with('success', $msg);
    }

    public function toggle(Menu $menu)
    {
         $menu->update(['is_available' => ! (bool) $menu->is_available]);
         return back();
    }
}