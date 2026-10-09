<?php

namespace App\Http\Controllers;

use App\Models\VehicleSpec;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleSpecController extends Controller
{
    /**
     * Display all vehicle specifications.
     */
    public function index(): JsonResponse
    {
        $specs = VehicleSpec::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle specifications retrieved successfully.',
            'data' => $specs,
        ], 200);
    }

    /**
     * Store a new vehicle specification.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
                'unique:vehicle_specs,vehicle_id',
            ],

            'plate_number' => [
                'required',
                'string',
                'max:255',
                'unique:vehicle_specs,plate_number',
            ],

            'engine_number' => [
                'required',
                'string',
                'max:255',
                'unique:vehicle_specs,engine_number',
            ],

            'chassis_number' => [
                'required',
                'string',
                'max:255',
                'unique:vehicle_specs,chassis_number',
            ],

            'mileage' => [
                'required',
                'integer',
                'min:0',
            ],

            'fuel_type' => [
                'required',
                Rule::in([
                    'gasoline',
                    'diesel',
                    'electric',
                ]),
            ],

            'transmission' => [
                'required',
                Rule::in([
                    'manual',
                    'automatic',
                ]),
            ],
        ]);

        $spec = VehicleSpec::create($validated);

        $spec->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' => 'Vehicle specifications created successfully.',
            'data' => $spec,
        ], 201);
    }

    /**
     * Display a specific vehicle specification.
     */
    public function show(VehicleSpec $vehicleSpec): JsonResponse
    {
        $vehicleSpec->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' => 'Vehicle specifications retrieved successfully.',
            'data' => $vehicleSpec,
        ], 200);
    }

    /**
     * Update a vehicle specification.
     */
    public function update(
        Request $request,
        VehicleSpec $vehicleSpec
    ): JsonResponse {
        $validated = $request->validate([
            'vehicle_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicles,id',
                Rule::unique('vehicle_specs', 'vehicle_id')
                    ->ignore($vehicleSpec->id),
            ],

            'plate_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_specs', 'plate_number')
                    ->ignore($vehicleSpec->id),
            ],

            'engine_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_specs', 'engine_number')
                    ->ignore($vehicleSpec->id),
            ],

            'chassis_number' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_specs', 'chassis_number')
                    ->ignore($vehicleSpec->id),
            ],

            'mileage' => [
                'sometimes',
                'required',
                'integer',
                'min:0',
            ],

            'fuel_type' => [
                'sometimes',
                'required',
                Rule::in([
                    'gasoline',
                    'diesel',
                    'electric',
                ]),
            ],

            'transmission' => [
                'sometimes',
                'required',
                Rule::in([
                    'manual',
                    'automatic',
                ]),
            ],
        ]);

        $vehicleSpec->update($validated);

        $vehicleSpec->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' => 'Vehicle specifications updated successfully.',
            'data' => $vehicleSpec->fresh([
                'vehicle.brand',
                'vehicle.model',
                'vehicle.variant',
            ]),
        ], 200);
    }

    /**
     * Delete a vehicle specification.
     */
    public function destroy(VehicleSpec $vehicleSpec): JsonResponse
    {
        $vehicleSpec->delete();

        return response()->json([
            'message' => 'Vehicle specifications deleted successfully.',
        ], 200);
    }
}
