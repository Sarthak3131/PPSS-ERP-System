<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'machine_id' => $this->machine_id,
            'machine' => new MachineResource($this->whenLoaded('machine')),
            'production_order' => new ProductionOrderResource($this->whenLoaded('productionOrder')),
            'scheduled_start' => $this->scheduled_start,
            'scheduled_end' => $this->scheduled_end,
            'actual_start' => $this->actual_start,
            'actual_end' => $this->actual_end,
            'status' => $this->status,
            'operator' => $this->whenLoaded('operator'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
