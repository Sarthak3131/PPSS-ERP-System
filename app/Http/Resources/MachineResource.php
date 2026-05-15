<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $capacity = (int) ($this->capacity ?? 0);
        $eff = $this->efficiency_rating;
        $efficiencyNormalized = is_numeric($eff) && (float) $eff <= 1.0 ? (float) $eff : ((float) $eff) / 100;

        return [
            'id' => $this->id,
            'machine_code' => $this->machine_code,
            'name' => $this->name,
            'capacity' => $capacity,
            'capacity_per_hour' => $capacity,
            'status' => $this->status,
            'efficiency_rating' => $this->efficiency_rating,
            'efficiency_normalized' => round(min(1, max(0, $efficiencyNormalized)), 4),
            'machine_schedules' => MachineScheduleResource::collection($this->whenLoaded('machineSchedules')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
