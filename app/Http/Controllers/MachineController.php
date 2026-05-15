<?php

namespace App\Http\Controllers;

use App\Http\Requests\MachineRequest;
use App\Http\Resources\MachineResource;
use App\Models\ActivityLog;
use App\Models\Machine;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class MachineController extends Controller
{
    public function index(Request $request)
    {
        $query = Machine::query();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('min_capacity')) {
            $query->where('capacity', '>=', $request->input('min_capacity'));
        }

        return ApiResponse::paginated($query->paginate(15), $request, MachineResource::class);
    }

    public function store(MachineRequest $request)
    {
        $machine = Machine::create($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Created Machine',
            'entity_type' => 'Machine',
            'entity_id' => $machine->id,
            'snapshot' => $machine->toArray(),
        ]);

        return ApiResponse::resource(new MachineResource($machine), 'Machine created.', 201);
    }

    public function show(Machine $machine)
    {
        return ApiResponse::resource(new MachineResource($machine->load('machineSchedules')), 'OK');
    }

    public function update(MachineRequest $request, Machine $machine)
    {
        $machine->update($request->validated());

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Machine',
            'entity_type' => 'Machine',
            'entity_id' => $machine->id,
            'snapshot' => $machine->toArray(),
        ]);

        return ApiResponse::resource(new MachineResource($machine), 'Machine updated.');
    }

    public function destroy(Request $request, Machine $machine)
    {
        $machine->delete();

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Deleted Machine',
            'entity_type' => 'Machine',
            'entity_id' => $machine->id,
            'snapshot' => $machine->toArray(),
        ]);

        return ApiResponse::success(null, 'Machine deleted.');
    }

    public function utilization(Request $request)
    {
        $machines = Machine::with(['machineSchedules' => function ($query) {
            $query->whereIn('status', ['Scheduled', 'In Progress']);
        }])->get();

        $utilizationData = $machines->map(function ($machine) use ($request) {
            $usedCapacity = $machine->machineSchedules->count();
            $capacity = max(1, (int) ($machine->capacity ?? 0));
            $utilizationPercentage = min(100, round(($usedCapacity / $capacity) * 100, 2));
            $availableCapacity = max(0, $capacity - $usedCapacity);

            return [
                'machine' => (new MachineResource($machine))->resolve($request),
                'capacity' => $capacity,
                'used_capacity' => $usedCapacity,
                'available_capacity' => $availableCapacity,
                'utilization_percentage' => $utilizationPercentage,
            ];
        })->values()->all();

        return ApiResponse::success($utilizationData, 'OK');
    }
}
