<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;

class DashboardLatestVehiclesController extends Controller
{
    public function index(): JsonResponse
    {
        $vehicles = Vehicle::with([
            'brand',
            'model',
            'variant',
        ])
            ->latest('created_at')
            ->limit(5)
            ->get();

        $data = $vehicles->map(function ($vehicle) {
            return [
                'vehicle_id' => $vehicle->id,
                'stock_no' => $vehicle->stock_no,
                'vehicle' => $this->getVehicleName($vehicle),
                'price' => (float) $vehicle->selling_price,
                'status' => $this->formatStatus($vehicle->status),
                'created_at' => $vehicle->created_at,
            ];
        })->values()->toArray();

        return response()->json([
            'message' => 'Latest vehicles retrieved successfully.',
            'data' => $data,
        ], 200);
    }

    // Vehicle Name

    private function getVehicleName($vehicle): string
    {
        $parts = [];

        if ($vehicle->brand) {
            $parts[] = $vehicle->brand->brand;
        }

        if ($vehicle->model) {
            $parts[] = $vehicle->model->model;
        }

        if ($vehicle->variant) {
            $parts[] = $vehicle->variant->variant;
        }

        if ($vehicle->year_model) {
            $parts[] = $vehicle->year_model;
        }

        return trim(implode(' ', $parts)) ?: 'Unknown Vehicle';
    }

    // Vehicle Status

    private function formatStatus($status): string
    {
        if ($status instanceof \BackedEnum) {
            $status = $status->value;
        }

        return match ($status) {
            'available' => 'Available',
            'reserved' => 'Reserved',
            'sold' => 'Sold',
            'maintenance' => 'Maintenance',
            default => ucfirst(
                str_replace('_', ' ', $status ?? 'Unknown')
            ),
        };
    }
}
