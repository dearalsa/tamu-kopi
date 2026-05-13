<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AdminManagementController extends Controller
{
    /**
     * Menampilkan daftar kasir
     */
    public function index()
    {
        return Inertia::render('Admin/Kasir/KelolaKasir/Index', [
            'cashiers' => Admin::where('role', 'kasir')->latest()->get()
        ]);
    }

    /**
     * Form tambah kasir
     */
    public function create()
    {
        return Inertia::render('Admin/Kasir/KelolaKasir/Create');
    }

    /**
     * Simpan kasir baru
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:admins',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_active' => 'required|boolean',
        ], [
            // Pesan Validasi Bahasa Indonesia
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.lowercase' => 'Alamat email harus menggunakan huruf kecil.', // Ditambahkan ini
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal harus 8 karakter.',
            'is_active.required' => 'Status akun harus dipilih.',
        ]);

        Admin::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'kasir',
            'is_active' => $request->is_active,
        ]);

        return redirect()->route('admin.manage-cashiers.index')
            ->with('message', 'Kasir berhasil ditambahkan.');
    }

    /**
     * Form edit kasir
     */
    public function edit(Admin $admin)
    {
        return Inertia::render('Admin/Kasir/KelolaKasir/Edit', [
            'cashier' => $admin
        ]);
    }

    /**
     * Update data kasir
     */
    public function update(Request $request, Admin $admin)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:admins,email,'.$admin->id,
            'is_active' => 'required|boolean',
        ], [
            // Pesan Validasi Bahasa Indonesia
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.lowercase' => 'Alamat email harus menggunakan huruf kecil.', // Ditambahkan ini
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
        ]);

        // Update data dasar termasuk status aktif/tidak aktif
        $admin->update([
            'name' => $request->name,
            'email' => $request->email,
            'is_active' => $request->is_active,
        ]);

        // Update password hanya jika diisi
        if ($request->filled('password')) {
            $request->validate([
                'password' => ['confirmed', Rules\Password::defaults()]
            ], [
                'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
                'password.min' => 'Kata sandi baru minimal harus 8 karakter.',
            ]);

            $admin->update([
                'password' => Hash::make($request->password)
            ]);
        }

        return redirect()->route('admin.manage-cashiers.index')
            ->with('message', 'Data kasir berhasil diperbarui.');
    }

    /**
     * Hapus kasir
     */
    public function destroy(Admin $admin)
    {
        $admin->delete();
        return redirect()->route('admin.manage-cashiers.index')
            ->with('message', 'Akun kasir telah dihapus secara permanen.');
    }
}