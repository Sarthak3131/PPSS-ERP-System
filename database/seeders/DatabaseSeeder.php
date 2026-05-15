<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Size;
use App\Models\InventoryItem;
use App\Models\BillOfMaterial;
use App\Models\Machine;
use App\Models\ProductionOrder;
use App\Models\MachineSchedule;
use App\Models\ActivityLog;
use App\Models\Notification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Users
        $admin = User::factory()->create(['name' => 'Admin User', 'email' => 'admin@erp.com', 'password' => Hash::make('password'), 'role' => 'Admin']);
        $planner = User::factory()->create(['name' => 'Planner User', 'email' => 'planner@erp.com', 'password' => Hash::make('password'), 'role' => 'Planner']);
        $supervisor = User::factory()->create(['name' => 'Supervisor User', 'email' => 'supervisor@erp.com', 'password' => Hash::make('password'), 'role' => 'Supervisor']);
        
        $supervisors = collect([$supervisor])->merge(User::factory()->count(2)->create(['role' => 'Supervisor']));

        // Inventory
        $inventoryItems = InventoryItem::factory()->count(20)->create();

        // Products, Sizes, BOMs
        Product::factory()->count(10)->create()->each(function ($product) use ($inventoryItems) {
            Size::factory()->count(3)->create(['product_id' => $product->id]);
            
            $components = $inventoryItems->random(3);
            foreach ($components as $component) {
                BillOfMaterial::factory()->create([
                    'product_id' => $product->id,
                    'inventory_item_id' => $component->id,
                ]);
            }
        });

        // Machines
        $machines = Machine::factory()->count(5)->create();

        // Production Orders
        $products = Product::with('sizes')->get();
        ProductionOrder::factory()->count(50)->make()->each(function ($order) use ($products, $machines, $supervisors, $planner) {
            $product = $products->random();
            $order->product_id = $product->id;
            $order->size_id = $product->sizes->random()->id;
            $order->supervisor_id = $supervisors->random()->id;
            $order->created_by = $planner->id;
            $order->assigned_machine_id = $order->status !== 'Pending' ? $machines->random()->id : null;
            $order->save();

            if ($order->assigned_machine_id) {
                MachineSchedule::factory()->create([
                    'machine_id' => $order->assigned_machine_id,
                    'production_order_id' => $order->id,
                ]);
            }
        });

        // Activity Logs
        ActivityLog::factory()->count(20)->create(['user_id' => $planner->id]);

        // Notifications
        Notification::factory()->count(15)->create(['user_id' => $admin->id]);
    }
}
