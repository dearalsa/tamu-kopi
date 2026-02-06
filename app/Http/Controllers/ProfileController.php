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
        ]);
    }
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:admin'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $admin = Auth::guard('admin')->user();
        
        $admin->update([
            'password' => Hash::make($validated['password']),
        ]);

        return Redirect::route($admin->role . '.profile.edit')->with('status', 'password-updated');
    }
}