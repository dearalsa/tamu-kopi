<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Menampilkan form edit profil.
     */
    public function edit(Request $request): Response
    {
        $admin = Auth::guard('admin')->user();

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'role' => $admin->role,
            'admin' => $admin,
        ]);
    }

    /**
     * Memperbarui Nama, Email, dan Password.
     */
    public function update(Request $request): RedirectResponse
    {
        $admin = Auth::guard('admin')->user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'lowercase', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
        ];

        // Validasi password hanya jika field password diisi
        if ($request->filled('password')) {
            $rules['current_password'] = ['required', 'current_password:admin'];
            $rules['password'] = ['required', Password::defaults(), 'confirmed'];
        }

        $validated = $request->validate($rules);

        // Update data profil
        $admin->name = $validated['name'];
        $admin->email = $validated['email'];

        // Update password jika ada input baru
        if ($request->filled('password')) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        // Redirect back dengan membawa status sukses
        // Inertia akan otomatis mengirimkan data admin yang terbaru ke frontend
        return Redirect::back()->with('status', 'profile-updated');
    }
}