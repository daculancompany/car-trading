<?php

namespace App\Http\Controllers;

use App\Models\RequestService;
use App\Models\VehicleRelease;
use App\Enums\VehicleReleaseStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ChecksCustomerOwnership;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class RequestServiceController extends Controller
{
    use ChecksCustomerOwnership;

    /**
     * GET ALL SERVICE REQUESTS
     *
     * Used by Admin / Secretary.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RequestService::with([
            'vehicleRelease.sale.reservation.customer.user',

            'vehicleRelease.sale.reservation.vehicle.brand',
            'vehicleRelease.sale.reservation.vehicle.model',
            'vehicleRelease.sale.reservation.vehicle.variant',
            'vehicleRelease.sale.reservation.vehicle.specs',
            'vehicleRelease.sale.reservation.vehicle.images',

            'jobOrder.assignedStaff:id,first_name,last_name',
            'jobOrder.inspection',
            'jobOrder.updates.user:id,username',
            'jobOrder.partsUsed.vehiclePart:id,part_name,unit_price',
            'jobOrder.payments',
            'jobOrder.estimateResponder:id,username',
        ]);

        if ($customer = $request->user()->customer) {
            $query->whereHas('vehicleRelease.sale.reservation', fn($q) => $q->where('customer_id', $customer->id));
        }

        $services = $query->latest()->get();

        return response()->json([
            'message' =>
            'Service requests retrieved successfully.',

            'data' => $services,
        ], 200);
    }

    /**
     * CREATE SERVICE REQUEST
     *
     * Customer submits a service request for a vehicle that was already sold.
     *
     * POST /api/request-services
     */
    /**
     * CREATE SERVICE REQUEST
     *
     * Customer submits a service request for a vehicle that was already sold.
     *
     * POST /api/request-services
     */
    public function store(
        Request $request
    ): JsonResponse {

        // Validate Request

        $validated = $request->validate([
            'vehicle_release_id' => [
                'required',
                'integer',
                'exists:vehicle_releases,id',
            ],

            'service_request_number' => [
                'required',
                'string',
                'max:255',
                'unique:request_services,service_request_number',
            ],

            'request_detail' => [
                'required',
                'string',
            ],

            'service_type' => [
                'sometimes',
                Rule::in(['repair', 'maintenance', 'inspection', 'washing', 'detailing', 'other']),
            ],

            'urgency' => [
                'sometimes',
                Rule::in(['low', 'normal', 'high', 'urgent']),
            ],

            'symptoms' => ['nullable', 'array', 'max:20'],
            'symptoms.*' => ['string', 'max:100'],

            'problem_started' => ['nullable', 'string', 'max:50'],

            'mileage' => ['nullable', 'integer', 'min:0'],

            'preferred_time' => ['nullable', Rule::in(['morning', 'afternoon', 'any'])],

            'contact_number' => ['nullable', 'string', 'max:30'],

            'photos' => [
                'required_without:request_proof',
                'array',
                'max:10',
            ],

            'photos.*' => [
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'request_proof' => [
                'required_without:photos',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'request_date_pref' => [
                'required',
                'date',
            ],
        ]);

        // Vehicle Must Be Released / Sold

        $vehicleRelease =
            VehicleRelease::with('sale.reservation')->findOrFail(
                $validated['vehicle_release_id']
            );

        $customer = $request->user()->customer;

        if (
            $customer &&
            $vehicleRelease->sale?->reservation?->customer_id !== $customer->id
        ) {
            return response()->json([
                'message' => 'You can only request service for your own vehicle.',
            ], 403);
        }

        if (
            $vehicleRelease->status !== VehicleReleaseStatus::RELEASED
        ) {
            return response()->json([
                'message' =>
                'A service request can only be submitted for a vehicle that has already been released.',
            ], 422);
        }

        // Prevent Duplicate Active Request
        // A vehicle cannot have multiple active service requests
        // at the same time.

        $existingRequest =
            RequestService::where(
                'vehicle_release_id',
                $vehicleRelease->id
            )
            ->whereIn('status', [
                'pending',
                'assigned',
                'in_progress',
            ])
            ->exists();

        if ($existingRequest) {

            return response()->json([
                'message' =>
                'This vehicle already has an active service request.',
            ], 409);
        }

        $files = $request->hasFile('photos')
            ? $request->file('photos')
            : [$request->file('request_proof')];

        $photoPaths = collect($files)
            ->filter()
            ->map(fn ($file) => $file->store('request-services', 'public'))
            ->values()
            ->all();

        $proofPath = $photoPaths[0];

        // Create Service Request
        // Status is controlled by the system.
        // New service request = pending

        $service = RequestService::create([

            'vehicle_release_id' =>
            $validated['vehicle_release_id'],

            'service_request_number' =>
            $validated['service_request_number'],

            'request_detail' =>
            $validated['request_detail'],

            'request_proof' =>
            $proofPath,

            'photos' => $photoPaths,

            'service_type' => $validated['service_type'] ?? 'repair',

            'urgency' => $validated['urgency'] ?? 'normal',

            'symptoms' => $validated['symptoms'] ?? [],

            'problem_started' => $validated['problem_started'] ?? null,

            'mileage' => $validated['mileage'] ?? null,

            'preferred_time' => $validated['preferred_time'] ?? null,

            'contact_number' => $validated['contact_number'] ?? null,

            'request_date_pref' =>
            $validated['request_date_pref'],

            'status' =>
            'pending',
        ]);

        // Load Relationships

        $service->load([

            'vehicleRelease.sale.reservation.customer.user',

            'vehicleRelease.sale.reservation.vehicle.brand',

            'vehicleRelease.sale.reservation.vehicle.model',

            'vehicleRelease.sale.reservation.vehicle.variant',

            'jobOrder',

        ]);

        // Response

        return response()->json([

            'message' =>
            'Service request submitted successfully.',

            'data' =>
            $service,

        ], 201);
    }

    /**
     * GET ONE SERVICE REQUEST
     */
    public function show(
        RequestService $requestService
    ): JsonResponse {
        $this->ensureCustomerOwns($requestService->vehicleRelease?->sale?->reservation?->customer_id);


        $requestService->load([
            'vehicleRelease.sale.reservation.customer.user',

            'vehicleRelease.sale.reservation.vehicle.brand',
            'vehicleRelease.sale.reservation.vehicle.model',
            'vehicleRelease.sale.reservation.vehicle.variant',

            'jobOrder',
        ]);

        return response()->json([
            'message' =>
            'Service request retrieved successfully.',

            'data' => $requestService,
        ], 200);
    }

    /**
     * UPDATE SERVICE REQUEST
     *
     * Admin / Secretary can update request information.
     *
     * Status changes should follow the workflow.
     */
    public function update(
        Request $request,
        RequestService $requestService
    ): JsonResponse {

        // Do Not Allow Editing Completed / Cancelled Requests

        if (
            in_array(
                $requestService->status,
                [
                    'completed',
                    'cancelled',
                ]
            )
        ) {
            return response()->json([
                'message' =>
                'A completed or cancelled service request cannot be modified.',
            ], 409);
        }

        $validated = $request->validate([
            'request_detail' => [
                'sometimes',
                'required',
                'string',
            ],

            'request_proof' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'request_date_pref' => [
                'sometimes',
                'required',
                'date',
            ],

            'status' => [
                'sometimes',
                Rule::in([
                    'pending',
                    'assigned',
                    'in_progress',
                    'completed',
                    'cancelled',
                ]),
            ],
        ]);

        // Update

        $requestService->update(
            $validated
        );

        return response()->json([
            'message' =>
            'Service request updated successfully.',

            'data' =>
            $requestService->fresh([
                'vehicleRelease.sale.reservation.customer.user',

                'vehicleRelease.sale.reservation.vehicle.brand',
                'vehicleRelease.sale.reservation.vehicle.model',
                'vehicleRelease.sale.reservation.vehicle.variant',

                'jobOrder',
            ]),
        ], 200);
    }

    /**
     * ARCHIVE SERVICE REQUEST
     *
     * DELETE /api/request-services/{requestService}
     */
    public function destroy(
        RequestService $requestService
    ): JsonResponse {

        /**
         * Cannot Archive If Job Order Exists
         */
        if (
            $requestService
            ->jobOrder()
            ->exists()
        ) {
            return response()->json([
                'message' =>
                'This service request cannot be archived because it already has a job order.',
            ], 409);
        }

        /**
         * Cannot Archive Completed Request
         */
        if (
            $requestService->status === 'completed'
        ) {
            return response()->json([
                'message' =>
                'A completed service request cannot be archived.',
            ], 409);
        }

        /**
         * Archive Service Request
         */
        $requestService->update([
            'archived' => 1,
        ]);

        return response()->json([
            'message' =>
            'Service request archived successfully.',
        ], 200);
    }
}
