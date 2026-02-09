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
            $table->string('invoice_number')->unique();
            $table->foreignId('admin_id')->constrained('admins')->onDelete('cascade');
            
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            
            $table->enum('payment_method', ['cash', 'qris'])->default('cash');
            $table->enum('payment_status', ['pending', 'paid', 'failed'])->default('pending');
            
            // Untuk cash
            $table->decimal('cash_amount', 10, 2)->nullable();
            $table->decimal('change_amount', 10, 2)->nullable();
            
            // Untuk QRIS
            $table->string('qris_code')->nullable();
            $table->string('qris_image')->nullable();
            $table->timestamp('qris_expired_at')->nullable();
            $table->string('payment_gateway_id')->nullable(); // ID dari payment gateway
            
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};