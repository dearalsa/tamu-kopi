<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\{
    DashboardController, ProfileController, CategoryController, 
    GoogleReviewController, MenuController, MenuPromoController, 
    CatalogController, SummaryController, TransactionController, 
    ProductController, LaporanKasController, AdminManagementController
};

// --- PUBLIC ROUTES ---
Route::get('/', [MenuController::class, 'landing'])->name('home');
Route::get('/about', fn () => Inertia::render('About'))->name('about');
Route::post('/webhook/payment', [TransactionController::class, 'webhookPayment'])->name('webhook.payment');

// --- PROTECTED ROUTES (Guard: Admin) ---
Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {

    // 1. AKSES BERSAMA (Admin & Kasir)
    // Fokus pada operasional harian yang membutuhkan efisiensi tinggi
    Route::middleware(['role:admin,kasir'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        
        // Modul Transaksi: Kasir sekarang bisa Void & Kelola Transaksi sepenuhnya
        Route::prefix('kasir')->name('kasir.')->group(function () {
            Route::get('/transaksi', [TransactionController::class, 'index'])->name('transactions.index');
            Route::post('/transaksi', [TransactionController::class, 'store'])->name('transactions.store');
            
            // Pindah ke sini agar Kasir bisa Void demi efisiensi operasional
            Route::patch('/transaksi/{transaction:uuid}/void', [TransactionController::class, 'void'])
                ->name('transactions.void');
        });
    });

    // 2. KHUSUS KASIR
    Route::middleware(['role:kasir'])->group(function () {
        Route::get('/kasir/katalog', [CatalogController::class, 'index'])->name('kasir.katalog.index');
    });

    // 3. KHUSUS ADMIN (Cyber Security Hardening)
    // Semua hal sensitif (Uang, Profil, User, & Master Data) hanya di sini
    Route::middleware(['role:admin'])->group(function () {
        
        // Profil Management: Hanya Admin yang bisa akses profil untuk update password/data
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        // Kelola Akun Kasir
        Route::resource('manage-cashiers', AdminManagementController::class)
            ->parameters(['manage-cashiers' => 'admin:uuid']);

        // Master Data Produk & Kategori
        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::resource('kelola-produk', ProductController::class)
            ->names('kelola-produk')
            ->parameters(['kelola-produk' => 'product']);

        // Laporan Keuangan (Sangat Sensitif)
        Route::prefix('laporan')->name('laporan.')->group(function () {
            Route::get('/pemasukan', [LaporanKasController::class, 'pemasukan'])->name('pemasukan');
            Route::get('/pengeluaran', [LaporanKasController::class, 'pengeluaran'])->name('pengeluaran');
            Route::get('/export/{tipe}', [LaporanKasController::class, 'export'])->name('export');
        });

        // Manajemen Katalog Bisnis (Harga & Promo)
        Route::prefix('kasir')->name('kasir.')->group(function () {
            Route::resource('menus', MenuController::class)->except(['show']);
            Route::resource('promo', MenuPromoController::class)
                ->names('promo')
                ->parameters(['promo' => 'menu']);
            Route::patch('/promo/{menu}/toggle', [MenuPromoController::class, 'toggle'])->name('promo.toggle');
            
            // Analitik Penjualan
            Route::get('/summary', [SummaryController::class, 'index'])->name('summary.index');
        });

        Route::get('/reviews', [GoogleReviewController::class, 'index'])->name('reviews.index');
    });
});

require __DIR__.'/auth.php';