<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dateTime('promo_start_at')->nullable()->after('is_package');
            $table->dateTime('promo_end_at')->nullable()->after('promo_start_at');
        });
    }

    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropColumn(['promo_start_at', 'promo_end_at']);
        });
    }
};
