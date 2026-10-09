<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\SaleStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardTopSellingController extends Controller
{
    /**
     * Display top-selling vehicles.
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'Week');

        if (!in_array($period, ['Week', 'Month'])) {
            return response()->json([
                'message' => 'Invalid selling period.',
            ], 422);
        }

        $data = match ($period) {
            'Week' => $this->getWeeklyTopSelling(),
            'Month' => $this->getMonthlyTopSelling(),
        };

        return response()->json([
            'message' => 'Top-selling vehicles retrieved successfully.',
            'data' => [
                'period' => $period,
                'top_selling_vehicles' => $data,
            ],
        ], 200);
    }

    /**
     * Get top-selling vehicles for the current week.
     */
    private function getWeeklyTopSelling(): array
    {
        return $this->getTopSellingVehicles(
            now()->startOfWeek(Carbon::MONDAY),
            now()->endOfWeek(Carbon::SUNDAY)
        );
    }

    /**
     * Get top-selling vehicles for the current month.
     */
    private function getMonthlyTopSelling(): array
    {
        return $this->getTopSellingVehicles(
            now()->startOfMonth(),
            now()->endOfMonth()
        );
    }

    /**
     * Get top-selling vehicles within a date range.
     */
    private function getTopSellingVehicles(
        Carbon $startDate,
        Carbon $endDate
    ): array {
        $sales = Sale::with([
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
        ])
            ->where(
                'status',
                SaleStatus::COMPLETED->value
            )
            ->whereBetween('sale_date', [
                $startDate,
                $endDate,
            ])
            ->get();

        $groupedVehicles = $sales
            ->filter(function ($sale) {
                return $sale->reservation
                    && $sale->reservation->vehicle;
            })
            ->groupBy(function ($sale) {
                return $sale->reservation->vehicle->id;
            });

        return $groupedVehicles
            ->map(function ($vehicleSales) {
                $vehicle = $vehicleSales
                    ->first()
                    ->reservation
                    ->vehicle;

                return [
                    'vehicle_id' => $vehicle->id,

                    'vehicle' => $this->getVehicleName(
                        $vehicle
                    ),

                    'sold' => $vehicleSales->count(),
                ];
            })
            ->sortByDesc('sold')
            ->take(5)
            ->values()
            ->toArray();
    }

    /**
     * Build the vehicle display name.
     */
    private function getVehicleName($vehicle): string
    {
        $brandName = $vehicle->brand?->brand ?? '';

        $modelName = $vehicle->model?->model ?? '';

        $variantName = $vehicle->variant?->variant ?? '';

        return trim(
            $brandName . ' ' .
            $modelName . ' ' .
            $variantName
        ) ?: 'Unknown Vehicle';
    }
}