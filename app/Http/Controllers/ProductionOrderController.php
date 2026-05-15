<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductionOrderRequest;
use App\Http\Resources\ProductionOrderResource;
use App\Models\ActivityLog;
use App\Models\BillOfMaterial;
use App\Models\InventoryItem;
use App\Models\ProductionOrder;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductionOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductionOrder::with(['product', 'size', 'supervisor', 'creator', 'assignedMachine']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('order_number', 'like', "%{$search}%");
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('start_date')) {
            $query->whereDate('start_date', '>=', $request->input('start_date'));
        }

        if ($request->has('due_date')) {
            $query->whereDate('due_date', '<=', $request->input('due_date'));
        }

        return ApiResponse::paginated($query->latest('id')->paginate(15), $request, ProductionOrderResource::class);
    }

    public function store(ProductionOrderRequest $request)
    {
        $data = $request->validated();
        $data['order_number'] = 'PO-' . strtoupper(uniqid());
        $data['status'] = 'Draft';
        $data['created_by'] = $request->user()->id;
        $data['supervisor_id'] = $request->user()->id;

        $order = ProductionOrder::create($data);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created Production Order',
            'entity_type' => 'ProductionOrder',
            'entity_id' => $order->id,
            'snapshot' => $order->toArray(),
        ]);

        return ApiResponse::resource(
            new ProductionOrderResource($order->load(['product', 'size', 'supervisor', 'creator', 'assignedMachine'])),
            'Production order created.',
            201
        );
    }

    public function show(ProductionOrder $order)
    {
        return ApiResponse::resource(
            new ProductionOrderResource($order->load(['product', 'size', 'supervisor', 'creator', 'assignedMachine'])),
            'OK'
        );
    }

    public function update(ProductionOrderRequest $request, ProductionOrder $order)
    {
        $order->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Production Order',
            'entity_type' => 'ProductionOrder',
            'entity_id' => $order->id,
            'snapshot' => $order->toArray(),
        ]);

        return ApiResponse::resource(
            new ProductionOrderResource($order->load(['product', 'size', 'supervisor', 'creator', 'assignedMachine'])),
            'Production order updated.'
        );
    }

    public function destroy(Request $request, ProductionOrder $order)
    {
        $order->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted Production Order',
            'entity_type' => 'ProductionOrder',
            'entity_id' => $order->id,
            'snapshot' => $order->toArray(),
        ]);

        return ApiResponse::success(null, 'Production order deleted.');
    }

    public function release(Request $request, ProductionOrder $order)
    {
        if (! in_array($order->status, ['Draft', 'Pending'])) {
            return ApiResponse::failure('Only Draft or Pending orders can be released.', (object) [], 400);
        }

        try {
            DB::transaction(function () use ($request, $order) {
                $order->loadMissing(['product.billOfMaterials.inventoryItem']);

                $this->deductInventoryForRelease($order);

                $order->update(['status' => 'Released']);

                ActivityLog::create([
                    'user_id' => $request->user()->id,
                    'action_type' => 'Released Production Order',
                    'entity_type' => 'ProductionOrder',
                    'entity_id' => $order->id,
                    'snapshot' => $order->fresh()->toArray(),
                ]);
            });
        } catch (ValidationException $exception) {
            $message = collect($exception->errors())->flatten()->first() ?? 'Inventory validation failed.';

            return ApiResponse::failure($message, (object) [], 422);
        }

        return ApiResponse::resource(
            new ProductionOrderResource($order->load(['product', 'size', 'supervisor', 'creator', 'assignedMachine'])),
            'Production order released.'
        );
    }

    public function cancel(Request $request, ProductionOrder $order)
    {
        if ($order->status === 'Completed') {
            return ApiResponse::failure('Completed orders cannot be cancelled.', (object) [], 400);
        }

        $order->update(['status' => 'Cancelled']);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Cancelled Production Order',
            'entity_type' => 'ProductionOrder',
            'entity_id' => $order->id,
            'snapshot' => $order->toArray(),
        ]);

        return ApiResponse::resource(
            new ProductionOrderResource($order->load(['product', 'size', 'supervisor', 'creator', 'assignedMachine'])),
            'Production order cancelled.'
        );
    }

    private function deductInventoryForRelease(ProductionOrder $order): void
    {
        $billOfMaterials = $order->product?->billOfMaterials ?? collect();

        if ($billOfMaterials->isEmpty()) {
            return;
        }

        $requirements = $billOfMaterials
            ->groupBy('inventory_item_id')
            ->map(function ($lines) use ($order) {
                $perUnit = (float) $lines->sum('quantity_required');

                return $perUnit * (int) $order->quantity;
            });

        $inventoryItems = InventoryItem::query()
            ->whereIn('id', $requirements->keys())
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($requirements as $inventoryItemId => $requiredQuantity) {
            $bomLine = $billOfMaterials->firstWhere('inventory_item_id', $inventoryItemId);
            $componentName = $bomLine?->inventoryItem?->item_name ?? 'Unknown component';
            $inventoryItem = $inventoryItems->get($inventoryItemId);

            if (! $inventoryItem) {
                throw ValidationException::withMessages([
                    'inventory' => "Inventory item missing for component {$componentName}.",
                ]);
            }

            $deduction = (int) ceil($requiredQuantity);
            $currentStock = (int) $inventoryItem->stock_quantity;

            if ($currentStock < $deduction) {
                throw ValidationException::withMessages([
                    'inventory' => "Insufficient stock for component {$componentName}.",
                ]);
            }

            $inventoryItem->decrement('stock_quantity', $deduction);
        }
    }
}
