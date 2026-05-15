<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Machine extends Model
{
    /** @use HasFactory<\Database\Factories\MachineFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'machine_code',
        'name',
        'capacity',
        'status',
        'efficiency_rating',
    ];

    public function productionOrders(): HasMany
    {
        return $this->hasMany(ProductionOrder::class, 'assigned_machine_id');
    }

    public function machineSchedules(): HasMany
    {
        return $this->hasMany(MachineSchedule::class);
    }
}
