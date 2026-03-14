<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 
        'slug', 
        'description',
        'category_id', 
        'price', 
        'promo_price', 
        'image', 
        'is_available', 
        'is_best_seller', 
        'is_package',
        'promo_start_at', 
        'promo_end_at', 
        'stock', 
    ];

    protected $casts = [
        'price'          => 'decimal:2',
        'promo_price'    => 'decimal:2', 
        'is_available'   => 'boolean',
        'is_best_seller' => 'boolean',
        'is_package'     => 'boolean',
        'promo_start_at' => 'datetime',
        'promo_end_at'   => 'datetime',
        'stock'          => 'integer',
    ];

    /**
     * Cek apakah promo sudah berakhir
     */
    public function getIsPromoExpiredAttribute()
    {
        if (!$this->promo_end_at) return false;
        return Carbon::now()->gt($this->promo_end_at);
    }

    /**
     * Cek apakah stok habis
     */
    public function getIsOutOfStockAttribute()
    {
        if (is_null($this->stock)) return false; 
        return $this->stock <= 0;
    }

    /**
     * Relasi ke kategori
     */
    public function category() {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relasi item untuk menu tipe paket
     */
    public function packageItems() {
        return $this->belongsToMany(Menu::class, 'menu_package_items', 'package_menu_id', 'item_menu_id');
    }
}