<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'barcode',
        'mp_article',
        'name',
        'warehouse',
        'date',
        'status',
        'status_date',
        'delivery',
        'payout',
    ];

    protected $casts = [
        'date' => 'date',
        'status_date' => 'date',
        'delivery' => 'decimal:2',
        'payout' => 'decimal:2',
    ];
}
