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
    public function edit(Request $request): Response
    {
        $admin = Auth::guard('admin')->user();

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'role' => $admin->role,
            'admin' => $admin,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        /** @var \App\Models\Admin $admin */
        $admin = Auth::guard('admin')->user();

        // Validasi Nama dan Email (Email harus unik kecuali untuk ID admin ini sendiri)
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'lowercase', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
        ];

        // Validasi Password jika user mengisi field password
        if ($request->filled('password')) {
            $rules['current_password'] = [
                'required',
                function ($attribute, $value, $fail) use ($admin) {
                    if (!Hash::check($value, $admin->password)) {
                        $fail('Password saat ini tidak cocok.');
                    }
                },
            ];
            $rules['password'] = ['required', Password::defaults(), 'confirmed'];
        }

        $validated = $request->validate($rules);

        // Update data ke database
        $admin->name = $validated['name'];
        $admin->email = $validated['email'];

        // Update password hanya jika diisi
        if ($request->filled('password')) {
            $admin->password = Hash::make($validated['password']);
        }

        // Cek jika ada perubahan email, reset verifikasi jika diperlukan
        if ($admin->isDirty('email')) {
            $admin->email_verified_at = null;
        }

        $admin->save();

        return Redirect::back()->with('status', 'profile-updated');
    }
}