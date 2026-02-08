<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuPackageItem extends Model
{
    use HasFactory;

    protected $table = 'menu_package_items';

    protected $fillable = [
        'package_menu_id',
        'item_menu_id',
    ];

    public function packageMenu()
    {
        return $this->belongsTo(Menu::class, 'package_menu_id');
    }

    public function itemMenu()
    {
        return $this->belongsTo(Menu::class, 'item_menu_id');
    }
}
