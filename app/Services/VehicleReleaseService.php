<?php

namespace App\Services;

use App\Enums\ReservationStatus;
use App\Enums\SaleStatus;
use App\Enums\VehicleReleaseStatus;
use App\Enums\VehicleStatus;
use App\Models\Sale;
use App\Models\VehicleRelease;
use Illuminate\Support\Facades\Log;

class VehicleReleaseService
{
    /**
     * Automatically create a Vehicle Release
     * after a Sale is completed.
     */
    public function createVehicleReleaseFromCompletedSale(
        Sale $sale
    ): ?VehicleRelease {

        // ONLY COMPLETED SALES

        if (
            $sale->status !==
            SaleStatus::COMPLETED
        ) {

            Log::warning(
                'Sale is not completed. Release not created.',
                [
                    'sale_id' =>
                    $sale->id,

                    'sale_status' =>
                    $sale->status instanceof SaleStatus
                        ? $sale->status->value
                        : $sale->status,
                ]
            );

            return null;
        }

        // PREVENT DUPLICATE RELEASE

        $existingRelease =
            VehicleRelease::where(
                'sale_id',
                $sale->id
            )->first();

        if ($existingRelease) {

            Log::info(
                'VEHICLE RELEASE ALREADY EXISTS',
                [
                    'vehicle_release_id' =>
                    $existingRelease->id,

                    'sale_id' =>
                    $sale->id,
                ]
            );

            return $existingRelease;
        }

        // GENERATE RELEASE NUMBER

        $releaseNumber =
            $this->generateReleaseNumber();

        // CREATE PENDING RELEASE

        $release =
            VehicleRelease::create([
                'sale_id' =>
                $sale->id,

                'release_number' =>
                $releaseNumber,

                // Generated documents

                'receipt_path' =>
                null,

                'deed_of_sale_path' =>
                null,

                // Actual release date

                'release_date' =>
                null,

                // Initial status

                'status' =>
                VehicleReleaseStatus::PENDING,
            ]);

        Log::info(
            'VEHICLE RELEASE AUTOMATICALLY CREATED',
            [
                'vehicle_release_id' =>
                $release->id,

                'sale_id' =>
                $sale->id,

                'release_number' =>
                $release->release_number,

                'status' =>
                $release->status instanceof VehicleReleaseStatus
                    ? $release->status->value
                    : $release->status,
            ]
        );

        return $release;
    }

    /**
     * Sync transaction after Vehicle Release status changes.
     */
    public function syncFromVehicleRelease(VehicleRelease $release): void
    {
        $sale = $release->sale;

        if (!$sale) {
            Log::warning('Vehicle release has no sale.', [
                'vehicle_release_id' => $release->id,
            ]);
            return;
        }

        $reservation = $sale->reservation;

        if (!$reservation) {
            Log::warning('Sale has no reservation.', [
                'vehicle_release_id' => $release->id,
                'sale_id' => $sale->id,
            ]);
            return;
        }

        // NORMALIZE RELEASE STATUS
        $releaseStatus = $release->status instanceof VehicleReleaseStatus
            ? $release->status->value
            : (string) $release->status;

        // RELEASED → COMPLETED
        // ONLY this flow is changed.
        // Vehicle Release = released
        // ↓
        // Sale = completed
        // ↓
        // Reservation = completed
        // ↓
        // Vehicle = sold
        if ($releaseStatus === VehicleReleaseStatus::RELEASED->value) {

            $sale->update([
                'status' => SaleStatus::COMPLETED,
            ]);

            $reservation->historyAction = 'released';
            $reservation->historyNote = 'Vehicle released to the customer.';
            $reservation->update([
                'reservation_status' => ReservationStatus::COMPLETED,
            ]);

            $reservation->refresh();

            $vehicle = $reservation->vehicle;

            if ($vehicle) {
                $vehicle->update([
                    'status' => VehicleStatus::SOLD,
                ]);
            }

            Log::info('VEHICLE RELEASE SYNC COMPLETED', [
                'vehicle_release_id' => $release->id,
                'sale_id' => $sale->id,
                'reservation_id' => $reservation->id,
                'vehicle_id' => $vehicle?->id,
                'release_status' => $releaseStatus,
                'reservation_status' => $reservation->reservation_status instanceof ReservationStatus
                    ? $reservation->reservation_status->value
                    : (string) $reservation->reservation_status,
            ]);

            return;
        }

        // CANCELLED
        // DO NOT CHANGE THIS FLOW.
        if ($releaseStatus === VehicleReleaseStatus::CANCELLED->value) {
            return;
        }
    }

    /**
     * Generate release number.
     */
    private function generateReleaseNumber(): string
    {
        $date =
            now()->format('Ymd');

        $prefix =
            "REL-{$date}-";

        $lastRelease =
            VehicleRelease::where(
                'release_number',
                'like',
                $prefix . '%'
            )
            ->latest('id')
            ->first();

        if (!$lastRelease) {

            $number = 1;
        } else {

            $lastNumber =
                (int) str_replace(
                    $prefix,
                    '',
                    $lastRelease->release_number
                );

            $number =
                $lastNumber + 1;
        }

        return $prefix .
            str_pad(
                $number,
                4,
                '0',
                STR_PAD_LEFT
            );
    }
}
