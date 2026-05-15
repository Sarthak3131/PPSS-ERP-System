<?php

namespace Database\Factories;

use App\Models\BillOfMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BillOfMaterial>
 */
class BillOfMaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quantity_required' => fake()->randomFloat(2, 0.5, 10),
            'unit' => fake()->randomElement(['kg', 'meters', 'pieces']),
        ];
    }
}
