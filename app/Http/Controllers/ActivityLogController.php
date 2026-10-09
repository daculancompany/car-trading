<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'subject_type' => ['nullable', 'string', 'max:60'],
            'action' => ['nullable', 'in:created,updated,deleted'],
            'user_id' => ['nullable', 'integer'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'subject_id' => ['nullable', 'integer'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $logs = ActivityLog::with('user:id,username,role_id', 'user.role:id,name')
            ->when($validated['search'] ?? null, fn ($query, $search) => $query->where(fn ($inner) => $inner
                ->where('subject_label', 'like', "%{$search}%")
                ->orWhereHas('user', fn ($user) => $user->where('username', 'like', "%{$search}%"))))
            ->when($validated['subject_type'] ?? null, fn ($query, $type) => $query->where('subject_type', $type))
            ->when($validated['subject_id'] ?? null, fn ($query, $id) => $query->where('subject_id', $id))
            ->when($validated['action'] ?? null, fn ($query, $action) => $query->where('action', $action))
            ->when($validated['user_id'] ?? null, fn ($query, $userId) => $query->where('user_id', $userId))
            ->when($validated['date_from'] ?? null, fn ($query, $from) => $query->whereDate('created_at', '>=', $from))
            ->when($validated['date_to'] ?? null, fn ($query, $to) => $query->whereDate('created_at', '<=', $to))
            ->latest('created_at')
            ->latest('id')
            ->paginate($validated['per_page'] ?? 20);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ],
            'subject_types' => ActivityLog::query()->distinct()->orderBy('subject_type')->pluck('subject_type'),
        ]);
    }
}
