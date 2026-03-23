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
            // Validasi ini memastikan format harus berupa email dan diakhiri @gmail.com
            'email' => ['required', 'string', 'email', 'ends_with:@gmail.com'],
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid (harus menggunakan tanda @).',
            'email.ends_with' => 'Email harus menggunakan domain @gmail.com.',
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

        // Jika email tidak ditemukan, lempar pesan error hanya ke kolom email
        if (! $user) {
            RateLimiter::hit($this->throttleKey(), 35);
            throw ValidationException::withMessages([
                'email' => 'Email tidak terdaftar.',
            ]);
        }

        // Jika email ditemukan, barulah cek kecocokan password
        // Jika password salah, error hanya muncul di kolom password
        if (! $provider->validateCredentials($user, $credentials)) {
            RateLimiter::hit($this->throttleKey(), 35);
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
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
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