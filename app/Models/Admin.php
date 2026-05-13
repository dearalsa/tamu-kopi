<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Support\Str; // Tambahkan ini untuk fungsi UUID

class Admin extends Authenticatable
{
    use HasFactory, Notifiable, CanResetPassword;

    /**
     * Kolom yang dapat diisi secara massal.
     */
    protected $fillable = [
        'uuid',    
        'name',
        'email',
        'password',
        'role',   
        'is_active',
    ];

    /**
     * Kolom yang disembunyikan saat serialisasi (JSON).
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casting tipe data kolom.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Boot function untuk menangani logika otomatis saat model dibuat.
     * Ini bagian dari Cyber Security: Otomatis membuat UUID.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Menggunakan UUID sebagai kunci pencarian di URL (Route Model Binding).
     * Cyber Security: Mencegah ID Enumeration (menebak ID user).
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Helper untuk mengecek apakah user adalah Admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Helper untuk mengecek apakah user adalah Kasir.
     */
    public function isKasir(): bool
    {
        return $this->role === 'kasir';
    }
}