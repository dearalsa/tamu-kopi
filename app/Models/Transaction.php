<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'cash_amount' => 'decimal:2',
        'change' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(Admin::class, 'user_id');
    }

    public function items()
    {
        return $this->hasMany(TransactionDetail::class, 'transaction_id');
    }

    public function getFormattedDateAttribute()
    {
        return $this->created_at->translatedFormat('d M Y');
    }

    public function getFormattedTimeAttribute()
    {
        return $this->created_at->format('H:i');
    }
}
