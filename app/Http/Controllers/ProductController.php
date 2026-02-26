<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category')
            ->when($request->start_date, function ($query, $startDate) {
                $query->whereDate('date', '>=', $startDate);
            })
            ->when($request->end_date, function ($query, $endDate) {
                $query->whereDate('date', '<=', $endDate);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($product) => [
                'id'              => $product->id,
                'name'            => $product->name,
                'date'            => $product->date,
                'price'           => $product->price,
                'status'          => $product->status,
                'description'     => $product->description,
                'category'        => $product->category?->name,
                'proof'           => $product->proof
                    ? asset('storage/' . $product->proof)
                    : null,
                'created_by_name' => $product->created_by_name,
            ]);

        return Inertia::render('Admin/KelolaProduk/Index', [
            'products' => $products,
            'filters'  => $request->only(['start_date', 'end_date']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/KelolaProduk/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'date'        => 'required|date',
            'price'       => 'required|integer|min:0',
            'status'      => 'required|in:tersedia,habis',
            'description' => 'nullable|string',
            'proof'       => 'nullable|image|max:10240',
        ], [
            // Pesan 
            'name.required'        => 'Nama produk wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'date.required'        => 'Tanggal wajib diisi.',
            'price.required'       => 'Harga wajib diisi.',
            'status.required'      => 'Status ketersediaan wajib dipilih.',
            'proof.image'          => 'File yang diunggah harus berupa gambar.',
            'proof.max'            => 'Ukuran gambar maksimal adalah 10 MB.',
        ]);

        if ($request->hasFile('proof')) {
            $data['proof'] = $request->file('proof')->store('products', 'public');
        }

        $data['created_by_name'] = Auth::guard('admin')->user()?->name;

        Product::create($data);

        return redirect()->route('admin.kelola-produk.index')
            ->with('success', 'Produk berhasil ditambahkan!');
    }

    public function show(Product $product)
    {
        $product->load('category');

        return Inertia::render('Admin/KelolaProduk/Show', [
            'product' => [
                'id'              => $product->id,
                'name'            => $product->name,
                'date'            => $product->date,
                'price'           => $product->price,
                'status'          => $product->status,
                'description'     => $product->description,
                'category'        => $product->category?->name,
                'proof'           => $product->proof
                    ? asset('storage/' . $product->proof)
                    : null,
                'created_by_name' => $product->created_by_name,
            ],
        ]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Admin/KelolaProduk/Edit', [
            'product' => [
                'id'          => $product->id,
                'name'        => $product->name,
                'date'        => $product->date,
                'price'       => $product->price,
                'status'      => $product->status,
                'description' => $product->description,
                'category_id' => $product->category_id,
                'proof'       => $product->proof,
            ],
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'date'           => 'required|date',
            'price'          => 'required|integer|min:0',
            'status'         => 'required|in:tersedia,habis',
            'description'    => 'nullable|string',
            'proof'          => 'nullable|image|max:10240',
            'keep_old_proof' => 'nullable|string',
        ], [
            // Pesan 
            'name.required'        => 'Nama produk wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'date.required'        => 'Tanggal wajib diisi.',
            'price.required'       => 'Harga wajib diisi.',
            'status.required'      => 'Status ketersediaan wajib dipilih.',
            'proof.image'          => 'File yang diunggah harus berupa gambar.',
            'proof.max'            => 'Ukuran gambar maksimal adalah 10 MB.',
        ]);

        if ($request->hasFile('proof')) {
            if ($product->proof) {
                Storage::disk('public')->delete($product->proof);
            }
            $data['proof'] = $request->file('proof')->store('products', 'public');
        } else {
            unset($data['proof']);

            if (!$request->keep_old_proof && $product->proof) {
                Storage::disk('public')->delete($product->proof);
                $data['proof'] = null;
            }
        }

        $product->update($data);

        return redirect()->route('admin.kelola-produk.index')
            ->with('success', 'Produk berhasil diupdate!');
    }

    public function destroy(Product $product)
    {
        if ($product->proof) {
            Storage::disk('public')->delete($product->proof);
        }
        $product->delete();

        return back()->with('success', 'Produk berhasil dihapus!');
    }
}