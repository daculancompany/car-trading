<?php

namespace App\Services;

use App\Enums\ReservationStatus;
use App\Enums\SaleStatus;
use App\Enums\VehicleStatus;
use App\Enums\VehicleReleaseStatus;
use App\Models\Reservation;
use App\Models\VehicleRelease;
use Illuminate\Support\Facades\Log;

class ReservationStatusService
{
    public function __construct(protected SaleStatusService $saleService) {}

    public function syncVehicleFromReservation(Reservation $reservation): void
    {
        $vehicle = $reservation->vehicle;

        if (!$vehicle) {
            Log::warning('Reservation has no vehicle.', ['reservation_id' => $reservation->id]);
            return;
        }

        $status = $reservation->reservation_status;
        $statusValue = $status instanceof ReservationStatus ? $status->value : (string) $status;

        // VEHICLE RELEASE → COMPLETED RESERVATION

        $vehicleRelease = VehicleRelease::whereHas('sale', function ($query) use ($reservation) {
            $query->where('reservation_id', $reservation->id);
        })->latest('id')->first();

        if ($vehicleRelease && $vehicleRelease->status === VehicleReleaseStatus::RELEASED) {

            if ($statusValue !== ReservationStatus::COMPLETED->value) {
                $reservation->historyAction = 'released';
                $reservation->historyNote = 'Vehicle released to the customer.';
                $reservation->update([
                    'reservation_status' => ReservationStatus::COMPLETED,
                ]);

                Log::info('RESERVATION AUTOMATICALLY COMPLETED AFTER VEHICLE RELEASE', [
                    'reservation_id' => $reservation->id,
                    'vehicle_id' => $vehicle->id,
                    'vehicle_release_id' => $vehicleRelease->id,
                ]);
            }

            $sale = $this->saleService->createSaleFromReservation(
                $reservation->fresh('vehicle'),
                SaleStatus::COMPLETED,
                auth()->id()
            );

            if (!$sale) {
                Log::warning('SALE WAS NOT CREATED AFTER VEHICLE RELEASE.', [
                    'reservation_id' => $reservation->id,
                    'vehicle_release_id' => $vehicleRelease->id,
                ]);
                return;
            }

            $saleStatus = $sale->status instanceof SaleStatus ? $sale->status->value : (string) $sale->status;

            if ($saleStatus === SaleStatus::COMPLETED->value) {
                $vehicle->update(['status' => VehicleStatus::SOLD]);

                Log::info('VEHICLE SET TO SOLD AFTER RELEASE.', [
                    'vehicle_id' => $vehicle->id,
                    'sale_id' => $sale->id,
                    'vehicle_release_id' => $vehicleRelease->id,
                ]);
            }

            return;
        }

        // PENDING → UNAVAILABLE

        if (in_array($statusValue, [
            ReservationStatus::PENDING_RESERVATION->value,
            ReservationStatus::PENDING_DOCUMENTS->value,
            ReservationStatus::PENDING_FINANCING->value,
            ReservationStatus::PENDING_PAYMENT->value,
        ], true)) {

            $vehicleStatus = $vehicle->status instanceof VehicleStatus
                ? $vehicle->status->value
                : (string) $vehicle->status;

            if ($vehicleStatus !== VehicleStatus::SOLD->value) {
                $vehicle->update(['status' => VehicleStatus::UNAVAILABLE]);

                Log::info('VEHICLE SET TO UNAVAILABLE', [
                    'vehicle_id' => $vehicle->id,
                    'reservation_id' => $reservation->id,
                    'reservation_status' => $statusValue,
                ]);
            }

            return;
        }

        // RESERVED → RESERVED

        if ($statusValue === ReservationStatus::RESERVED->value) {

            $vehicleStatus = $vehicle->status instanceof VehicleStatus
                ? $vehicle->status->value
                : (string) $vehicle->status;

            if ($vehicleStatus === VehicleStatus::SOLD->value) {
                Log::warning('Cannot reserve an already sold vehicle.', [
                    'vehicle_id' => $vehicle->id,
                    'reservation_id' => $reservation->id,
                ]);
                return;
            }

            $vehicle->update(['status' => VehicleStatus::RESERVED]);

            Log::info('VEHICLE SET TO RESERVED', [
                'vehicle_id' => $vehicle->id,
                'reservation_id' => $reservation->id,
            ]);

            return;
        }

        // COMPLETED → SOLD

        if ($statusValue === ReservationStatus::COMPLETED->value) {

            $sale = $this->saleService->createSaleFromReservation(
                $reservation->fresh('vehicle'),
                SaleStatus::COMPLETED,
                auth()->id()
            );

            if (!$sale) {
                Log::warning('SALE WAS NOT CREATED.', [
                    'reservation_id' => $reservation->id,
                ]);
                return;
            }

            $saleStatus = $sale->status instanceof SaleStatus
                ? $sale->status->value
                : (string) $sale->status;

            if ($saleStatus === SaleStatus::COMPLETED->value) {
                $vehicle->update(['status' => VehicleStatus::SOLD]);

                Log::info('VEHICLE SET TO SOLD', [
                    'vehicle_id' => $vehicle->id,
                    'sale_id' => $sale->id,
                ]);
            }

            return;
        }

        // CANCELLED / EXPIRED → AVAILABLE

        if (in_array($statusValue, [
            ReservationStatus::CANCELLED->value,
            ReservationStatus::REJECTED->value,
            ReservationStatus::EXPIRED->value,
        ], true)) {

            $vehicleStatus = $vehicle->status instanceof VehicleStatus
                ? $vehicle->status->value
                : (string) $vehicle->status;

            if ($vehicleStatus === VehicleStatus::SOLD->value) {
                return;
            }

            $hasActiveReservation = $vehicle->reservations()
                ->where('id', '!=', $reservation->id)
                ->whereIn('reservation_status', [
                    ReservationStatus::PENDING_RESERVATION->value,
                    ReservationStatus::PENDING_DOCUMENTS->value,
                    ReservationStatus::PENDING_FINANCING->value,
                    ReservationStatus::PENDING_PAYMENT->value,
                    ReservationStatus::RESERVED->value,
                ])
                ->exists();

            if (!$hasActiveReservation) {
                $vehicle->update(['status' => VehicleStatus::AVAILABLE]);

                Log::info('VEHICLE SET TO AVAILABLE', [
                    'vehicle_id' => $vehicle->id,
                    'reservation_id' => $reservation->id,
                ]);
            }

            return;
        }
    }

    public function expireReservation(Reservation $reservation): void
    {
        if (!$reservation->expires_at || !$reservation->expires_at->isPast()) {
            return;
        }

        $status = $reservation->reservation_status;
        $statusValue = $status instanceof ReservationStatus ? $status->value : (string) $status;

        if (!in_array($statusValue, [
            ReservationStatus::PENDING_RESERVATION->value,
            ReservationStatus::PENDING_DOCUMENTS->value,
            ReservationStatus::PENDING_FINANCING->value,
            ReservationStatus::PENDING_PAYMENT->value,
        ], true)) {
            return;
        }

        $reservation->historyAction = 'expired';
        $reservation->historyNote = 'Reservation hold period ended.';
        $reservation->update([
            'reservation_status' => ReservationStatus::EXPIRED,
        ]);

        Log::info('RESERVATION EXPIRED', [
            'reservation_id' => $reservation->id,
        ]);

        $this->syncVehicleFromReservation(
            $reservation->fresh('vehicle')
        );
    }
}
