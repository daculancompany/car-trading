<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\SaleStatus;
use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\VehicleExpense;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardFinancialPerformanceController extends Controller
{
    /**
     * Get financial performance data.
     *
     * Supported periods:
     * - Week
     * - Month
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'Month');

        if (!in_array($period, ['Week', 'Month'])) {
            return response()->json([
                'message' => 'Invalid financial period.',
            ], 422);
        }

        // WEEK
        // Returns the current week's financial performance:
        // Mon -> Sun

        if ($period === 'Week') {
            $data = $this->getWeeklyData();
        }

        // MONTH: the last 6 months including the current month.
        else {
            $data = $this->getMonthlyData();
        }

        return response()->json([
            'message' =>
            'Financial performance retrieved successfully.',

            'data' => [
                'period' => $period,
                'financial_data' => $data,
            ],
        ], 200);
    }

    /**
     * Get current week's financial data.
     */
    private function getWeeklyData(): array
    {
        $data = [];

        $startOfWeek = now()->startOfWeek(Carbon::MONDAY);

        for ($i = 0; $i < 7; $i++) {
            $date = $startOfWeek->copy()->addDays($i);

            $startOfDay = $date->copy()->startOfDay();
            $endOfDay = $date->copy()->endOfDay();

            // Sales

            $sales = Sale::where(
                'status',
                SaleStatus::COMPLETED->value
            )
                ->whereBetween('sale_date', [
                    $startOfDay,
                    $endOfDay,
                ])
                ->get()
                ->sum(function ($sale) {
                    return (float) $sale->reservation?->vehicle?->selling_price
                        - (float) ($sale->discount_amount ?? 0);
                });

            // Expenses

            $expenses = VehicleExpense::whereBetween(
                'created_at',
                [
                    $startOfDay,
                    $endOfDay,
                ]
            )->sum('amount');

            $sales = (float) $sales;
            $expenses = (float) $expenses;

            $data[] = [
                'period' => $date->format('D'),
                'sales' => $sales,
                'expenses' => $expenses,
                'profit' => $sales - $expenses,
            ];
        }

        return $data;
    }

    /**
     * Get the last 6 months' financial data.
     */
    private function getMonthlyData(): array
    {
        $data = [];

        // Last 6 Months

        $startMonth = now()
            ->startOfMonth()
            ->subMonths(5);

        for ($i = 0; $i < 6; $i++) {
            $month = $startMonth
                ->copy()
                ->addMonths($i);

            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            // Sales

            $sales = Sale::where(
                'status',
                SaleStatus::COMPLETED->value
            )
                ->whereBetween('sale_date', [
                    $startOfMonth,
                    $endOfMonth,
                ])
                ->get()
                ->sum(function ($sale) {
                    return (float) $sale->reservation?->vehicle?->selling_price
                        - (float) ($sale->discount_amount ?? 0);
                });

            // Expenses

            $expenses = VehicleExpense::whereBetween(
                'created_at',
                [
                    $startOfMonth,
                    $endOfMonth,
                ]
            )->sum('amount');

            $sales = (float) $sales;
            $expenses = (float) $expenses;

            $data[] = [
                'period' => $month->format('M'),
                'sales' => $sales,
                'expenses' => (float) $expenses,
                'profit' => $sales - $expenses,
            ];
        }

        return $data;
    }
}
