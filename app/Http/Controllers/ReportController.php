<?php

namespace App\Http\Controllers;

use App\Enums\FinancingInfoStatus;
use App\Models\FinancingInfo;
use App\Models\JobOrder;
use App\Models\Staff;
use App\Models\PartStockMovement;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\Vehicle;
use App\Models\VehicleExpense;
use App\Models\VehiclePart;
use App\Models\VehicleRelease;
use App\Models\RequestService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ReportController extends Controller
{
    /**
     * SALES REPORT
     */
    public function sales(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $sales = Sale::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'createdBy',
        ])
            ->whereBetween('sale_date', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('sale_date')
            ->get();

        $sales->each(fn ($sale) => $sale->setAttribute(
            'selling_price',
            (float) ($sale->reservation?->vehicle?->selling_price ?? 0)
        ));

        $completedSales = $this->whereValue($sales, 'status', 'completed');

        $totalSales = $completedSales->sum('selling_price');

        $totalDiscount = $completedSales->sum('discount_amount');

        $netSales = $totalSales - $totalDiscount;

        return response()->json([
            'report' => 'Sales Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_transactions' => $sales->count(),
                'completed_sales' => $completedSales->count(),
                'pending_sales' => $this->whereValue($sales, 'status', 'pending')->count(),
                'cancelled_sales' => $this->whereValue($sales, 'status', 'cancelled')->count(),
                'total_sales' => $totalSales,
                'total_discount' => $totalDiscount,
                'net_sales' => $netSales,
            ],

            'data' => $sales,
        ]);
    }

    /**
     * SALES PDF
     */
    public function salesPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $sales = Sale::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'createdBy',
        ])
            ->whereBetween('sale_date', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('sale_date')
            ->get();

        $sales->each(fn ($sale) => $sale->setAttribute(
            'selling_price',
            (float) ($sale->reservation?->vehicle?->selling_price ?? 0)
        ));

        $completedSales = $this->whereValue($sales, 'status', 'completed');

        $summary = [
            'total_transactions' => $sales->count(),
            'completed_sales' => $completedSales->count(),
            'pending_sales' => $this->whereValue($sales, 'status', 'pending')->count(),
            'cancelled_sales' => $this->whereValue($sales, 'status', 'cancelled')->count(),
            'total_sales' => $completedSales->sum('selling_price'),
            'total_discount' => $completedSales->sum('discount_amount'),
            'net_sales' =>
            $completedSales->sum('selling_price')
                - $completedSales->sum('discount_amount'),
        ];

        $pdf = Pdf::loadView('reports.sales', [
            'sales' => $sales,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'sales-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * PAYMENT REPORT
     */
    public function payments(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $payments = Payment::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'paymentAccount',
            'verifiedBy',
        ])
            ->whereBetween('payment_date', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('payment_date')
            ->get();

        $verified = $this->whereValue($payments, 'payment_status', 'verified');

        return response()->json([
            'report' => 'Payment Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_transactions' => $payments->count(),
                'verified_payments' => $verified->count(),
                'pending_payments' => $this->whereValue($payments, 'payment_status', 'pending')->count(),
                'rejected_payments' => $this->whereValue($payments, 'payment_status', 'rejected')->count(),
                'total_verified_amount' => $verified->sum('amount'),
            ],

            'data' => $payments,
        ]);
    }

    /**
     * PAYMENT PDF
     */
    public function paymentsPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $payments = Payment::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'paymentAccount',
            'verifiedBy',
        ])
            ->whereBetween('payment_date', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('payment_date')
            ->get();

        $verified = $this->whereValue($payments, 'payment_status', 'verified');

        $summary = [
            'total_transactions' => $payments->count(),
            'verified_payments' => $verified->count(),
            'pending_payments' => $this->whereValue($payments, 'payment_status', 'pending')->count(),
            'rejected_payments' => $this->whereValue($payments, 'payment_status', 'rejected')->count(),
            'total_verified_amount' => $verified->sum('amount'),
        ];

        $pdf = Pdf::loadView('reports.payments', [
            'payments' => $payments,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'payment-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * RESERVATION REPORT
     */
    public function reservations(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $reservations = Reservation::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'reservedBy',
        ])
            ->whereBetween('reserved_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('reserved_at')
            ->get();

        return response()->json([
            'report' => 'Reservation Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_reservations' => $reservations->count(),

                'pending' => $this->whereValue($reservations, 'reservation_status', 'pending_reservation')->count(),

                'reserved' => $this->whereValue($reservations, 'reservation_status', 'reserved')->count(),

                'completed' => $this->whereValue($reservations, 'reservation_status', 'completed')->count(),

                'cancelled' => $this->whereValue($reservations, 'reservation_status', 'cancelled')->count(),

                'expired' => $this->whereValue($reservations, 'reservation_status', 'expired')->count(),
            ],

            'data' => $reservations,
        ]);
    }

    /**
     * RESERVATION PDF
     */
    public function reservationsPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $reservations = Reservation::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'reservedBy',
        ])
            ->whereBetween('reserved_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('reserved_at')
            ->get();

        $summary = [
            'total_reservations' => $reservations->count(),

            'pending' => $this->whereValue($reservations, 'reservation_status', 'pending_reservation')->count(),

            'reserved' => $this->whereValue($reservations, 'reservation_status', 'reserved')->count(),

            'completed' => $this->whereValue($reservations, 'reservation_status', 'completed')->count(),

            'cancelled' => $this->whereValue($reservations, 'reservation_status', 'cancelled')->count(),

            'expired' => $this->whereValue($reservations, 'reservation_status', 'expired')->count(),
        ];

        $pdf = Pdf::loadView('reports.reservations', [
            'reservations' => $reservations,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'reservation-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * VEHICLE INVENTORY REPORT
     */
    public function vehicles(Request $request): JsonResponse
    {
        $vehicles = Vehicle::with([
            'brand',
            'model',
            'variant',
            'specs',
        ])
            ->latest()
            ->get();

        return response()->json([
            'report' => 'Vehicle Inventory Report',

            'summary' => [
                'total_vehicles' => $vehicles->count(),

                'available' => $this->whereValue($vehicles, 'status', 'available')->count(),

                'reserved' => $this->whereValue($vehicles, 'status', 'reserved')->count(),

                'sold' => $this->whereValue($vehicles, 'status', 'sold')->count(),

                'maintenance' => $this->whereValue($vehicles, 'status', 'maintenance')->count(),

                'unavailable' => $this->whereValue($vehicles, 'status', 'unavailable')->count(),
            ],

            'data' => $vehicles,
        ]);
    }

    /**
     * VEHICLE PDF
     */
    public function vehiclesPdf()
    {
        $vehicles = Vehicle::with([
            'brand',
            'model',
            'variant',
            'specs',
        ])
            ->latest()
            ->get();

        $summary = [
            'total_vehicles' => $vehicles->count(),
            'available' => $this->whereValue($vehicles, 'status', 'available')->count(),
            'reserved' => $this->whereValue($vehicles, 'status', 'reserved')->count(),
            'sold' => $this->whereValue($vehicles, 'status', 'sold')->count(),
            'maintenance' => $this->whereValue($vehicles, 'status', 'maintenance')->count(),
            'unavailable' => $this->whereValue($vehicles, 'status', 'unavailable')->count(),
        ];

        $pdf = Pdf::loadView('reports.vehicles', [
            'vehicles' => $vehicles,
            'summary' => $summary,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'vehicle-inventory-report-' . now()->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * FINANCING REPORT
     */
    public function financing(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $financings = FinancingInfo::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'verifiedBy',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('created_at')
            ->get();

        return response()->json([
            'report' => 'Financing Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_applications' => $financings->count(),

                'pending' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::PENDING)->count(),

                'completed' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::COMPLETED)->count(),

                'approved' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::APPROVED)->count(),

                'rejected' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::REJECTED)->count(),

                'cancelled' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::CANCELLED)->count(),

                'approved_amount' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::APPROVED)
                    ->sum('financed_amount'),
            ],

            'data' => $financings,
        ]);
    }

    /**
     * FINANCING PDF
     */
    public function financingPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $financings = FinancingInfo::with([
            'reservation.customer',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'verifiedBy',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('created_at')
            ->get();

        $summary = [
            'total_applications' => $financings->count(),
            'pending' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::PENDING)->count(),
            'completed' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::COMPLETED)->count(),
            'approved' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::APPROVED)->count(),
            'rejected' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::REJECTED)->count(),
            'cancelled' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::CANCELLED)->count(),
            'approved_amount' => $this->whereValue($financings, 'financing_status', FinancingInfoStatus::APPROVED)
                ->sum('financed_amount'),
        ];

        $pdf = Pdf::loadView('reports.financing', [
            'financings' => $financings,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'financing-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * EXPENSE REPORT
     */
    public function expenses(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $expenses = VehicleExpense::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest()
            ->get();

        return response()->json([
            'report' => 'Vehicle Expense Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_expenses' => $expenses->count(),
                'total_amount' => $expenses->sum('amount'),
            ],

            'data' => $expenses,
        ]);
    }

    /**
     * EXPENSE PDF
     */
    public function expensesPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $expenses = VehicleExpense::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest()
            ->get();

        $summary = [
            'total_expenses' => $expenses->count(),
            'total_amount' => $expenses->sum('amount'),
        ];

        $pdf = Pdf::loadView('reports.expenses', [
            'expenses' => $expenses,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'vehicle-expense-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * SERVICE REPORT
     */
    public function services(Request $request): JsonResponse
    {
        [$from, $to] = $this->getDateRange($request);

        $services = RequestService::with([
            'vehicleRelease.sale.reservation.customer',
            'vehicleRelease.sale.reservation.vehicle.brand',
            'vehicleRelease.sale.reservation.vehicle.model',
            'vehicleRelease.sale.reservation.vehicle.variant',
            'jobOrder.assignedStaff',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest()
            ->get();

        return response()->json([
            'report' => 'Service Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_requests' => $services->count(),

                'pending' => $this->whereValue($services, 'status', 'pending')->count(),

                'assigned' => $this->whereValue($services, 'status', 'assigned')->count(),

                'in_progress' => $this->whereValue($services, 'status', 'in_progress')->count(),

                'completed' => $this->whereValue($services, 'status', 'completed')->count(),

                'cancelled' => $this->whereValue($services, 'status', 'cancelled')->count(),
            ],

            'data' => $services,
        ]);
    }

    /**
     * SERVICE PDF
     */
    public function servicesPdf(Request $request)
    {
        [$from, $to] = $this->getDateRange($request);

        $services = RequestService::with([
            'vehicleRelease.sale.reservation.customer',
            'vehicleRelease.sale.reservation.vehicle.brand',
            'vehicleRelease.sale.reservation.vehicle.model',
            'vehicleRelease.sale.reservation.vehicle.variant',
            'jobOrder.assignedStaff',
        ])
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest()
            ->get();

        $summary = [
            'total_requests' => $services->count(),
            'pending' => $this->whereValue($services, 'status', 'pending')->count(),
            'assigned' => $this->whereValue($services, 'status', 'assigned')->count(),
            'in_progress' => $this->whereValue($services, 'status', 'in_progress')->count(),
            'completed' => $this->whereValue($services, 'status', 'completed')->count(),
            'cancelled' => $this->whereValue($services, 'status', 'cancelled')->count(),
        ];

        $pdf = Pdf::loadView('reports.services', [
            'services' => $services,
            'summary' => $summary,
            'from' => $from,
            'to' => $to,
        ])->setPaper('a4', 'landscape');

        return $pdf->download(
            'service-report-' . $from->format('Y-m-d') . '-' . $to->format('Y-m-d') . '.pdf'
        );
    }

    /**
     * DATE RANGE HELPER
     */
    public function jobOrders(Request $request): JsonResponse
    {
        return response()->json($this->jobOrderReport($request));
    }

    public function jobOrdersPdf(Request $request)
    {
        return $this->pdf('reports.job-orders', $this->jobOrderReport($request), 'job-order-report');
    }

    private function jobOrderReport(Request $request): array
    {
        [$from, $to] = $this->getDateRange($request);

        $jobOrders = JobOrder::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'assignedStaff',
            'partsUsed.vehiclePart',
        ])
            ->where('archived', false)
            ->whereBetween('created_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest()
            ->get();

        $jobOrders->each(function ($jobOrder) {
            $partsCost = $jobOrder->partsUsed->sum(
                fn ($used) => $used->quantity * (float) ($used->vehiclePart?->unit_price ?? 0)
            );

            $jobOrder->setAttribute('parts_cost', round($partsCost, 2));
            $jobOrder->setAttribute('total_cost', round($partsCost + (float) $jobOrder->labor_cost, 2));
        });

        return [
            'report' => 'Job Order Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_job_orders' => $jobOrders->count(),
                'pending' => $this->whereValue($jobOrders, 'status', 'pending')->count(),
                'assigned' => $this->whereValue($jobOrders, 'status', 'assigned')->count(),
                'in_progress' => $this->whereValue($jobOrders, 'status', 'in_progress')->count(),
                'completed' => $this->whereValue($jobOrders, 'status', 'completed')->count(),
                'cancelled' => $this->whereValue($jobOrders, 'status', 'cancelled')->count(),
                'total_labor' => round($jobOrders->sum('labor_cost'), 2),
                'total_parts' => round($jobOrders->sum('parts_cost'), 2),
                'grand_total' => round($jobOrders->sum('total_cost'), 2),
            ],

            'data' => $jobOrders,
        ];
    }

    public function parts(Request $request): JsonResponse
    {
        return response()->json($this->partsReport());
    }

    public function partsPdf()
    {
        return $this->pdf('reports.parts', $this->partsReport(), 'parts-inventory-report');
    }

    private function partsReport(): array
    {
        $lowStock = 5;

        $parts = VehiclePart::where('archived', false)
            ->orderBy('part_name')
            ->get();

        $parts->each(fn ($part) => $part->setAttribute(
            'stock_value',
            round($part->quantity * (float) $part->unit_price, 2)
        ));

        return [
            'report' => 'Parts Inventory Report',

            'summary' => [
                'total_parts' => $parts->count(),
                'total_quantity' => $parts->sum('quantity'),
                'stock_value' => round($parts->sum('stock_value'), 2),
                'low_stock' => $parts->filter(fn ($part) => $part->quantity > 0 && $part->quantity <= $lowStock)->count(),
                'out_of_stock' => $parts->filter(fn ($part) => $part->quantity <= 0)->count(),
            ],

            'data' => $parts,
        ];
    }

    public function stockMovements(Request $request): JsonResponse
    {
        return response()->json($this->stockMovementReport($request));
    }

    public function stockMovementsPdf(Request $request)
    {
        return $this->pdf('reports.stock-movements', $this->stockMovementReport($request), 'stock-movement-report');
    }

    private function stockMovementReport(Request $request): array
    {
        [$from, $to] = $this->getDateRange($request);

        $movements = PartStockMovement::with([
            'vehiclePart:id,part_name,category',
            'jobOrder:id,job_order_no',
            'creator:id,username',
        ])
            ->whereBetween('moved_at', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('moved_at')
            ->latest('id')
            ->get();

        $incoming = $movements->whereIn('type', PartStockMovement::INCOMING_TYPES);
        $outgoing = $movements->whereNotIn('type', PartStockMovement::INCOMING_TYPES);
        $damage = $movements->where('type', 'damage');

        return [
            'report' => 'Stock Movement Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_movements' => $movements->count(),
                'in_quantity' => $incoming->sum('quantity'),
                'in_amount' => round($incoming->sum('amount'), 2),
                'out_quantity' => $outgoing->sum('quantity'),
                'out_amount' => round($outgoing->sum('amount'), 2),
                'damage_quantity' => $damage->sum('quantity'),
                'damage_amount' => round($damage->sum('amount'), 2),
            ],

            'data' => $movements,
        ];
    }

    public function releases(Request $request): JsonResponse
    {
        return response()->json($this->releaseReport($request));
    }

    public function releasesPdf(Request $request)
    {
        return $this->pdf('reports.releases', $this->releaseReport($request), 'vehicle-release-report');
    }

    private function releaseReport(Request $request): array
    {
        [$from, $to] = $this->getDateRange($request);

        $releases = VehicleRelease::with([
            'sale.reservation.customer',
            'sale.reservation.vehicle.brand',
            'sale.reservation.vehicle.model',
            'sale.reservation.vehicle.variant',
        ])
            ->where('archived', false)
            ->whereBetween('release_date', [
                $from->startOfDay(),
                $to->endOfDay(),
            ])
            ->latest('release_date')
            ->get();

        return [
            'report' => 'Vehicle Release Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),

            'summary' => [
                'total_releases' => $releases->count(),
                'pending' => $this->whereValue($releases, 'status', 'pending')->count(),
                'released' => $this->whereValue($releases, 'status', 'released')->count(),
                'cancelled' => $this->whereValue($releases, 'status', 'cancelled')->count(),
            ],

            'data' => $releases,
        ];
    }

    public function mechanics(Request $request): JsonResponse
    {
        return response()->json($this->mechanicReport($request));
    }

    public function mechanicsPdf(Request $request)
    {
        return $this->pdf('reports.mechanics', $this->mechanicReport($request), 'mechanic-performance-report');
    }

    private function mechanicReport(Request $request): array
    {
        [$from, $to] = $this->getDateRange($request);

        $jobs = JobOrder::with(['partsUsed.vehiclePart', 'payments'])
            ->where('archived', false)
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->get()
            ->groupBy('assigned_staff_id');

        $rows = Staff::with('user.role')
            ->get()
            ->filter(fn ($staff) => in_array(strtolower($staff->user?->role?->name ?? ''), ['mechanic', 'washer'], true))
            ->map(function ($staff) use ($jobs) {
                $mine = $jobs->get($staff->id, collect());
                $completed = $mine->where('status', 'completed');
                $timed = $completed->filter(fn ($job) => $job->start_job && $job->finish_job);
                $withDeadline = $completed->filter(fn ($job) => $job->finish_job && $job->estimated_completion);
                $rated = $completed->whereNotNull('rating');

                return [
                    'id' => $staff->id,
                    'name' => trim($staff->first_name . ' ' . $staff->last_name),
                    'role' => $staff->user?->role?->name,
                    'total_jobs' => $mine->count(),
                    'completed' => $completed->count(),
                    'in_progress' => $mine->where('status', 'in_progress')->count(),
                    'cancelled' => $mine->where('status', 'cancelled')->count(),
                    'avg_hours' => $timed->isNotEmpty() ? round($timed->avg(fn ($job) => $job->start_job->diffInMinutes($job->finish_job) / 60), 1) : null,
                    'on_time_rate' => $withDeadline->isNotEmpty() ? round($withDeadline->filter(fn ($job) => $job->finish_job->lte($job->estimated_completion))->count() / $withDeadline->count() * 100) : null,
                    'avg_rating' => $rated->isNotEmpty() ? round($rated->avg('rating'), 1) : null,
                    'ratings' => $rated->count(),
                    'labor_revenue' => round($completed->sum(fn ($job) => (float) $job->labor_cost), 2),
                    'total_revenue' => round($completed->sum(fn ($job) => $job->total_cost), 2),
                ];
            })
            ->sortByDesc('completed')
            ->values();

        $rated = $rows->whereNotNull('avg_rating');

        return [
            'report' => 'Mechanic Performance Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
            'summary' => [
                'staff' => $rows->count(),
                'total_jobs' => $rows->sum('total_jobs'),
                'completed' => $rows->sum('completed'),
                'avg_rating' => $rated->isNotEmpty() ? round($rated->avg('avg_rating'), 1) : null,
                'total_revenue' => round($rows->sum('total_revenue'), 2),
            ],
            'data' => $rows,
        ];
    }

    public function serviceBilling(Request $request): JsonResponse
    {
        return response()->json($this->serviceBillingReport($request));
    }

    public function serviceBillingPdf(Request $request)
    {
        return $this->pdf('reports.service-billing', $this->serviceBillingReport($request), 'service-billing-report');
    }

    private function serviceBillingReport(Request $request): array
    {
        [$from, $to] = $this->getDateRange($request);

        $jobs = JobOrder::with([
            'vehicle.brand',
            'vehicle.model',
            'partsUsed.vehiclePart',
            'payments',
            'requestService.vehicleRelease.sale.reservation.customer',
        ])
            ->where('status', 'completed')
            ->whereBetween('finish_job', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->latest('finish_job')
            ->get();

        $jobs->each(function ($job) {
            $customer = $job->requestService?->vehicleRelease?->sale?->reservation?->customer;
            $job->setAttribute('customer_name', $customer ? trim($customer->first_name . ' ' . $customer->last_name) : 'Shop job');
        });

        return [
            'report' => 'Service Billing Report',
            'date_from' => $from->toDateString(),
            'date_to' => $to->toDateString(),
            'summary' => [
                'invoices' => $jobs->count(),
                'billed' => round($jobs->sum('total_cost'), 2),
                'collected' => round($jobs->sum('amount_paid'), 2),
                'outstanding' => round($jobs->sum('balance'), 2),
                'unpaid' => $jobs->filter(fn ($job) => $job->payment_status !== 'paid')->count(),
            ],
            'data' => $jobs->map(fn ($job) => [
                'id' => $job->id,
                'invoice_no' => $job->invoice_no,
                'job_order_no' => $job->job_order_no,
                'finish_job' => $job->finish_job?->toDateTimeString(),
                'customer_name' => $job->customer_name,
                'vehicle' => trim(($job->vehicle?->brand?->brand ?? '') . ' ' . ($job->vehicle?->model?->model ?? '')),
                'labor_cost' => (float) $job->labor_cost,
                'parts_total' => $job->parts_total,
                'total_cost' => $job->total_cost,
                'amount_paid' => $job->amount_paid,
                'balance' => $job->balance,
                'payment_status' => $job->payment_status,
            ])->values(),
        ];
    }

    private function pdf(string $view, array $report, string $fileName)
    {
        $suffix = isset($report['date_from'])
            ? '-' . $report['date_from'] . '-' . $report['date_to']
            : '-' . now()->toDateString();

        return Pdf::loadView($view, $report + [
            'from' => isset($report['date_from']) ? \Carbon\Carbon::parse($report['date_from']) : null,
            'to' => isset($report['date_to']) ? \Carbon\Carbon::parse($report['date_to']) : null,
        ])
            ->setPaper('a4', 'landscape')
            ->download($fileName . $suffix . '.pdf');
    }

    private function whereValue(Collection $items, string $field, mixed $value): Collection
    {
        $value = $value instanceof \BackedEnum ? $value->value : $value;

        return $items->filter(function ($item) use ($field, $value) {
            $current = data_get($item, $field);

            return ($current instanceof \BackedEnum ? $current->value : $current) === $value;
        });
    }

    private function getDateRange(Request $request): array
    {
        $from = $request->filled('from')
            ? \Carbon\Carbon::parse($request->from)
            : now()->startOfMonth();

        $to = $request->filled('to')
            ? \Carbon\Carbon::parse($request->to)
            : now();

        return [$from, $to];
    }
}
