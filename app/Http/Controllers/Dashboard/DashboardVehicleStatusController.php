<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\VehicleStatus;
use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;

class DashboardVehicleStatusController extends Controller
{
    /**
     * Display vehicle status distribution.
     */
    public function index(): JsonResponse
    {
        $statusCounts = Vehicle::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $data = [
            [
                'name' => 'Available',
                'value' => (int) (
                    $statusCounts[VehicleStatus::AVAILABLE->value] ?? 0
                ),
            ],
            [
                'name' => 'Reserved',
                'value' => (int) (
                    $statusCounts[VehicleStatus::RESERVED->value] ?? 0
                ),
            ],
            [
                'name' => 'Sold',
                'value' => (int) (
                    $statusCounts[VehicleStatus::SOLD->value] ?? 0
                ),
            ],
            [
                'name' => 'Maintenance',
                'value' => (int) (
                    $statusCounts[VehicleStatus::MAINTENANCE->value] ?? 0
                ),
            ],
        ];

        return response()->json([
            'message' => 'Vehicle status distribution retrieved successfully.',
            'data' => $data,
        ], 200);
    }
}
