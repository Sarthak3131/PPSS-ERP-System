<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionOrderResource extends JsonResource
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
            'order_number' => $this->order_number,
            'product' => new ProductResource($this->whenLoaded('product')),
            'size' => $this->whenLoaded('size'),
            'quantity' => $this->quantity,
            'priority' => $this->priority,
            'supervisor' => $this->whenLoaded('supervisor'),
            'created_by' => $this->whenLoaded('creator'),
            'estimated_hours' => $this->estimated_hours,
            'status' => $this->status,
            'start_date' => $this->start_date,
            'due_date' => $this->due_date,
            'assigned_machine_id' => $this->assigned_machine_id,
            'assigned_machine' => $this->whenLoaded('assignedMachine'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
