<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'admin_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'payment_method',
        'payment_status',
        'cash_amount',
        'change_amount',
        'qris_code',
        'qris_image',
        'qris_expired_at',
        'payment_gateway_id',
        'paid_at',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'cash_amount' => 'decimal:2',
        'change_amount' => 'decimal:2',
        'qris_expired_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function items()
    {
        return $this->hasMany(TransactionItem::class);
    }
}