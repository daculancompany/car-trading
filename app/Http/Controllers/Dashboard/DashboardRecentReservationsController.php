<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class DashboardRecentReservationsController extends Controller
{
    public function index(): JsonResponse
    {
        $reservations = Reservation::with([
            'customer',
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ])
            ->latest('reserved_at')
            ->limit(5)
            ->get();

        $data = $reservations
            ->map(function ($reservation) {
                return [
                    'reservation_id' => $reservation->id,

                    'reservation_no' => $this->getReservationNumber(
                        $reservation
                    ),

                    'customer' => $this->getCustomerName(
                        $reservation
                    ),

                    'vehicle' => $this->getVehicleName(
                        $reservation->vehicle
                    ),

                    'date' => $reservation->reserved_at,

                    'status' => $this->formatStatus(
                        $reservation->reservation_status
                    ),
                ];
            })
            ->values()
            ->toArray();

        return response()->json([
            'message' => 'Recent reservations retrieved successfully.',
            'data' => $data,
        ], 200);
    }

    // Reservation Number

    private function getReservationNumber($reservation): string
    {
        if (!empty($reservation->reservation_no)) {
            return $reservation->reservation_no;
        }

        return 'RES-' . str_pad(
            $reservation->id,
            3,
            '0',
            STR_PAD_LEFT
        );
    }

    // Customer Name

    private function getCustomerName($reservation): string
    {
        $customer = $reservation->customer;

        if (!$customer) {
            return 'Unknown Customer';
        }

        $fullName = trim(
            ($customer->first_name ?? '') . ' ' .
                ($customer->middle_name ?? '') . ' ' .
                ($customer->last_name ?? '')
        );

        return $fullName !== ''
            ? $fullName
            : 'Unknown Customer';
    }

    // Vehicle Name

    private function getVehicleName($vehicle): string
    {
        if (!$vehicle) {
            return 'Unknown Vehicle';
        }

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

        return trim(
            implode(' ', $parts)
        ) ?: 'Unknown Vehicle';
    }

    // Reservation Status

    private function formatStatus($status): string
    {
        if ($status instanceof \BackedEnum) {
            $status = $status->value;
        }

        return match ($status) {
            'pending_reservation',
            'pending_documents',
            'pending_financing',
            'pending_payment'
            => 'Pending',

            'reserved'
            => 'Approved',

            'completed'
            => 'Completed',

            'cancelled',
            'expired'
            => 'Cancelled',

            default
            => ucfirst(
                str_replace(
                    '_',
                    ' ',
                    $status ?? 'Unknown'
                )
            ),
        };
    }
}
