<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        // Relasi ke tabel admins
        $table->foreignId('user_id')->nullable()->constrained('admins')->onDelete('set null');
        $table->string('invoice_number')->unique();
        $table->string('queue_number');
        $table->decimal('subtotal', 15, 2)->default(0);
        $table->decimal('discount', 15, 2)->default(0);
        $table->decimal('total', 15, 2)->default(0);
        $table->enum('payment_method', ['cash', 'qris'])->default('cash');
        $table->decimal('cash_amount', 15, 2)->default(0);
        $table->decimal('change', 15, 2)->default(0);
        $table->enum('order_type', ['dine-in', 'takeaway'])->default('dine-in');
        $table->timestamps();
    });
}

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};