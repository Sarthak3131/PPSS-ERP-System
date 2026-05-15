<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MachineSchedule extends Model
{
    /** @use HasFactory<\Database\Factories\MachineScheduleFactory> */
    use HasFactory;

    protected $fillable = [
        'machine_id',
        'production_order_id',
        'scheduled_start',
        'scheduled_end',
        'duration_hours',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_start' => 'datetime',
            'scheduled_end' => 'datetime',
            'duration_hours' => 'decimal:2',
        ];
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function productionOrder(): BelongsTo
    {
        return $this->belongsTo(ProductionOrder::class);
    }
}
