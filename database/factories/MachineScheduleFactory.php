<?php

namespace Database\Factories;

use App\Models\MachineSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MachineSchedule>
 */
class MachineScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('now', '+2 weeks');
        $end = (clone $start)->modify('+' . fake()->numberBetween(1, 48) . ' hours');
        return [
            'scheduled_start' => $start,
            'scheduled_end' => $end,
            'duration_hours' => fake()->randomFloat(2, 1, 48),
            'status' => fake()->randomElement(['Scheduled', 'Running', 'Completed']),
        ];
    }
}
