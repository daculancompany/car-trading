<?php

namespace App\Services;

use App\Enums\SaleStatus;
use App\Enums\VehicleStatus;
use App\Models\Reservation;
use App\Models\Sale;
use Illuminate\Support\Facades\Log;

class SaleStatusService
{
    public function __construct(
        protected VehicleReleaseService $releaseService
    ) {}

    /**
     * Create Sale from Reservation.
     *
     * This can create a Sale regardless of reservation status.
     * The Sale status is controlled by PaymentStatusService.
     */
    public function createSaleFromReservation(
        Reservation $reservation,
        SaleStatus $status = SaleStatus::PENDING,
        ?int $createdBy = null
    ): ?Sale {

        // PREVENT DUPLICATE SALE

        $existingSale = Sale::where(
            'reservation_id',
            $reservation->id
        )->first();

        if ($existingSale) {
            $existingSale->update([
                'status' => $status,
            ]);

            $this->syncVehicleFromSale(
                $existingSale->fresh()
            );

            return $existingSale->fresh();
        }

        // VEHICLE

        $vehicle = $reservation->vehicle;

        if (!$vehicle) {
            Log::warning(
                'Unable to create Sale: reservation has no vehicle.',
                [
                    'reservation_id' =>
                    $reservation->id,
                ]
            );

            return null;
        }

        // CREATED BY

        $createdBy ??= auth()->id();

        if (!$createdBy) {
            Log::warning(
                'Unable to create Sale: created_by is missing.',
                [
                    'reservation_id' =>
                    $reservation->id,
                ]
            );

            return null;
        }

        // CREATE SALE

        $sale = Sale::create([
            'reservation_id' =>
            $reservation->id,

            'created_by' =>
            $createdBy,

            'invoice_number' =>
            $this->generateInvoiceNumber(),

            'selling_price' =>
            $vehicle->selling_price,

            'discount_amount' =>
            0,

            'sale_date' =>
            now(),

            'status' =>
            $status,
        ]);

        Log::info(
            'SALE CREATED',
            [
                'sale_id' =>
                $sale->id,

                'reservation_id' =>
                $reservation->id,

                'status' =>
                $status->value,
            ]
        );

        // SYNC VEHICLE

        $this->syncVehicleFromSale(
            $sale->fresh()
        );

        return $sale->fresh();
    }

    /**
     * Sync vehicle from Sale status.
     */
    public function syncVehicleFromSale(
        Sale $sale
    ): void {

        $reservation =
            $sale->reservation;

        if (!$reservation) {
            return;
        }

        $vehicle =
            $reservation->vehicle;

        if (!$vehicle) {
            return;
        }

        // COMPLETED

        if (
            $sale->status ===
            SaleStatus::COMPLETED
        ) {
            $vehicle->update([
                'status' =>
                VehicleStatus::SOLD,
            ]);

            $this->releaseService
                ->createVehicleReleaseFromCompletedSale(
                    $sale
                );

            Log::info(
                'SALE COMPLETED - VEHICLE SOLD',
                [
                    'sale_id' =>
                    $sale->id,

                    'vehicle_id' =>
                    $vehicle->id,
                ]
            );

            return;
        }

        // CANCELLED

        if (
            $sale->status ===
            SaleStatus::CANCELLED
        ) {
            // Do not release a vehicle if an actual
            // vehicle release already exists.

            if (
                !$sale
                    ->vehicleRelease()
                    ->exists()
            ) {
                $vehicle->update([
                    'status' =>
                    VehicleStatus::AVAILABLE,
                ]);

                Log::info(
                    'SALE CANCELLED - VEHICLE AVAILABLE',
                    [
                        'sale_id' =>
                        $sale->id,

                        'vehicle_id' =>
                        $vehicle->id,
                    ]
                );
            }

            return;
        }

        // PENDING
        // Do NOT mark vehicle as SOLD.

        if (
            $sale->status ===
            SaleStatus::PENDING
        ) {
            Log::info(
                'SALE PENDING - VEHICLE NOT SOLD',
                [
                    'sale_id' =>
                    $sale->id,

                    'vehicle_id' =>
                    $vehicle->id,
                ]
            );
        }
    }

    /**
     * Generate invoice number.
     */
    public function generateInvoiceNumber(): string
    {
        $date =
            now()->format('Ymd');

        $prefix =
            "INV-{$date}-";

        $lastSale =
            Sale::where(
                'invoice_number',
                'like',
                $prefix . '%'
            )
            ->latest('id')
            ->first();

        if (!$lastSale) {
            $number = 1;
        } else {
            $lastNumber =
                (int) str_replace(
                    $prefix,
                    '',
                    $lastSale->invoice_number
                );

            $number =
                $lastNumber + 1;
        }

        return $prefix .
            str_pad(
                $number,
                2,
                '0',
                STR_PAD_LEFT
            );
    }
}
