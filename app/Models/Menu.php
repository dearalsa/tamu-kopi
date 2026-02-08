<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'price',
        'image',
        'is_available',
        'is_best_seller',
        'is_package',
        'promo_start_at',
        'promo_end_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_best_seller' => 'boolean',
        'is_package' => 'boolean',
        'promo_start_at' => 'datetime',
        'promo_end_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function packageItems()
    {
        return $this->belongsToMany(
            Menu::class,
            'menu_package_items',
            'package_menu_id',
            'item_menu_id'
        );
    }

    public function includedInPackages()
    {
        return $this->belongsToMany(
            Menu::class,
            'menu_package_items',
            'item_menu_id',
            'package_menu_id'
        );
    }
}
