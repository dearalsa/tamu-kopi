<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menu_package_items', function (Blueprint $table) {
            $table->id();

            // menu paket
            $table->foreignId('package_menu_id')
                ->constrained('menus')
                ->cascadeOnDelete();

            // menu isi
            $table->foreignId('item_menu_id')
                ->constrained('menus')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_package_items');
    }
};
