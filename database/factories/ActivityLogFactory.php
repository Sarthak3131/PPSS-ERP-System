<?php

namespace Database\Factories;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ActivityLog>
 */
class ActivityLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'action_type' => fake()->randomElement(['Created Order', 'Released Order', 'Updated Machine']),
            'description' => fake()->sentence(),
            'snapshot' => ['status' => fake()->word()],
        ];
    }
}
