<?php

namespace App\Http\Controllers;

use App\Http\Requests\InventoryRequest;
use App\Http\Resources\InventoryResource;
use App\Models\ActivityLog;
use App\Models\InventoryItem;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('item_code', 'like', "%{$search}%")
                ->orWhere('item_name', 'like', "%{$search}%");
        }

        return ApiResponse::paginated($query->paginate(15), $request, InventoryResource::class);
    }

    public function alerts(Request $request)
    {
        $lowStock = InventoryItem::whereColumn('stock_quantity', '<=', 'reorder_level')
            ->where('stock_quantity', '>', 0)
            ->get();
        $outOfStock = InventoryItem::where('stock_quantity', 0)->get();
        $criticalStock = InventoryItem::where('stock_quantity', '<', 10)
            ->where('stock_quantity', '>', 0)
            ->get();

        $map = fn ($items) => $items->map(fn ($i) => (new InventoryResource($i))->resolve($request))->values()->all();

        return ApiResponse::success([
            'low_stock' => $map($lowStock),
            'out_of_stock' => $map($outOfStock),
            'critical_stock' => $map($criticalStock),
        ], 'OK');
    }

    public function store(InventoryRequest $request)
    {
        $item = InventoryItem::create($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created Inventory Item',
            'entity_type' => 'InventoryItem',
            'entity_id' => $item->id,
            'snapshot' => $item->toArray(),
        ]);

        return ApiResponse::resource(new InventoryResource($item), 'Inventory item created.', 201);
    }

    public function show(InventoryItem $inventory)
    {
        return ApiResponse::resource(new InventoryResource($inventory), 'OK');
    }

    public function update(InventoryRequest $request, InventoryItem $inventory)
    {
        $inventory->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Inventory Item',
            'entity_type' => 'InventoryItem',
            'entity_id' => $inventory->id,
            'snapshot' => $inventory->toArray(),
        ]);

        return ApiResponse::resource(new InventoryResource($inventory), 'Inventory item updated.');
    }

    public function destroy(Request $request, InventoryItem $inventory)
    {
        $inventory->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted Inventory Item',
            'entity_type' => 'InventoryItem',
            'entity_id' => $inventory->id,
            'snapshot' => $inventory->toArray(),
        ]);

        return ApiResponse::success(null, 'Inventory item deleted.');
    }
}
