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
        $admin = Auth::guard('admin')->user();

        // Email tidak divalidasi karena tidak dikirim/diubah
        $rules = [
            'name' => ['required', 'string', 'max:255'],
        ];

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

        // Hanya update Nama (Email diabaikan agar tetap admin@gmail.com)
        $admin->name = $validated['name'];

        if ($request->filled('password')) {
            $admin->password = $validated['password'];
        }

        $admin->save();

        return Redirect::back()->with('status', 'profile-updated');
    }
}