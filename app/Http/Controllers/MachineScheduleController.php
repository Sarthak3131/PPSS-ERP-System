<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignOrderRequest;
use App\Http\Resources\MachineScheduleResource;
use App\Models\ActivityLog;
use App\Models\Machine;
use App\Models\MachineSchedule;
use App\Models\ProductionOrder;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class MachineScheduleController extends Controller
{
    public function index(Request $request)
    {
        $query = MachineSchedule::with(['machine', 'productionOrder.product', 'productionOrder.size', 'productionOrder.supervisor', 'productionOrder.creator', 'productionOrder.assignedMachine']);

        if ($request->has('machine_id')) {
            $query->where('machine_id', $request->input('machine_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        return ApiResponse::paginated($query->paginate(15), $request, MachineScheduleResource::class);
    }

    public function show(MachineSchedule $schedule)
    {
        return ApiResponse::resource(
            new MachineScheduleResource($schedule->load(['machine', 'productionOrder.product', 'productionOrder.size', 'productionOrder.supervisor', 'productionOrder.creator', 'productionOrder.assignedMachine'])),
            'OK'
        );
    }

    public function update(Request $request, MachineSchedule $schedule)
    {
        $validated = $request->validate([
            'machine_id' => 'sometimes|required|exists:machines,id',
            'scheduled_start' => 'sometimes|required|date',
            'scheduled_end' => 'sometimes|required|date|after:scheduled_start',
        ]);

        $machineId = $validated['machine_id'] ?? $schedule->machine_id;
        $scheduledStart = $validated['scheduled_start'] ?? $schedule->scheduled_start;
        $scheduledEnd = $validated['scheduled_end'] ?? $schedule->scheduled_end;

        $machine = Machine::findOrFail($machineId);
        $order = $schedule->productionOrder;

        if ($machine->status === 'Maintenance' || $machine->status === 'Offline') {
            return ApiResponse::failure('Machine is currently unavailable.', (object) [], 400);
        }

        if ($order && in_array($order->status, ['Completed', 'Cancelled'])) {
            return ApiResponse::failure('Cannot reschedule a Completed or Cancelled order.', (object) [], 400);
        }

        $overlap = MachineSchedule::where('machine_id', $machine->id)
            ->where('id', '!=', $schedule->id)
            ->where(function ($query) use ($scheduledStart, $scheduledEnd) {
                $query->whereBetween('scheduled_start', [$scheduledStart, $scheduledEnd])
                    ->orWhereBetween('scheduled_end', [$scheduledStart, $scheduledEnd])
                    ->orWhere(function ($q) use ($scheduledStart, $scheduledEnd) {
                        $q->where('scheduled_start', '<=', $scheduledStart)
                            ->where('scheduled_end', '>=', $scheduledEnd);
                    });
            })->exists();

        if ($overlap) {
            return ApiResponse::failure('Schedule overlaps with an existing assignment on this machine.', (object) [], 400);
        }

        $schedule->update([
            'machine_id' => $machine->id,
            'scheduled_start' => $scheduledStart,
            'scheduled_end' => $scheduledEnd,
        ]);

        if ($order) {
            $order->update([
                'assigned_machine_id' => $machine->id,
                'status' => $order->status === 'Draft' ? 'Pending' : $order->status,
            ]);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Updated Machine Schedule',
            'entity_type' => 'MachineSchedule',
            'entity_id' => $schedule->id,
            'snapshot' => $schedule->toArray(),
        ]);

        return ApiResponse::resource(
            new MachineScheduleResource($schedule->load(['machine', 'productionOrder.product', 'productionOrder.size', 'productionOrder.supervisor', 'productionOrder.creator', 'productionOrder.assignedMachine'])),
            'Schedule updated.'
        );
    }

    public function assign(AssignOrderRequest $request)
    {
        $machine = Machine::findOrFail($request->machine_id);
        $order = ProductionOrder::findOrFail($request->production_order_id);

        if ($machine->status === 'Maintenance' || $machine->status === 'Offline') {
            return ApiResponse::failure('Machine is currently unavailable.', (object) [], 400);
        }

        if (in_array($order->status, ['Completed', 'Cancelled'])) {
            return ApiResponse::failure('Cannot assign a Completed or Cancelled order.', (object) [], 400);
        }

        if ($order->assigned_machine_id) {
            return ApiResponse::failure('Order is already assigned to a machine.', (object) [], 400);
        }

        $overlap = MachineSchedule::where('machine_id', $machine->id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('scheduled_start', [$request->scheduled_start, $request->scheduled_end])
                    ->orWhereBetween('scheduled_end', [$request->scheduled_start, $request->scheduled_end])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('scheduled_start', '<=', $request->scheduled_start)
                            ->where('scheduled_end', '>=', $request->scheduled_end);
                    });
            })->exists();

        if ($overlap) {
            return ApiResponse::failure('Schedule overlaps with an existing assignment on this machine.', (object) [], 400);
        }

        $schedule = MachineSchedule::create([
            'machine_id' => $machine->id,
            'production_order_id' => $order->id,
            'scheduled_start' => $request->scheduled_start,
            'scheduled_end' => $request->scheduled_end,
            'status' => 'Scheduled',
        ]);

        $order->update([
            'assigned_machine_id' => $machine->id,
            'status' => $order->status === 'Draft' ? 'Pending' : $order->status,
        ]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Assigned Order to Machine',
            'entity_type' => 'MachineSchedule',
            'entity_id' => $schedule->id,
            'snapshot' => $schedule->toArray(),
        ]);

        return ApiResponse::resource(
            new MachineScheduleResource($schedule->load(['machine', 'productionOrder.product', 'productionOrder.size', 'productionOrder.supervisor', 'productionOrder.creator', 'productionOrder.assignedMachine'])),
            'Order assigned.',
            201
        );
    }

    public function remove(Request $request, MachineSchedule $schedule)
    {
        $order = $schedule->productionOrder;

        $schedule->delete();

        if ($order) {
            $order->update(['assigned_machine_id' => null]);
        }

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Removed Order from Machine',
            'entity_type' => 'MachineSchedule',
            'entity_id' => $schedule->id,
            'snapshot' => $schedule->toArray(),
        ]);

        return ApiResponse::success(null, 'Schedule removed successfully.');
    }

    public function timeline(Request $request)
    {
        $machines = Machine::with(['machineSchedules' => function ($query) {
            $query->whereIn('status', ['Scheduled', 'In Progress'])
                ->with(['productionOrder.product']);
        }])->get();

        $timeline = $machines->map(function ($machine) {
            return [
                'machine' => [
                    'id' => $machine->id,
                    'name' => $machine->name,
                    'machine_code' => $machine->machine_code,
                    'capacity' => $machine->capacity,
                    'status' => $machine->status,
                ],
                'assigned_orders' => $machine->machineSchedules->map(function ($schedule) {
                    $order = $schedule->productionOrder;

                    return [
                        'schedule_id' => $schedule->id,
                        'order_number' => $order?->order_number ?? 'Unknown',
                        'product_name' => $order?->product?->name,
                        'scheduled_start' => $schedule->scheduled_start,
                        'scheduled_end' => $schedule->scheduled_end,
                        'status' => $schedule->status,
                    ];
                })->values()->all(),
            ];
        })->values()->all();

        return ApiResponse::success($timeline, 'OK');
    }
}
