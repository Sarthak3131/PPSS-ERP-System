<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Classic Polo Shirt', 'Denim Jeans', 'Safety Vest', 'Worker Jacket', 'Cotton T-Shirt']),
            'version' => 'v' . fake()->randomDigitNotNull() . '.0',
            'description' => fake()->sentence(),
        ];
    }
}
