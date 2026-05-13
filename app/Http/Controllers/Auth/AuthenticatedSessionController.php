<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Menampilkan halaman login.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    /**
     * Menangani permintaan autentikasi masuk.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        // 1. Jalankan proses autentikasi (Throttle sudah ada di LoginRequest bawaan Laravel)
        $request->authenticate();

        // 2. Keamanan: Cek apakah akun masih aktif (Opsional, tapi bagus untuk Cyber Security)
        if (!Auth::guard('admin')->user()->is_active) {
            Auth::guard('admin')->logout();
            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan. Silakan hubungi Admin.',
            ]);
        }

        // 3. Regenerasi session untuk mencegah Session Fixation attack
        $request->session()->regenerate();

        // 4. LOGIKA REDIRECT BERDASARKAN ROLE
        $user = Auth::guard('admin')->user();

        if ($user->role === 'admin') {
            // Admin diarahkan ke Dashboard Utama
            return redirect()->intended(route('admin.dashboard'));
        } 
        
        if ($user->role === 'kasir') {
            // Kasir diarahkan langsung ke Katalog/Kasir (sesuai request kamu)
            return redirect()->intended(route('admin.kasir.katalog.index'));
        }

        // Fallback jika role tidak dikenali
        return redirect()->intended(route('admin.dashboard'));
    }

    /**
     * Menangani permintaan keluar (logout).
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}