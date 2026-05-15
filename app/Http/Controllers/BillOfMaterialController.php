<?php

namespace App\Http\Controllers;

use App\Http\Requests\BillOfMaterialRequest;
use App\Http\Resources\BillOfMaterialResource;
use App\Models\ActivityLog;
use App\Models\BillOfMaterial;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class BillOfMaterialController extends Controller
{
    /**
     * Tree grouped by product for BOM UI (read-only shape, data from DB).
     */
    public function tree()
    {
        $products = Product::query()
            ->with(['billOfMaterials' => function ($q) {
                $q->orderBy('id')->with('inventoryItem');
            }])
            ->orderBy('name')
            ->get();

        $data = $products->map(function (Product $product) {
            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'version' => $product->version,
                'lines' => $product->billOfMaterials->map(function (BillOfMaterial $line) {
                    $item = $line->inventoryItem;

                    return [
                        'id' => $line->id,
                        'quantity_required' => (string) $line->quantity_required,
                        'unit' => $line->unit,
                        'component_name' => $item ? $item->item_name : 'Unknown item',
                        'item_code' => $item ? $item->item_code : null,
                        'inventory_item_id' => $line->inventory_item_id,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        return ApiResponse::success($data, 'OK');
    }

    public function index(Request $request)
    {
        $query = BillOfMaterial::with(['product', 'inventoryItem'])->orderBy('product_id')->orderBy('id');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        return ApiResponse::paginated($query->paginate(25), $request, BillOfMaterialResource::class);
    }

    public function store(BillOfMaterialRequest $request)
    {
        $bom = BillOfMaterial::create($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created BOM Line',
            'entity_type' => 'BillOfMaterial',
            'entity_id' => $bom->id,
            'snapshot' => $bom->toArray(),
        ]);

        return ApiResponse::resource(
            new BillOfMaterialResource($bom->load(['product', 'inventoryItem'])),
            'BOM line created.',
            201
        );
    }

    public function show(BillOfMaterial $billOfMaterial)
    {
        return ApiResponse::resource(
            new BillOfMaterialResource($billOfMaterial->load(['product', 'inventoryItem'])),
            'OK'
        );
    }

    public function update(BillOfMaterialRequest $request, BillOfMaterial $billOfMaterial)
    {
        $billOfMaterial->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated BOM Line',
            'entity_type' => 'BillOfMaterial',
            'entity_id' => $billOfMaterial->id,
            'snapshot' => $billOfMaterial->toArray(),
        ]);

        return ApiResponse::resource(
            new BillOfMaterialResource($billOfMaterial->load(['product', 'inventoryItem'])),
            'BOM line updated.'
        );
    }

    public function destroy(Request $request, BillOfMaterial $billOfMaterial)
    {
        $billOfMaterial->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted BOM Line',
            'entity_type' => 'BillOfMaterial',
            'entity_id' => $billOfMaterial->id,
            'snapshot' => $billOfMaterial->toArray(),
        ]);

        return ApiResponse::success(null, 'BOM line deleted.');
    }
}
