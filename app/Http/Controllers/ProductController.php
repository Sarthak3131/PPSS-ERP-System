<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\ActivityLog;
use App\Models\Product;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['sizes', 'billOfMaterials.inventoryItem']);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('version', 'like', "%{$search}%");
        }

        return ApiResponse::paginated($query->paginate(15), $request, ProductResource::class);
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created Product',
            'entity_type' => 'Product',
            'entity_id' => $product->id,
            'snapshot' => $product->toArray(),
        ]);

        return ApiResponse::resource(
            new ProductResource($product->load(['sizes', 'billOfMaterials.inventoryItem'])),
            'Product created.',
            201
        );
    }

    public function show(Product $product)
    {
        $product->load(['sizes', 'billOfMaterials.inventoryItem']);

        return ApiResponse::resource(new ProductResource($product), 'OK');
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Product',
            'entity_type' => 'Product',
            'entity_id' => $product->id,
            'snapshot' => $product->toArray(),
        ]);

        return ApiResponse::resource(
            new ProductResource($product->load(['sizes', 'billOfMaterials.inventoryItem'])),
            'Product updated.'
        );
    }

    public function destroy(Request $request, Product $product)
    {
        $product->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted Product',
            'entity_type' => 'Product',
            'entity_id' => $product->id,
            'snapshot' => $product->toArray(),
        ]);

        return ApiResponse::success(null, 'Product deleted.');
    }
}
