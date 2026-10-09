<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Enums\VehicleReleaseStatus;
use App\Models\Sale;
use App\Models\VehicleRelease;
use App\Services\VehicleReleaseService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ChecksCustomerOwnership;

class VehicleReleaseController extends Controller
{
    use ChecksCustomerOwnership;

    private function relations(): array
    {
        return [
            'sale.createdBy',
            'sale.reservation.customer.user',
            'sale.reservation.vehicle.brand',
            'sale.reservation.vehicle.model',
            'sale.reservation.vehicle.variant',
            'sale.reservation.vehicle.specs',
            'sale.reservation.vehicle.vehicleDocuments',
            'requestService',
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = VehicleRelease::with($this->relations())
            ->where('archived', false);

        // Customers only see releases from their own purchases.
        if ($customer = $request->user()->customer) {
            $query->whereHas('sale.reservation', fn($q) => $q->where('customer_id', $customer->id));
        }

        $releases = $query->latest()->get();

        return response()->json([
            'message' => 'Vehicle releases retrieved successfully.',
            'data' => $releases,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sale_id' => ['required', 'integer', 'exists:sales,id', 'unique:vehicle_releases,sale_id'],
            'release_number' => ['required', 'string', 'max:255', 'unique:vehicle_releases,release_number'],
        ]);

        $sale = Sale::findOrFail($validated['sale_id']);

        if ($sale->status !== SaleStatus::COMPLETED) {
            return response()->json([
                'message' => 'A vehicle release can only be created for a completed sale.',
            ], 422);
        }

        $release = VehicleRelease::create([
            'sale_id' => $validated['sale_id'],
            'release_number' => $validated['release_number'],
            'release_date' => null,
            'status' => VehicleReleaseStatus::PENDING,
            'archived' => false,
        ]);

        $release->load($this->relations());

        return response()->json([
            'message' => 'Vehicle release created successfully.',
            'data' => $release,
        ], 201);
    }

    public function show(VehicleRelease $vehicleRelease): JsonResponse
    {
        $vehicleRelease->load($this->relations());

        return response()->json([
            'message' => 'Vehicle release retrieved successfully.',
            'data' => $vehicleRelease,
        ]);
    }

    public function update(Request $request, VehicleRelease $vehicleRelease): JsonResponse
    {
        $validated = $request->validate([
            'release_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                'unique:vehicle_releases,release_number,' . $vehicleRelease->id,
            ],
            'status' => ['sometimes', 'in:pending,released,cancelled'],
        ]);

        if (isset($validated['status'])) {
            if ($vehicleRelease->status === VehicleReleaseStatus::RELEASED) {
                return response()->json([
                    'message' => 'A released vehicle cannot be updated.',
                ], 409);
            }

            if ($validated['status'] === VehicleReleaseStatus::RELEASED) {
                $validated['release_date'] = now()->toDateString();
            }
        }

        $vehicleRelease->update($validated);
        $vehicleRelease->load($this->relations());

        return response()->json([
            'message' => 'Vehicle release updated successfully.',
            'data' => $vehicleRelease,
        ]);
    }

    public function release(
        VehicleRelease $vehicleRelease,
        VehicleReleaseService $statusService
    ): JsonResponse {
        if ($vehicleRelease->status === VehicleReleaseStatus::RELEASED) {
            return response()->json([
                'message' => 'This vehicle has already been released.',
            ], 409);
        }

        if ($vehicleRelease->status === VehicleReleaseStatus::CANCELLED) {
            return response()->json([
                'message' => 'A cancelled vehicle release cannot be released.',
            ], 409);
        }

        $vehicleRelease->load($this->relations());
        $sale = $vehicleRelease->sale;

        if (!$sale) {
            return response()->json([
                'message' => 'The sale associated with this release could not be found.',
            ], 422);
        }

        if ($sale->status !== SaleStatus::COMPLETED) {
            return response()->json([
                'message' => 'The sale must be completed before releasing the vehicle.',
            ], 422);
        }

        $vehicle = $sale->reservation?->vehicle;

        if (!$vehicle) {
            return response()->json([
                'message' => 'The vehicle associated with this release could not be found.',
            ], 422);
        }

        $documents = $vehicle->vehicleDocuments;

        if (!$documents || empty($documents->vehicle_cr_path)) {
            return response()->json([
                'message' => 'The vehicle CR has not been uploaded yet.',
            ], 422);
        }

        if (!$documents || empty($documents->vehicle_or_path)) {
            return response()->json([
                'message' => 'The vehicle OR has not been uploaded yet.',
            ], 422);
        }

        $vehicleRelease->update([
            'status' => VehicleReleaseStatus::RELEASED,
            'release_date' => now()->toDateString(),
        ]);

        $statusService->syncFromVehicleRelease(
            $vehicleRelease->fresh(['sale.reservation.vehicle'])
        );

        $vehicleRelease->load($this->relations());

        return response()->json([
            'message' => 'Vehicle released successfully.',
            'data' => $vehicleRelease,
        ]);
    }

    public function receipt(VehicleRelease $vehicleRelease)
    {
        $this->ensureCustomerOwns($vehicleRelease->sale?->reservation?->customer_id);

        $vehicleRelease->load($this->relations());

        $pdf = Pdf::loadView('vehicle-releases.receipt', [
            'vehicleRelease' => $vehicleRelease,
        ])->setPaper('A4', 'portrait');

        return $pdf->stream(
            'Receipt-' . $vehicleRelease->release_number . '.pdf'
        );
    }

    public function downloadReceipt(VehicleRelease $vehicleRelease)
    {
        $this->ensureCustomerOwns($vehicleRelease->sale?->reservation?->customer_id);

        $vehicleRelease->load($this->relations());

        $pdf = Pdf::loadView('vehicle-releases.receipt', [
            'vehicleRelease' => $vehicleRelease,
        ])->setPaper('A4', 'portrait');

        return $pdf->download(
            'Receipt-' . $vehicleRelease->release_number . '.pdf'
        );
    }

    public function deedOfSale(VehicleRelease $vehicleRelease)
    {
        $this->ensureCustomerOwns($vehicleRelease->sale?->reservation?->customer_id);

        $vehicleRelease->load($this->relations());

        $pdf = Pdf::loadView('vehicle-releases.deed-of-sale', [
            'vehicleRelease' => $vehicleRelease,
        ])->setPaper('A4', 'portrait');

        return $pdf->stream(
            'Deed-of-Sale-' . $vehicleRelease->release_number . '.pdf'
        );
    }

    public function downloadDeedOfSale(VehicleRelease $vehicleRelease)
    {
        $this->ensureCustomerOwns($vehicleRelease->sale?->reservation?->customer_id);

        $vehicleRelease->load($this->relations());

        $pdf = Pdf::loadView('vehicle-releases.deed-of-sale', [
            'vehicleRelease' => $vehicleRelease,
        ])->setPaper('A4', 'portrait');

        return $pdf->download(
            'Deed-of-Sale-' . $vehicleRelease->release_number . '.pdf'
        );
    }

    public function destroy(VehicleRelease $vehicleRelease): JsonResponse
    {
        if ($vehicleRelease->status === VehicleReleaseStatus::RELEASED) {
            return response()->json([
                'message' => 'A released vehicle cannot be archived.',
            ], 409);
        }

        if ($vehicleRelease->requestService()->exists()) {
            return response()->json([
                'message' => 'This vehicle release cannot be archived because it already has a service request.',
            ], 409);
        }

        $vehicleRelease->update(['archived' => true]);

        return response()->json([
            'message' => 'Vehicle release archived successfully.',
        ]);
    }
}
