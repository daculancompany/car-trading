<?php

namespace App\Services;

use App\Enums\FinancingInfoStatus;
use App\Services\FinancingInfoStatusService;
use App\Models\FinancingInfo;
use App\Models\Payment;
use App\Models\Reservation;
use App\Models\Sale;
use App\Models\VehicleRelease;

class TransactionStatusService
{
    public function __construct(
        protected ReservationStatusService $reservationService,
        protected PaymentStatusService $paymentService,
        protected SaleStatusService $saleService,
        protected VehicleReleaseService $releaseService,
        protected FinancingInfoStatusService $financingService,
    ) {}

    // RESERVATION

    public function syncVehicleFromReservation(
        Reservation $reservation
    ): void {
        $this->reservationService
            ->syncVehicleFromReservation($reservation);
    }

    public function syncReservationFromPayment(
        Payment $payment
    ): void {
        $this->paymentService
            ->syncReservationFromPayment($payment);
    }

    public function expireReservation(
        Reservation $reservation
    ): void {
        $this->reservationService
            ->expireReservation($reservation);
    }

    // SALE

    public function createSaleFromCompletedReservation(
        Reservation $reservation,
        ?int $createdBy = null
    ): ?Sale {
        return $this->saleService
            ->createSaleFromCompletedReservation(
                $reservation,
                $createdBy
            );
    }

    public function syncVehicleFromSale(
        Sale $sale
    ): void {
        $this->saleService
            ->syncVehicleFromSale($sale);
    }

    // VEHICLE RELEASE

    public function createVehicleReleaseFromCompletedSale(
        Sale $sale
    ): ?VehicleRelease {
        return $this->releaseService
            ->createVehicleReleaseFromCompletedSale($sale);
    }

    public function syncFromVehicleRelease(
        VehicleRelease $release
    ): void {
        $this->releaseService
            ->syncFromVehicleRelease($release);
    }

    // FINANCING

    /**
     * Update financing status.
     *
     * CDO only records the status received from
     * the customer / financing company.
     */
    public function updateFinancingStatus(
        FinancingInfo $financing,
        FinancingInfoStatus $status
    ): FinancingInfo {
        return $this->financingService
            ->updateStatus(
                $financing,
                $status
            );
    }

    public function isFinancingApproved(
        FinancingInfo $financing
    ): bool {
        return $this->financingService
            ->isApproved($financing);
    }

    public function isFinancingRejected(
        FinancingInfo $financing
    ): bool {
        return $this->financingService
            ->isRejected($financing);
    }

    public function isFinancingCompleted(
        FinancingInfo $financing
    ): bool {
        return $this->financingService
            ->isCompleted($financing);
    }
}
