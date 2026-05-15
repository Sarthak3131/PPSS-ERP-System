<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    /** @use HasFactory<\Database\Factories\InventoryItemFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'item_code',
        'item_name',
        'category',
        'stock_quantity',
        'unit',
        'reorder_level',
        'supplier',
        'lead_time_days',
        'status',
    ];

    public function billOfMaterials(): HasMany
    {
        return $this->hasMany(BillOfMaterial::class);
    }
}
