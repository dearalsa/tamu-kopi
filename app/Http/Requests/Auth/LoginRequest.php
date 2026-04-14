<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Validasi ini memastikan format harus berupa email dan harus tepat putrisalsabila101208@gmail.com
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.in' => 'Email admin tidak terdaftar. Pastikan Anda menggunakan email yang benar.',
            'password.required' => 'Password wajib diisi.',
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $credentials = $this->only('email', 'password');
        $provider = Auth::guard('admin')->getProvider();
        
        // Cek apakah email terdaftar di database
        $user = $provider->retrieveByCredentials(['email' => $this->email]);

        // Jika email tidak ditemukan
        if (! $user) {
            RateLimiter::hit($this->throttleKey(), 30); // Waktu blokir diubah jadi 30 detik
            throw ValidationException::withMessages([
                'email' => 'Email tidak terdaftar.',
            ]);
        }

        // Cek kecocokan password
        if (! $provider->validateCredentials($user, $credentials)) {
            RateLimiter::hit($this->throttleKey(), 30); // Waktu blokir diubah jadi 30 detik
            throw ValidationException::withMessages([
                'password' => 'Password yang Anda masukkan salah.',
            ]);
        }

        // Jika semua benar, loginkan user dan hapus limit
        Auth::guard('admin')->login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        // Pembatasan maksimal 3 kali percobaan
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 3)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => "Terlalu banyak upaya login. Silakan coba lagi dalam $seconds detik.",
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}