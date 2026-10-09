<?php

namespace App\Http\Controllers;

use App\Models\VehicleBrand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleBrandController extends Controller
{
    /**
     * Display all vehicle brands.
     */
    public function index(): JsonResponse
    {
        $brands = VehicleBrand::withCount('models')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle brands retrieved successfully.',
            'data' => $brands,
        ], 200);
    }

    /**
     * Store a new vehicle brand.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand' => [
                'required',
                'string',
                'max:255',
                'unique:vehicle_brands,brand',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $brand = VehicleBrand::create($validated);

        return response()->json([
            'message' => 'Vehicle brand created successfully.',
            'data' => $brand,
        ], 201);
    }

    /**
     * Display a specific vehicle brand.
     */
    public function show(VehicleBrand $vehicleBrand): JsonResponse
    {
        $vehicleBrand->loadCount('models');

        return response()->json([
            'message' => 'Vehicle brand retrieved successfully.',
            'data' => $vehicleBrand,
        ], 200);
    }

    /**
     * Update a vehicle brand.
     */
    public function update(
        Request $request,
        VehicleBrand $vehicleBrand
    ): JsonResponse {
        $validated = $request->validate([
            'brand' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_brands', 'brand')
                    ->ignore($vehicleBrand->id),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehicleBrand->update($validated);

        return response()->json([
            'message' => 'Vehicle brand updated successfully.',
            'data' => $vehicleBrand->fresh(),
        ], 200);
    }

    /**
     * Delete a vehicle brand.
     */
    public function destroy(VehicleBrand $vehicleBrand): JsonResponse
    {
        if (
            $vehicleBrand->models()->exists() ||
            $vehicleBrand->vehicles()->exists()
        ) {
            return response()->json([
                'message' => 'This vehicle brand cannot be deleted because it is already being used by vehicle models or vehicles.',
            ], 409);
        }

        $vehicleBrand->delete();

        return response()->json([
            'message' => 'Vehicle brand deleted successfully.',
        ], 200);
    }
}
