<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Kita tambahkan kolom promo_price setelah kolom price
            // Tipe decimal(10, 2) agar sama dengan format harga
            // nullable() penting agar menu biasa (tanpa promo) isinya NULL
            $table->decimal('promo_price', 10, 2)->nullable()->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            // Hapus kolom jika kita melakukan rollback
            $table->dropColumn('promo_price');
        });
    }
};