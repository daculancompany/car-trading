<?php

namespace App\Http\Controllers;

use App\Models\VehicleVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleVariantController extends Controller
{
    /**
     * Display all vehicle variants.
     */
    public function index(): JsonResponse
    {
        $variants = VehicleVariant::with('model.brand')
            ->withCount('vehicles')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle variants retrieved successfully.',
            'data' => $variants,
        ], 200);
    }

    /**
     * Store a new vehicle variant.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model_id' => [
                'required',
                'integer',
                'exists:vehicle_models,id',
            ],

            'variant' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_variants', 'variant')
                    ->where(function ($query) use ($request) {
                        return $query->where('model_id', $request->model_id);
                    }),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehicleVariant = VehicleVariant::create($validated);

        $vehicleVariant->load('model.brand');

        return response()->json([
            'message' => 'Vehicle variant created successfully.',
            'data' => $vehicleVariant,
        ], 201);
    }

    /**
     * Display a specific vehicle variant.
     */
    public function show(VehicleVariant $vehicleVariant): JsonResponse
    {
        $vehicleVariant->load('model.brand');

        return response()->json([
            'message' => 'Vehicle variant retrieved successfully.',
            'data' => $vehicleVariant,
        ], 200);
    }

    /**
     * Update a vehicle variant.
     */
    public function update(
        Request $request,
        VehicleVariant $vehicleVariant
    ): JsonResponse {
        $validated = $request->validate([
            'model_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicle_models,id',
            ],

            'variant' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_variants', 'variant')
                    ->where(function ($query) use ($request, $vehicleVariant) {
                        return $query
                            ->where(
                                'model_id',
                                $request->model_id ?? $vehicleVariant->model_id
                            )
                            ->where('id', '!=', $vehicleVariant->id);
                    }),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehicleVariant->update($validated);

        $vehicleVariant->load('model.brand');

        return response()->json([
            'message' => 'Vehicle variant updated successfully.',
            'data' => $vehicleVariant->fresh('model.brand'),
        ], 200);
    }

    /**
     * Delete a vehicle variant.
     */
    public function destroy(
        VehicleVariant $vehicleVariant
    ): JsonResponse {
        if ($vehicleVariant->vehicles()->exists()) {
            return response()->json([
                'message' => 'This vehicle variant cannot be deleted because it is already being used by one or more vehicles.',
            ], 409);
        }

        $vehicleVariant->delete();

        return response()->json([
            'message' => 'Vehicle variant deleted successfully.',
        ], 200);
    }
}
