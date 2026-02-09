<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoogleReviewController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\MenuPromoController;
use App\Http\Controllers\CatalogController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

Route::get('/', [MenuController::class, 'landing'])->name('home');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::post('/webhook/payment', [TransactionController::class, 'webhookPayment'])->name('webhook.payment');

Route::middleware(['auth:admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', function () {
        $admin = Auth::guard('admin')->user();
        if ($admin->role !== 'owner') {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Owner/Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
});

Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $admin = Auth::guard('admin')->user();
        if ($admin->role !== 'admin') {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::get('/categories/create', [CategoryController::class, 'create'])->name('categories.create');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/{category}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::prefix('kasir')->name('kasir.')->group(function () {
        Route::get('/menus', [MenuController::class, 'index'])->name('menus.index');
        Route::get('/menus/create', [MenuController::class, 'create'])->name('menus.create');
        Route::post('/menus', [MenuController::class, 'store'])->name('menus.store');
        Route::get('/menus/{menu}/edit', [MenuController::class, 'edit'])->name('menus.edit');
        Route::put('/menus/{menu}', [MenuController::class, 'update'])->name('menus.update');
        Route::delete('/menus/{menu}', [MenuController::class, 'destroy'])->name('menus.destroy');

        Route::get('/promo', [MenuPromoController::class, 'index'])->name('promo.index');
        Route::get('/promo/create', [MenuPromoController::class, 'create'])->name('promo.create');
        Route::post('/promo', [MenuPromoController::class, 'store'])->name('promo.store');
        Route::get('/promo/{menu}/edit', [MenuPromoController::class, 'edit'])->name('promo.edit');
        Route::put('/promo/{menu}', [MenuPromoController::class, 'update'])->name('promo.update');
        Route::patch('/promo/{menu}/toggle', [MenuPromoController::class, 'toggle'])->name('promo.toggle');
        Route::delete('/promo/{menu}', [MenuPromoController::class, 'destroy'])->name('promo.destroy');

        Route::get('/katalog', [CatalogController::class, 'index'])->name('katalog.index');
    });

    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::post('/cash', [TransactionController::class, 'storeCash'])->name('store.cash');
        Route::post('/qris', [TransactionController::class, 'storeQris'])->name('store.qris');
    });

    Route::get('/reviews', [GoogleReviewController::class, 'index']);
});

require __DIR__.'/auth.php';
