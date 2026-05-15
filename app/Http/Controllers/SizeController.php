<?php

namespace App\Http\Controllers;

use App\Http\Requests\SizeRequest;
use App\Http\Resources\SizeResource;
use App\Models\ActivityLog;
use App\Models\Size;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SizeController extends Controller
{
    public function index(Request $request)
    {
        $query = Size::with('product')->orderBy('size_name');

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->integer('product_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('size_name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhereHas('product', function ($pq) use ($search) {
                        $pq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        return ApiResponse::paginated($query->paginate(20), $request, SizeResource::class);
    }

    public function store(SizeRequest $request)
    {
        $size = Size::create($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created Size',
            'entity_type' => 'Size',
            'entity_id' => $size->id,
            'snapshot' => $size->toArray(),
        ]);

        return ApiResponse::resource(
            new SizeResource($size->load('product')),
            'Size created.',
            201
        );
    }

    public function show(Size $size)
    {
        return ApiResponse::resource(new SizeResource($size->load('product')), 'OK');
    }

    public function update(SizeRequest $request, Size $size)
    {
        $size->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Size',
            'entity_type' => 'Size',
            'entity_id' => $size->id,
            'snapshot' => $size->toArray(),
        ]);

        return ApiResponse::resource(new SizeResource($size->load('product')), 'Size updated.');
    }

    public function destroy(Request $request, Size $size)
    {
        $size->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted Size',
            'entity_type' => 'Size',
            'entity_id' => $size->id,
            'snapshot' => $size->toArray(),
        ]);

        return ApiResponse::success(null, 'Size deleted.');
    }
}
