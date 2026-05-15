<?php

namespace Database\Factories;

use App\Models\ProductionOrder;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductionOrder>
 */
class ProductionOrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $start_date = fake()->dateTimeBetween('-1 week', '+1 week');
        $due_date = (clone $start_date)->modify('+' . fake()->numberBetween(2, 14) . ' days');
        return [
            'order_number' => 'PO-' . fake()->unique()->numberBetween(10000, 99999),
            'quantity' => fake()->numberBetween(100, 5000),
            'priority' => fake()->randomElement(['Low', 'Medium', 'High', 'Critical']),
            'estimated_hours' => fake()->randomFloat(2, 4, 120),
            'status' => fake()->randomElement(['Draft', 'Pending', 'Released', 'In Progress', 'Completed', 'Cancelled']),
            'start_date' => $start_date,
            'due_date' => $due_date,
        ];
    }
}
