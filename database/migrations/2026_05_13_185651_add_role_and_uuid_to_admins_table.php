<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{   
    Schema::table('admins', function (Blueprint $table) {
        // Cek apakah kolom 'uuid' sudah ada, jika belum baru buat
        if (!Schema::hasColumn('admins', 'uuid')) {
            $table->uuid('uuid')->unique()->after('id');
        }

        // Cek apakah kolom 'role' sudah ada, jika belum baru buat
        if (!Schema::hasColumn('admins', 'role')) {
            $table->enum('role', ['admin', 'kasir'])->default('kasir')->after('password');
        }

        // Cek apakah kolom 'is_active' sudah ada, jika belum baru buat
        if (!Schema::hasColumn('admins', 'is_active')) {
            $table->boolean('is_active')->default(true)->after('role');
        }
    });
}

    public function down(): void
{
    Schema::table('admins', function (Blueprint $table) {
        // Hapus kolom hanya jika kolom tersebut memang ada
        $columns = [];
        if (Schema::hasColumn('admins', 'uuid')) $columns[] = 'uuid';
        if (Schema::hasColumn('admins', 'role')) $columns[] = 'role';
        if (Schema::hasColumn('admins', 'is_active')) $columns[] = 'is_active';

        if (!empty($columns)) {
            $table->dropColumn($columns);
        }
    });
}};