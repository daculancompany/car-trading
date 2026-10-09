<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\SaleStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardSalesTrendController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', '1 Year');

        $allowedPeriods = [
            '7 Days',
            '30 Days',
            '6 Months',
            '1 Year',
        ];

        if (!in_array($period, $allowedPeriods)) {
            return response()->json([
                'message' => 'Invalid sales period.',
            ], 422);
        }

        $data = match ($period) {
            '7 Days' => $this->getSevenDaysData(),
            '30 Days' => $this->getThirtyDaysData(),
            '6 Months' => $this->getSixMonthsData(),
            '1 Year' => $this->getOneYearData(),
        };

        return response()->json([
            'message' => 'Sales trend retrieved successfully.',
            'data' => [
                'period' => $period,
                'sales_data' => $data,
            ],
        ], 200);
    }

    private function getSevenDaysData(): array
    {
        $data = [];

        $startDate = now()
            ->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 7; $i++) {
            $date = $startDate->copy()->addDays($i);

            $sales = $this->getSalesForPeriod(
                $date->copy()->startOfDay(),
                $date->copy()->endOfDay()
            );

            $data[] = [
                'period' => $date->format('D'),
                'sales' => $sales,
            ];
        }

        return $data;
    }

    private function getThirtyDaysData(): array
    {
        $data = [];

        $startDate = now()
            ->subDays(29)
            ->startOfDay();

        for ($i = 0; $i < 30; $i++) {
            $date = $startDate->copy()->addDays($i);

            $sales = $this->getSalesForPeriod(
                $date->copy()->startOfDay(),
                $date->copy()->endOfDay()
            );

            $data[] = [
                'period' => $date->format('M d'),
                'sales' => $sales,
            ];
        }

        return $data;
    }

    private function getSixMonthsData(): array
    {
        $data = [];

        $startMonth = now()
            ->startOfMonth()
            ->subMonths(5);

        for ($i = 0; $i < 6; $i++) {
            $month = $startMonth->copy()->addMonths($i);

            $sales = $this->getSalesForPeriod(
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth()
            );

            $data[] = [
                'period' => $month->format('M'),
                'sales' => $sales,
            ];
        }

        return $data;
    }

    private function getOneYearData(): array
    {
        $data = [];

        $startMonth = now()
            ->startOfMonth()
            ->subMonths(11);

        for ($i = 0; $i < 12; $i++) {
            $month = $startMonth->copy()->addMonths($i);

            $sales = $this->getSalesForPeriod(
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth()
            );

            $data[] = [
                'period' => $month->format('M'),
                'sales' => $sales,
            ];
        }

        return $data;
    }

    private function getSalesForPeriod(
        Carbon $startDate,
        Carbon $endDate
    ): float {
        return (float) Sale::where(
            'status',
            SaleStatus::COMPLETED->value
        )
            ->whereBetween('sale_date', [
                $startDate,
                $endDate,
            ])
            ->get()
            ->sum(function ($sale) {
                return (float) $sale->reservation?->vehicle?->selling_price
                    - (float) ($sale->discount_amount ?? 0);
            });
    }
}
