<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductionOrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MachineController;
use App\Http\Controllers\MachineScheduleController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SizeController;
use App\Http\Controllers\BillOfMaterialController;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

        // Write Operations (Admin, Planner)
        Route::middleware('role:Admin,Planner')->group(function () {
            Route::apiResource('products', ProductController::class)->except(['index', 'show']);
            Route::apiResource('sizes', SizeController::class)->except(['index', 'show']);
            Route::apiResource('bill-of-materials', BillOfMaterialController::class)->except(['index', 'show']);
            Route::apiResource('inventory', InventoryController::class)->except(['index', 'show']);
            Route::apiResource('orders', ProductionOrderController::class)->except(['index', 'show']);
            Route::post('orders/{order}/cancel', [ProductionOrderController::class, 'cancel']);
            
            Route::apiResource('machines', MachineController::class)->except(['index', 'show']);
            Route::apiResource('schedules', MachineScheduleController::class)->except(['index', 'show']);
            Route::post('schedules/assign', [MachineScheduleController::class, 'assign']);
            Route::post('schedules/{schedule}/remove', [MachineScheduleController::class, 'remove']);
        });

        // Read Operations + Approve/Release (Admin, Planner, Supervisor)
        Route::middleware('role:Admin,Planner,Supervisor')->group(function () {
            Route::get('products', [ProductController::class, 'index']);
            Route::get('products/{product}', [ProductController::class, 'show']);

            Route::get('sizes', [SizeController::class, 'index']);
            Route::get('sizes/{size}', [SizeController::class, 'show']);

            Route::get('bill-of-materials/tree', [BillOfMaterialController::class, 'tree']);
            Route::get('bill-of-materials', [BillOfMaterialController::class, 'index']);
            Route::get('bill-of-materials/{bill_of_material}', [BillOfMaterialController::class, 'show']);
            
            Route::get('inventory-alerts', [InventoryController::class, 'alerts']);
            Route::get('inventory', [InventoryController::class, 'index']);
            Route::get('inventory/{inventory}', [InventoryController::class, 'show']);
            
            Route::get('orders', [ProductionOrderController::class, 'index']);
            Route::get('orders/{order}', [ProductionOrderController::class, 'show']);
            Route::post('orders/{order}/release', [ProductionOrderController::class, 'release']);

            Route::get('machines/utilization', [MachineController::class, 'utilization']);
            Route::get('machines', [MachineController::class, 'index']);
            Route::get('machines/{machine}', [MachineController::class, 'show']);
            
            Route::get('schedules/timeline', [MachineScheduleController::class, 'timeline']);
            Route::get('schedules', [MachineScheduleController::class, 'index']);
            Route::get('schedules/{schedule}', [MachineScheduleController::class, 'show']);

            // Reports
            Route::get('reports/production-summary', [ReportController::class, 'productionSummary']);
            Route::get('reports/production-trend', [ReportController::class, 'productionTrend']);
            Route::get('reports/machine-utilization', [ReportController::class, 'machineUtilization']);
            Route::get('reports/inventory-risk', [ReportController::class, 'inventoryRisk']);
            Route::get('reports/activity-log', [ReportController::class, 'activityLog']);
            Route::get('reports/export/orders', [ReportController::class, 'exportOrders']);
            Route::get('reports/export/inventory', [ReportController::class, 'exportInventory']);
        });
    });
});
