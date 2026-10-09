<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;

class DashboardReservationPipelineController extends Controller
{
    /**
     * Get reservation pipeline and payment method statistics.
     */
    public function index(): JsonResponse
    {
        // Reservation Pipeline

        // All reservations currently waiting for the next processing step.
        $pendingReservations = Reservation::whereIn(
            'reservation_status',
            [
                ReservationStatus::PENDING_RESERVATION->value,
                ReservationStatus::PENDING_DOCUMENTS->value,
                ReservationStatus::PENDING_FINANCING->value,
                ReservationStatus::PENDING_PAYMENT->value,
            ]
        )->count();

        // Approved / successfully reserved vehicles.
        $approvedReservations = Reservation::where(
            'reservation_status',
            ReservationStatus::RESERVED->value
        )->count();

        // Completed reservations.
        $completedReservations = Reservation::where(
            'reservation_status',
            ReservationStatus::COMPLETED->value
        )->count();

        // Cancelled reservations.
        $cancelledReservations = Reservation::where(
            'reservation_status',
            ReservationStatus::CANCELLED->value
        )->count();

        // Payment Method

        $cashReservations = Reservation::where(
            'purchase_option',
            'cash'
        )->count();

        $financingReservations = Reservation::where(
            'purchase_option',
            'financing'
        )->count();

        // Totals

        $totalReservations = Reservation::count();

        $totalPayments =
            $cashReservations +
            $financingReservations;

        // Response

        return response()->json([
            'message' =>
            'Reservation pipeline statistics retrieved successfully.',

            'data' => [
                'reservation_pipeline' => [
                    'pending' => $pendingReservations,
                    'approved' => $approvedReservations,
                    'completed' => $completedReservations,
                    'cancelled' => $cancelledReservations,
                    'total' => $totalReservations,
                ],

                'payment_methods' => [
                    'cash' => $cashReservations,
                    'financing' => $financingReservations,
                    'total' => $totalPayments,
                ],
            ],
        ], 200);
    }
}
