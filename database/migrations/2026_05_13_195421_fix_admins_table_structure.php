<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Jalankan migrasi untuk memperbaiki kolom role dan is_active.
     */
    public function up(): void
    {
        // 1. Bersihkan data: Jika ada role yang isinya bukan 'admin' atau 'kasir', 
        // kita paksa jadi 'admin' dulu agar proses ubah ke ENUM tidak error.
        DB::table('admins')
            ->whereNotIn('role', ['admin', 'kasir'])
            ->update(['role' => 'admin']);

        // 2. Ubah struktur tabel
        Schema::table('admins', function (Blueprint $table) {
            
            // Mengubah tipe kolom role menjadi enum dengan pilihan yang kaku.
            // Kita beri panjang yang cukup agar sistem tidak melakukan 'truncate' lagi.
            $table->enum('role', ['admin', 'kasir'])
                  ->default('kasir')
                  ->change();
            
            // Menambahkan kolom is_active jika belum ada di database.
            if (!Schema::hasColumn('admins', 'is_active')) {
                $table->boolean('is_active')
                      ->default(true)
                      ->after('role');
            }
        });
    }

    /**
     * Kembalikan perubahan (Rollback).
     */
    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            // Kembalikan role ke string (varchar) jika migrasi di-rollback
            $table->string('role', 255)->default('admin')->change();
            
            // Kolom is_active biasanya dibiarkan saja atau bisa dihapus:
            // $table->dropColumn('is_active');
        });
    }
};