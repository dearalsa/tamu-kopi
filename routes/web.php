<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoogleReviewController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPromoController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\SummaryController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ProductController;

Route::get('/', [MenuController::class, 'landing'])->name('home');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::post('/webhook/payment', [TransactionController::class, 'webhookPayment'])
    ->name('webhook.payment');

Route::middleware(['auth:admin'])
    ->prefix('owner')
    ->name('owner.')
    ->group(function () {

        Route::get('/dashboard', function () {
            $admin = Auth::guard('admin')->user();
            if ($admin->role !== 'owner') abort(403);
            return Inertia::render('Owner/Dashboard');
        })->name('dashboard');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    });

Route::middleware(['auth:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', function () {
            $admin = Auth::guard('admin')->user();
            if ($admin->role !== 'admin') abort(403);
            return Inertia::render('Admin/Dashboard');
        })->name('dashboard');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

        Route::resource('categories', CategoryController::class)
            ->except(['show']);

        Route::resource('kelola-produk', ProductController::class)
            ->names('kelola-produk')
            ->parameters([
                'kelola-produk' => 'product'
            ]);

        Route::prefix('kasir')->name('kasir.')->group(function () {

            // Menu
            Route::resource('menus', MenuController::class)->except(['show']);

            // Promo
            Route::get('/promo', [MenuPromoController::class, 'index'])->name('promo.index');
            Route::get('/promo/create', [MenuPromoController::class, 'create'])->name('promo.create');
            Route::post('/promo', [MenuPromoController::class, 'store'])->name('promo.store');
            Route::get('/promo/{menu}/edit', [MenuPromoController::class, 'edit'])->name('promo.edit');
            Route::put('/promo/{menu}', [MenuPromoController::class, 'update'])->name('promo.update');
            Route::patch('/promo/{menu}/toggle', [MenuPromoController::class, 'toggle'])->name('promo.toggle');
            Route::delete('/promo/{menu}', [MenuPromoController::class, 'destroy'])->name('promo.destroy');

            // Katalog
            Route::get('/katalog', [CatalogController::class, 'index'])->name('katalog.index');

            // Transaksi
            Route::get('/transaksi', [TransactionController::class, 'index'])->name('transactions.index');
            Route::post('/transaksi', [TransactionController::class, 'store'])->name('transactions.store');

            // Summary
            Route::get('/summary', [SummaryController::class, 'index'])->name('summary.index');
        });

        Route::get('/reviews', [GoogleReviewController::class, 'index']);
    });

require __DIR__.'/auth.php';
