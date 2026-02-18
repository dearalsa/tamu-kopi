<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoogleReviewController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPromoController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\LaporanKasController;

// Landing Page
Route::get('/', [MenuController::class, 'landing'])->name('home');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::post('/webhook/payment', [TransactionController::class, 'webhookPayment'])
    ->name('webhook.payment');

// Group khusus Admin 
Route::middleware(['auth:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Profile Management
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        // Master Data: Kategori
        Route::resource('categories', CategoryController::class)
            ->except(['show']);

        // Master Data: Kelola Produk (Bahan Baku)
        Route::resource('kelola-produk', ProductController::class)
            ->names('kelola-produk')
            ->parameters([
                'kelola-produk' => 'product'
            ]);

        // Fitur Laporan Kas
        Route::prefix('laporan')->name('laporan.')->group(function () {
            Route::get('/pemasukan', [LaporanKasController::class, 'pemasukan'])->name('pemasukan');
            Route::get('/pengeluaran', [LaporanKasController::class, 'pengeluaran'])->name('pengeluaran');
            Route::get('/export/{tipe}', [LaporanKasController::class, 'export'])->name('export');
        });

        // Fitur Kasir
        Route::prefix('kasir')->name('kasir.')->group(function () {
            Route::resource('menus', MenuController::class)->except(['show']);

            // Promo Management
            Route::get('/promo', [MenuPromoController::class, 'index'])->name('promo.index');
            Route::get('/promo/create', [MenuPromoController::class, 'create'])->name('promo.create');
            Route::post('/promo', [MenuPromoController::class, 'store'])->name('promo.store');
            Route::get('/promo/{menu}/edit', [MenuPromoController::class, 'edit'])->name('promo.edit');
            Route::put('/promo/{menu}', [MenuPromoController::class, 'update'])->name('promo.update');
            Route::patch('/promo/{menu}/toggle', [MenuPromoController::class, 'toggle'])->name('promo.toggle');
            Route::delete('/promo/{menu}', [MenuPromoController::class, 'destroy'])->name('promo.destroy');

            // Katalog & Transaksi
            Route::get('/katalog', [CatalogController::class, 'index'])->name('katalog.index');
            Route::get('/transaksi', [TransactionController::class, 'index'])->name('transactions.index');
            Route::post('/transaksi', [TransactionController::class, 'store'])->name('transactions.store');

            // Summary Penjualan
            Route::get('/summary', [SummaryController::class, 'index'])->name('summary.index');
        });

        // Google Reviews
        Route::get('/reviews', [GoogleReviewController::class, 'index'])->name('reviews.index');
    });

require __DIR__.'/auth.php';