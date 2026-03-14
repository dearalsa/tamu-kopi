<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            // Kita tambah kolom description untuk menampung catatan pesanan
            $table->string('description')->nullable()->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('transaction_details', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }
};