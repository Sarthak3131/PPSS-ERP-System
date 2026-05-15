<?php

namespace Tests\Feature;

use App\Http\Controllers\ProductionOrderController;
use App\Models\BillOfMaterial;
use App\Models\InventoryItem;
use App\Models\ProductionOrder;
use App\Models\Product;
use App\Models\Size;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Tests\TestCase;

class ProductionOrderInventoryDeductionTest extends TestCase
{
    use RefreshDatabase;

    private function makeReleaseRequest(User $user): Request
    {
        $request = Request::create('/api/v1/orders/1/release', 'POST');
        $request->setUserResolver(fn () => $user);

        return $request;
    }

    public function test_release_deducts_bom_inventory_stock(): void
    {
        $user = User::factory()->create(['role' => 'Planner']);
        $product = Product::factory()->create();
        $size = Size::factory()->create(['product_id' => $product->id]);
        $inventoryItem = InventoryItem::factory()->create(['stock_quantity' => 10]);

        BillOfMaterial::create([
            'product_id' => $product->id,
            'inventory_item_id' => $inventoryItem->id,
            'quantity_required' => 2,
            'unit' => 'pieces',
        ]);

        $order = ProductionOrder::create([
            'order_number' => 'PO-TEST-1001',
            'product_id' => $product->id,
            'size_id' => $size->id,
            'quantity' => 3,
            'priority' => 'Medium',
            'supervisor_id' => $user->id,
            'created_by' => $user->id,
            'estimated_hours' => 4,
            'status' => 'Draft',
            'start_date' => now()->addDay()->toDateString(),
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        $response = app(ProductionOrderController::class)->release($this->makeReleaseRequest($user), $order);

        $this->assertSame(200, $response->status());
        $this->assertSame('Released', $order->fresh()->status);
        $this->assertSame(4, $inventoryItem->fresh()->stock_quantity);
    }

    public function test_release_blocks_when_stock_is_insufficient_and_rolls_back(): void
    {
        $user = User::factory()->create(['role' => 'Planner']);
        $product = Product::factory()->create();
        $size = Size::factory()->create(['product_id' => $product->id]);
        $inventoryItem = InventoryItem::factory()->create(['stock_quantity' => 5]);

        BillOfMaterial::create([
            'product_id' => $product->id,
            'inventory_item_id' => $inventoryItem->id,
            'quantity_required' => 2,
            'unit' => 'pieces',
        ]);

        $order = ProductionOrder::create([
            'order_number' => 'PO-TEST-1002',
            'product_id' => $product->id,
            'size_id' => $size->id,
            'quantity' => 3,
            'priority' => 'Medium',
            'supervisor_id' => $user->id,
            'created_by' => $user->id,
            'estimated_hours' => 4,
            'status' => 'Draft',
            'start_date' => now()->addDay()->toDateString(),
            'due_date' => now()->addDays(3)->toDateString(),
        ]);

        $response = app(ProductionOrderController::class)->release($this->makeReleaseRequest($user), $order);

        $this->assertSame(422, $response->status());
        $this->assertSame('Draft', $order->fresh()->status);
        $this->assertSame(5, $inventoryItem->fresh()->stock_quantity);
        $this->assertStringContainsString('Insufficient stock for component', $response->getContent());
    }
}
