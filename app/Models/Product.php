<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'date',
        'price',
        'category_id',
        'status',
        'description',
        'proof',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
