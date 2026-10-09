<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\Staff;
use App\Models\Sale;
use App\Models\Reservation;
use App\Models\Customer;
use App\Models\VehicleExpense;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use App\Enums\VehicleStatus;
use App\Enums\ReservationStatus;
use App\Enums\SaleStatus;

class DashboardStatsController extends Controller
{
    /**
     * Display dashboard statistics.
     */
    public function index(): JsonResponse
    {
        // Current Month

        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // VEHICLES

        $totalInventory = Vehicle::count();

        $availableVehicles = Vehicle::where(
            'status',
            VehicleStatus::AVAILABLE->value
        )->count();

        $reservedVehicles = Vehicle::where(
            'status',
            VehicleStatus::RESERVED->value
        )->count();

        $vehiclesSold = Vehicle::where(
            'status',
            VehicleStatus::SOLD->value
        )->count();

        $underMaintenance = Vehicle::where(
            'status',
            VehicleStatus::MAINTENANCE->value
        )->count();

        // STAFF

        $staff = Staff::where(
            'status',
            'active'
        )->count();

        // MONTHLY SALES

        $monthlySales = Sale::whereBetween(
            'sale_date',
            [$startOfMonth, $endOfMonth]
        )
            ->where('status', SaleStatus::COMPLETED->value)
            ->with('reservation.vehicle')
            ->get()
            ->sum(function ($sale) {
                $sellingPrice = (float) (
                    $sale->reservation?->vehicle?->selling_price ?? 0
                );

                $discount = (float) ($sale->discount_amount ?? 0);

                return $sellingPrice - $discount;
            });
        // MONTHLY EXPENSES

        // Vehicle expenses
        $vehicleExpenses = VehicleExpense::whereBetween(
            'created_at',
            [$startOfMonth, $endOfMonth]
        )->sum('amount');

        // Parts used in the shop this month (not the value of parts still in stock)
        $totalPartsCost = \App\Models\PartsUsed::with('vehiclePart')
            ->whereBetween('used_at', [$startOfMonth, $endOfMonth])
            ->get()
            ->sum(fn($used) => $used->quantity * (float) ($used->vehiclePart?->unit_price ?? 0));

        // All expenses
        $totalExpenses = $vehicleExpenses + $totalPartsCost;

        // MONTHLY PROFIT
        // Sales this month less what those sold units cost us (purchase, repairs, registration...).
        $soldVehicleIds = Sale::whereBetween('sale_date', [$startOfMonth, $endOfMonth])
            ->where('status', SaleStatus::COMPLETED->value)
            ->with('reservation:id,vehicle_id')
            ->get()
            ->pluck('reservation.vehicle_id')
            ->filter();
        $costOfUnitsSold = (float) VehicleExpense::whereIn('vehicle_id', $soldVehicleIds)->sum('amount');
        $monthlyProfit = $monthlySales - $costOfUnitsSold;

        // PENDING RESERVATIONS

        $pendingReservations = Reservation::whereIn(
            'reservation_status',
            [
                ReservationStatus::PENDING_RESERVATION->value,
                ReservationStatus::PENDING_DOCUMENTS->value,
                ReservationStatus::PENDING_FINANCING->value,
                ReservationStatus::PENDING_PAYMENT->value,
            ]
        )->count();

        // OPEN JOB ORDERS (not yet completed or cancelled)
        $pendingJobOrders = JobOrder::where('archived', false)
            ->whereIn('status', ['pending', 'assigned', 'in_progress'])
            ->count();

        // NEEDS ATTENTION: work waiting on staff
        $attention = [
            'ids_to_review' => Reservation::where('archived', false)
                ->where('reservation_status', ReservationStatus::PENDING_RESERVATION->value)
                ->where(fn($q) => $q->where('valid_id_front_status', 'pending')->orWhere('valid_id_back_status', 'pending'))
                ->count(),
            'payments_to_verify' => \App\Models\Payment::where('archived', false)->where('payment_status', 'pending')->count(),
            'documents_to_check' => \App\Models\FinancingDocument::where('archived', false)->where('verification_status', 'pending')->count(),
            'unassigned_requests' => \App\Models\RequestService::where('archived', false)->where('status', 'pending')->count(),
            'releases_pending' => \App\Models\VehicleRelease::where('archived', false)->where('status', 'pending')->count(),
        ];

        // CUSTOMERS

        $customers = Customer::count();

        // RESPONSE

        return response()->json([
            'message' => 'Dashboard statistics retrieved successfully.',

            'data' => [

                'total_inventory' => $totalInventory,

                'available_vehicles' => $availableVehicles,

                'reserved_vehicles' => $reservedVehicles,

                'vehicles_sold' => $vehiclesSold,

                'under_maintenance' => $underMaintenance,

                'staff' => $staff,

                'monthly_sales' => $monthlySales,

                'total_expenses' => $totalExpenses,
                'total_parts_cost' => $totalPartsCost,
                'vehicle_expenses' => $vehicleExpenses,

                'monthly_profit' => $monthlyProfit,
                'cost_of_units_sold' => $costOfUnitsSold,
                'attention' => $attention,

                'pending_reservations' => $pendingReservations,

                'pending_job_orders' => $pendingJobOrders,

                'customers' => $customers,
            ],
        ], 200);
    }
}
