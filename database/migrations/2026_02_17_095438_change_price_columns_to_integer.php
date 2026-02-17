<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // transaction_details
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->integer('price')->change();
        });

        // transactions
        Schema::table('transactions', function (Blueprint $table) {
            $table->integer('subtotal')->change();
            $table->integer('discount')->change();
            $table->integer('total')->change();
            $table->integer('cash_amount')->change();
            $table->integer('change')->change();
        });

        // menus (kalau ada)
        Schema::table('menus', function (Blueprint $table) {
            $table->integer('price')->change();
            $table->integer('promo_price')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->decimal('price', 12, 2)->change();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->decimal('subtotal', 15, 2)->change();
            $table->decimal('discount', 15, 2)->change();
            $table->decimal('total', 15, 2)->change();
            $table->decimal('cash_amount', 15, 2)->change();
            $table->decimal('change', 15, 2)->change();
        });

        Schema::table('menus', function (Blueprint $table) {
            $table->decimal('price', 15, 2)->change();
            $table->decimal('promo_price', 15, 2)->nullable()->change();
        });
    }
};
