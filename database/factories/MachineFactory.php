<?php

namespace Database\Factories;

use App\Models\Machine;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Machine>
 */
class MachineFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'machine_code' => 'MAC-' . fake()->unique()->numberBetween(100, 999),
            'name' => fake()->randomElement(['Cutting Line A', 'Stitching Station 1', 'Finishing Line', 'Dyeing Vat', 'Assembly Line B']),
            'capacity' => fake()->randomElement([400, 800, 1200, 2000]),
            'status' => fake()->randomElement(['Running', 'Idle', 'Maintenance']),
            'efficiency_rating' => fake()->numberBetween(75, 100),
        ];
    }
}
