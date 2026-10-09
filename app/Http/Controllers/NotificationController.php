<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationController extends Controller
{
    /**
     * Display notifications belonging to the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = Notification::with('sender')
            ->where('receiver_user_id', $user->id)
            ->latest('created_at')
            ->paginate(15);

        return response()->json([
            'message' => 'Notifications retrieved successfully.',
            'data' => $notifications,
        ], 200);
    }

    /**
     * Get the unread notification count.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Notification::where(
            'receiver_user_id',
            $user->id
        )
            ->where('is_read', false)
            ->count();

        return response()->json([
            'message' => 'Unread notification count retrieved successfully.',
            'unread_count' => $count,
        ], 200);
    }

    /**
     * Display a specific notification belonging to the user.
     */
    public function show(
        Request $request,
        int $id
    ): JsonResponse {
        $notification = Notification::with('sender')
            ->where('id', $id)
            ->where('receiver_user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json([
            'message' => 'Notification retrieved successfully.',
            'data' => $notification,
        ], 200);
    }

    /**
     * Mark one notification as read.
     */
    public function markAsRead(
        Request $request,
        int $id
    ): JsonResponse {
        $notification = Notification::where('id', $id)
            ->where('receiver_user_id', $request->user()->id)
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
        ]);

        return response()->json([
            'message' => 'Notification marked as read.',
            'data' => $notification->fresh('sender'),
        ], 200);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::where(
            'receiver_user_id',
            $request->user()->id
        )
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'message' => 'All notifications marked as read.',
        ], 200);
    }

    /**
     * Delete a notification belonging to the user.
     */
    public function destroy(
        Request $request,
        int $id
    ): JsonResponse {
        $notification = Notification::where('id', $id)
            ->where('receiver_user_id', $request->user()->id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted successfully.',
        ], 200);
    }
}
