<?php

namespace App\Http\Controllers;

use App\Http\Resources\MachineResource;
use App\Models\ActivityLog;
use App\Models\InventoryItem;
use App\Models\Machine;
use App\Models\ProductionOrder;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    public function productionSummary(Request $request)
    {
        $timeRange = $request->query('time_range');
        $plant = $request->query('plant');

        $daysMap = ['7d' => 7, '14d' => 14, '30d' => 30];
        $days = $daysMap[$timeRange] ?? null;

        $query = ProductionOrder::query();
        if ($plant) {
            $query->where('plant', $plant);
        }
        if ($days) {
            $start = now()->subDays($days)->startOfDay();
            $end = now()->endOfDay();
            $query->whereBetween('created_at', [$start, $end]);
        }

        $orders = $query->get();

        $overdueOrders = ProductionOrder::query()
            ->when($plant, fn($q) => $q->where('plant', $plant))
            ->whereNotIn('status', ['Completed', 'Cancelled'])
            ->whereNotNull('due_date')
            ->when($days, fn($q) => $q->whereDate('due_date', '<', now()->toDateString()))
            ->count();

        return ApiResponse::success([
            'total_orders' => $orders->count(),
            'draft' => $orders->where('status', 'Draft')->count(),
            'pending' => $orders->where('status', 'Pending')->count(),
            'released' => $orders->where('status', 'Released')->count(),
            'in_progress' => $orders->where('status', 'In Progress')->count(),
            'completed' => $orders->where('status', 'Completed')->count(),
            'cancelled' => $orders->where('status', 'Cancelled')->count(),
            'overdue_orders' => $overdueOrders,
        ], 'OK');
    }

    public function productionTrend(Request $request)
    {
        $timeRange = $request->query('time_range');
        $daysMap = ['7d' => 6, '14d' => 13, '30d' => 29];
        $range = $daysMap[$timeRange] ?? 6;

        $data = collect(range($range, 0))->map(function (int $daysAgo) {
            $day = now()->subDays($daysAgo)->startOfDay();
            $end = $day->copy()->endOfDay();
            $output = ProductionOrder::whereBetween('created_at', [$day, $end])->count();

            return [
                'day' => $day->format('D'),
                'date' => $day->toDateString(),
                'output' => $output,
            ];
        })->values()->all();

        return ApiResponse::success($data, 'OK');
    }

    public function machineUtilization(Request $request)
    {
        $timeRange = $request->query('time_range');
        $plant = $request->query('plant');
        $daysMap = ['7d' => 7, '14d' => 14, '30d' => 30];
        $days = $daysMap[$timeRange] ?? null;

        $machines = Machine::with(['machineSchedules' => function ($query) use ($days) {
            $query->whereIn('status', ['Scheduled', 'In Progress']);
            if ($days) {
                $start = now()->subDays($days)->startOfDay();
                $end = now()->endOfDay();
                $query->whereBetween('created_at', [$start, $end]);
            }
        }])->when($plant, fn($q) => $q->where('plant', $plant))->get();

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

    public function inventoryRisk(Request $request)
    {
        $plant = $request->query('plant');

        $inventoryQuery = InventoryItem::query();
        if ($plant) {
            $inventoryQuery->where('plant', $plant);
        }
        $inventory = $inventoryQuery->get();

        $lowStock = $inventory->filter(function ($item) {
            return $item->stock_quantity <= $item->reorder_level && $item->stock_quantity > ($item->reorder_level / 2);
        })->values();

        $criticalStock = $inventory->filter(function ($item) {
            return $item->stock_quantity <= ($item->reorder_level / 2) && $item->stock_quantity > 0;
        })->values();

        $outOfStock = $inventory->filter(function ($item) {
            return $item->stock_quantity <= 0;
        })->values();

        $map = fn ($items) => $items->map(fn ($i) => (new InventoryResource($i))->resolve($request))->values()->all();

        return ApiResponse::success([
            'low_stock' => $map($lowStock),
            'critical_stock' => $map($criticalStock),
            'out_of_stock' => $map($outOfStock),
        ], 'OK');
    }

    public function activityLog(Request $request)
    {
        $timeRange = $request->query('time_range');
        $daysMap = ['7d' => 7, '14d' => 14, '30d' => 30];
        $days = $daysMap[$timeRange] ?? null;

        $logsQuery = ActivityLog::with('user')->orderBy('created_at', 'desc');
        if ($days) {
            $start = now()->subDays($days)->startOfDay();
            $end = now()->endOfDay();
            $logsQuery->whereBetween('created_at', [$start, $end]);
        }

        $logs = $logsQuery->paginate(20);

        return ApiResponse::paginatedMapped($logs, function ($log) {
            return [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user_name' => $log->user?->name,
                'action_type' => $log->action_type,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'snapshot' => $log->snapshot,
                'created_at' => $log->created_at,
            ];
        });
    }

    public function exportOrders(Request $request)
    {
        $timeRange = $request->query('time_range');
        $plant = $request->query('plant');
        $daysMap = ['7d' => 7, '14d' => 14, '30d' => 30];
        $days = $daysMap[$timeRange] ?? null;

        $ordersQuery = ProductionOrder::with(['product', 'size', 'assignedMachine']);
        if ($plant) $ordersQuery->where('plant', $plant);
        if ($days) {
            $start = now()->subDays($days)->startOfDay();
            $end = now()->endOfDay();
            $ordersQuery->whereBetween('created_at', [$start, $end]);
        }
        $orders = $ordersQuery->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=production_orders.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['ID', 'Order Number', 'Product', 'Size', 'Quantity', 'Status', 'Start Date', 'Due Date'];

        $callback = function () use ($orders, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                $row = [
                    $order->id,
                    $order->order_number,
                    $order->product ? $order->product->name : '',
                    $order->size ? $order->size->size_name : '',
                    $order->quantity,
                    $order->status,
                    $order->start_date,
                    $order->due_date,
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Exported Reports',
            'entity_type' => 'ProductionOrder',
            'entity_id' => null,
            'snapshot' => ['report' => 'Production Orders CSV Export'],
        ]);

        return Response::stream($callback, 200, $headers);
    }

    public function exportInventory(Request $request)
    {
        $plant = $request->query('plant');
        $inventoryQuery = InventoryItem::query();
        if ($plant) $inventoryQuery->where('plant', $plant);
        $inventory = $inventoryQuery->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=inventory.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['ID', 'Item Code', 'Item Name', 'Category', 'Quantity', 'Unit', 'Reorder Level'];

        $callback = function () use ($inventory, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($inventory as $item) {
                $row = [
                    $item->id,
                    $item->item_code,
                    $item->item_name,
                    $item->category,
                    $item->stock_quantity,
                    $item->unit,
                    $item->reorder_level,
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Exported Reports',
            'entity_type' => 'InventoryItem',
            'entity_id' => null,
            'snapshot' => ['report' => 'Inventory CSV Export'],
        ]);

        return Response::stream($callback, 200, $headers);
    }
}
