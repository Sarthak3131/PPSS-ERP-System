<?php

namespace Database\Factories;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryItem>
 */
class InventoryItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'item_code' => 'INV-' . fake()->unique()->numberBetween(1000, 9999),
            'item_name' => fake()->randomElement(['Cotton Thread', 'Poly Blend Fabric', 'Metal Zipper', 'Plastic Buttons', 'Dye Chemical']),
            'category' => fake()->randomElement(['raw_material', 'packaging', 'component', 'consumable', 'finished_good']),
            'stock_quantity' => fake()->numberBetween(50, 5000),
            'unit' => fake()->randomElement(['kg', 'meters', 'pieces', 'liters']),
            'reorder_level' => fake()->numberBetween(100, 500),
            'supplier' => fake()->company(),
            'lead_time_days' => fake()->numberBetween(2, 14),
            'status' => 'Active',
        ];
    }
}
