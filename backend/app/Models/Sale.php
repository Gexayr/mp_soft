<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    use HasFactory;

    protected $table = 'sales';

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
        'date' => 'date:Y-m-d',
        'status_date' => 'date:Y-m-d',
        'delivery' => 'decimal:2',
        'payout' => 'decimal:2',
    ];
}
