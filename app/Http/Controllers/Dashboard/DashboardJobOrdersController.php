<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;

class DashboardJobOrdersController extends Controller
{
    /**
     * GET LATEST JOB ORDERS
     */
    public function index(): JsonResponse
    {
        $jobOrders = JobOrder::with([
            // VEHICLE
            // job_orders.vehicle_id -> vehicles.id
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',

            // REQUEST SERVICE
            // job_orders.request_service_id -> request_services.id
            'requestService.vehicleRelease.sale.reservation.customer',

            // ASSIGNED STAFF
            // job_orders.assigned_staff_id -> staffs.id
            'assignedStaff',
        ])
            ->where('archived', false)
            ->latest('created_at')
            ->limit(5)
            ->get();

        $data = $jobOrders->map(function ($jobOrder) {
            return [
                'job_order_id' => $jobOrder->id,

                'job_no' => $jobOrder->job_order_no,

                'customer' => $this->getCustomerName($jobOrder),

                'vehicle' => $this->getVehicleName(
                    $jobOrder
                ),

                'service' => $this->getServiceName(
                    $jobOrder
                ),

                'assigned_to' => $this->getAssignedStaffName(
                    $jobOrder
                ),

                'status' => $this->formatStatus(
                    $jobOrder->status
                ),

                'created_at' => $jobOrder->created_at,
            ];
        })->values()->toArray();

        return response()->json([
            'message' => 'Latest job orders retrieved successfully.',
            'data' => $data,
        ], 200);
    }

    /**
     * VEHICLE NAME
     */
    private function getVehicleName($jobOrder): string
    {
        $vehicle = $jobOrder->vehicle;

        if (!$vehicle) {
            return '—';
        }

        $parts = [];

        if (!empty($vehicle->brand?->brand)) {
            $parts[] = $vehicle->brand->brand;
        }

        if (!empty($vehicle->model?->model)) {
            $parts[] = $vehicle->model->model;
        }

        if (!empty($vehicle->variant?->variant)) {
            $parts[] = $vehicle->variant->variant;
        }

        if (!empty($vehicle->year_model)) {
            $parts[] = $vehicle->year_model;
        }

        return trim(
            implode(' ', $parts)
        ) ?: '—';
    }

    /**
     * SERVICE
     *
     * request_services table:
     *
     * request_detail
     *
     * Since request_service_id is nullable, an internal
     * job may not have a request service.
     */
    private function getServiceName($jobOrder): string
    {
        $requestService = $jobOrder->requestService;

        if (!$requestService) {
            return '—';
        }

        return !empty($requestService->request_detail)
            ? $requestService->request_detail
            : '—';
    }

    /**
     * ASSIGNED STAFF
     *
     * job_orders.assigned_staff_id -> staffs.id
     */
    private function getAssignedStaffName($jobOrder): string
    {
        $staff = $jobOrder->assignedStaff;

        // Names live on the staff profile, not on the user account.
        $name = trim(($staff?->first_name ?? '') . ' ' . ($staff?->last_name ?? ''));

        return $name !== '' ? $name : '—';
    }

    // Shop jobs have no customer; customer requests do.
    private function getCustomerName($jobOrder): string
    {
        $customer = $jobOrder->requestService?->vehicleRelease?->sale?->reservation?->customer;

        $name = trim(($customer?->first_name ?? '') . ' ' . ($customer?->last_name ?? ''));

        return $name !== '' ? $name : 'Shop job';
    }

    /**
     * STATUS
     */
    private function formatStatus($status): string
    {
        return match ($status) {
            'pending' => 'Pending',

            'assigned' => 'Ongoing',

            'in_progress' => 'Ongoing',

            'completed' => 'Completed',

            'cancelled' => 'Cancelled',

            default => ucfirst(
                str_replace(
                    '_',
                    ' ',
                    $status ?? 'Unknown'
                )
            ),
        };
    }
}
