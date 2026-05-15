<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->select('id', 'message', 'priority', 'reference_type', 'reference_id', 'read_at', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return ApiResponse::paginatedMapped($notifications, function (Notification $n) {
            return [
                'id' => $n->id,
                'message' => $n->message,
                'priority' => $n->priority,
                'reference_type' => $n->reference_type,
                'reference_id' => $n->reference_id,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ];
        });
    }

    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);

            ActivityLog::create([
                'user_id' => $request->user()->id,
                'action_type' => 'Read Notification',
                'entity_type' => 'Notification',
                'entity_id' => $notification->id,
                'snapshot' => $notification->toArray(),
            ]);
        }

        return ApiResponse::success(null, 'Notification marked as read.');
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action_type' => 'Read All Notifications',
            'entity_type' => 'Notification',
            'entity_id' => null,
            'snapshot' => ['action' => 'marked all read'],
        ]);

        return ApiResponse::success(null, 'All notifications marked as read.');
    }

    public function destroy(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);
        $notification->delete();

        return ApiResponse::success(null, 'Notification deleted.');
    }
}
