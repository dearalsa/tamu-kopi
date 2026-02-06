<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Landing Page
Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

// About Page
Route::get('/about', function () {
    return Inertia::render('About'); 
})->name('about');

// Routes untuk Owner
Route::middleware(['auth:admin'])->prefix('owner')->name('owner.')->group(function () {
    Route::get('/dashboard', function () {
        $admin = Auth::guard('admin')->user();
        
        if ($admin->role !== 'owner') {
            abort(403, 'Unauthorized');
        }
        
        return Inertia::render('Owner/Dashboard');
    })->name('dashboard');
    
    // Profile Owner (ganti password)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
});

// Routes untuk Admin
Route::middleware(['auth:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', function () {
        $admin = Auth::guard('admin')->user();
        
        if ($admin->role !== 'admin') {
            abort(403, 'Unauthorized');
        }
        
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
    // Profile Admin (ganti password)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
});

require __DIR__.'/auth.php';