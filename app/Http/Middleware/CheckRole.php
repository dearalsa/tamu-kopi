<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Menangani permintaan yang masuk.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles (Daftar role yang diizinkan, misal: 'admin', 'kasir')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Cek apakah user sudah login
        // 2. Cek apakah role user ada di dalam daftar $roles yang dikirim dari Route
        if (!auth()->check() || !in_array(auth()->user()->role, $roles)) {
            
            // Jika tidak punya akses, hentikan dan beri error 403
            abort(403, 'Akses Ditolak: Anda tidak memiliki izin untuk mengakses halaman ini.');
        }

        return $next($request);
    }
}