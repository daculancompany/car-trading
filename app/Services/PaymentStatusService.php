<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Enums\ReservationStatus;
use App\Enums\SaleStatus;
use App\Models\Payment;
use App\Models\Sale;
use Illuminate\Support\Facades\Log;

class PaymentStatusService
{
    public function __construct(
        protected ReservationStatusService $reservationService,
        protected SaleStatusService $saleService
    ) {}

    /**
     * Sync reservation and sale status after payment status changes.
     *
     * PAYMENT STATUS → SALE STATUS
     *
     * pending  → pending
     * verified → completed
     * rejected → cancelled
     */
    public function syncReservationFromPayment(
        Payment $payment
    ): void {
        $reservation = $payment->reservation;

        if (!$reservation) {
            Log::warning(
                'Payment has no reservation.',
                [
                    'payment_id' => $payment->id,
                ]
            );

            return;
        }

        // SYNC SALE STATUS

        $sale = $this->syncSaleFromPayment($payment);

        // REJECTED PAYMENT
        // Rejected payment = cancelled sale.

        if (
            $payment->payment_status ===
            PaymentStatus::REJECTED
        ) {
            return;
        }

        // ONLY VERIFIED PAYMENTS

        if (
            $payment->payment_status !==
            PaymentStatus::VERIFIED
        ) {
            return;
        }

        // RESERVATION FEE

        if (
            $payment->payment_type ===
            'reservation_fee'
            &&
            in_array(
                $reservation->reservation_status,
                [
                    ReservationStatus::PENDING_RESERVATION,
                    ReservationStatus::PENDING_PAYMENT,
                ],
                true
            )
        ) {
            $reservation->historyAction = 'payment_verified';
            $reservation->historyNote = 'Reservation fee verified.';
            $reservation->update([
                'reservation_status' =>
                ReservationStatus::RESERVED,
            ]);

            Log::info(
                'RESERVATION SET TO RESERVED FROM PAYMENT',
                [
                    'reservation_id' =>
                    $reservation->id,

                    'payment_id' =>
                    $payment->id,

                    'sale_id' =>
                    $sale?->id,
                ]
            );

            $this->reservationService
                ->syncVehicleFromReservation(
                    $reservation->fresh('vehicle')
                );

            return;
        }

        // FULL PAYMENT
        // Verified full payment = completed sale.

        if (
            $payment->payment_type ===
            'full_payment'
        ) {
            Log::info(
                'FULL PAYMENT VERIFIED - SALE COMPLETED',
                [
                    'reservation_id' =>
                    $reservation->id,

                    'payment_id' =>
                    $payment->id,

                    'sale_id' =>
                    $sale?->id,
                ]
            );

            // Reservation

            if (
                $reservation->reservation_status ===
                ReservationStatus::PENDING_PAYMENT
            ) {
                $reservation->historyAction = 'payment_verified';
                $reservation->historyNote = 'Full payment verified.';
                $reservation->update([
                    'reservation_status' =>
                    ReservationStatus::RESERVED,
                ]);

                $this->reservationService
                    ->syncVehicleFromReservation(
                        $reservation->fresh('vehicle')
                    );
            }
        }
    }

    /**
     * Create or update Sale based on Payment status.
     *
     * pending  → pending
     * verified → completed
     * rejected → cancelled
     */
    protected function syncSaleFromPayment(
        Payment $payment
    ): ?Sale {
        $reservation = $payment->reservation;

        if (!$reservation) {
            return null;
        }

        // FIND EXISTING SALE

        $sale = Sale::where(
            'reservation_id',
            $reservation->id
        )->first();

        // VEHICLE

        $vehicle = $reservation->vehicle;

        if (!$vehicle) {
            Log::warning(
                'Unable to sync Sale: reservation has no vehicle.',
                [
                    'reservation_id' =>
                    $reservation->id,

                    'payment_id' =>
                    $payment->id,
                ]
            );

            return $sale;
        }

        // CREATED BY

        $createdBy =
            $sale?->created_by ??
            auth()->id();

        // CREATE SALE IF IT DOES NOT EXIST

        if (!$sale) {
            if (!$createdBy) {
                Log::warning(
                    'Unable to create Sale: created_by is missing.',
                    [
                        'reservation_id' =>
                        $reservation->id,

                        'payment_id' =>
                        $payment->id,
                    ]
                );

                return null;
            }

            $sale = Sale::create([
                'reservation_id' =>
                $reservation->id,

                'created_by' =>
                $createdBy,

                'invoice_number' =>
                $this->saleService
                    ->generateInvoiceNumber(),

                'selling_price' =>
                $vehicle->selling_price,

                'discount_amount' =>
                0,

                'sale_date' =>
                now(),

                'status' =>
                $this->getSaleStatusFromPayment(
                    $payment
                ),
            ]);

            Log::info(
                'SALE CREATED FROM PAYMENT STATUS',
                [
                    'sale_id' =>
                    $sale->id,

                    'reservation_id' =>
                    $reservation->id,

                    'payment_id' =>
                    $payment->id,

                    'payment_status' =>
                    $payment->payment_status instanceof PaymentStatus
                        ? $payment->payment_status->value
                        : $payment->payment_status,

                    'sale_status' =>
                    $sale->status instanceof SaleStatus
                        ? $sale->status->value
                        : $sale->status,
                ]
            );
        } else {
            // UPDATE EXISTING SALE

            $newStatus =
                $this->getSaleStatusFromPayment(
                    $payment
                );

            $sale->update([
                'status' =>
                $newStatus,
            ]);

            Log::info(
                'SALE STATUS UPDATED FROM PAYMENT',
                [
                    'sale_id' =>
                    $sale->id,

                    'reservation_id' =>
                    $reservation->id,

                    'payment_id' =>
                    $payment->id,

                    'sale_status' =>
                    $newStatus instanceof SaleStatus
                        ? $newStatus->value
                        : $newStatus,
                ]
            );
        }

        // SYNC VEHICLE

        $this->saleService
            ->syncVehicleFromSale(
                $sale->fresh()
            );

        return $sale->fresh();
    }

    /**
     * Convert PaymentStatus to SaleStatus.
     */
    protected function getSaleStatusFromPayment(
        Payment $payment
    ): SaleStatus {
        return match ($payment->payment_status instanceof PaymentStatus
            ? $payment->payment_status
            : PaymentStatus::from(
                $payment->payment_status
            )) {
            PaymentStatus::PENDING =>
            SaleStatus::PENDING,

            PaymentStatus::VERIFIED =>
            SaleStatus::COMPLETED,

            PaymentStatus::REJECTED =>
            SaleStatus::CANCELLED,
        };
    }
}
