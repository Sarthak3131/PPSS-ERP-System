<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ProductionOrder extends Model
{
    /** @use HasFactory<\Database\Factories\ProductionOrderFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_number',
        'product_id',
        'size_id',
        'quantity',
        'priority',
        'supervisor_id',
        'created_by',
        'estimated_hours',
        'status',
        'start_date',
        'due_date',
        'assigned_machine_id',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'due_date' => 'date',
            'estimated_hours' => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedMachine(): BelongsTo
    {
        return $this->belongsTo(Machine::class, 'assigned_machine_id');
    }

    public function machineSchedule(): HasOne
    {
        return $this->hasOne(MachineSchedule::class);
    }
}
