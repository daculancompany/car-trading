<?php

namespace App\Http\Controllers;

use App\Models\VehicleModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleModelController extends Controller
{
    /**
     * Display all vehicle models.
     */
    public function index(): JsonResponse
    {
        $models = VehicleModel::with('brand')
            ->withCount('variants')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle models retrieved successfully.',
            'data' => $models,
        ], 200);
    }

    /**
     * Store a new vehicle model.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => [
                'required',
                'integer',
                'exists:vehicle_brands,id',
            ],

            'model' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_models', 'model')
                    ->where(function ($query) use ($request) {
                        return $query->where('brand_id', $request->brand_id);
                    }),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehicleModel = VehicleModel::create($validated);

        $vehicleModel->load('brand');

        return response()->json([
            'message' => 'Vehicle model created successfully.',
            'data' => $vehicleModel,
        ], 201);
    }

    /**
     * Display a specific vehicle model.
     */
    public function show(VehicleModel $vehicleModel): JsonResponse
    {
        $vehicleModel->load('brand');

        return response()->json([
            'message' => 'Vehicle model retrieved successfully.',
            'data' => $vehicleModel,
        ], 200);
    }

    /**
     * Update a vehicle model.
     */
    public function update(
        Request $request,
        VehicleModel $vehicleModel
    ): JsonResponse {
        $validated = $request->validate([
            'brand_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicle_brands,id',
            ],

            'model' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_models', 'model')
                    ->where(function ($query) use ($request, $vehicleModel) {
                        return $query
                            ->where(
                                'brand_id',
                                $request->brand_id ?? $vehicleModel->brand_id
                            )
                            ->where('id', '!=', $vehicleModel->id);
                    }),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehicleModel->update($validated);

        $vehicleModel->load('brand');

        return response()->json([
            'message' => 'Vehicle model updated successfully.',
            'data' => $vehicleModel->fresh('brand'),
        ], 200);
    }

    /**
     * Delete a vehicle model.
     */
    public function destroy(VehicleModel $vehicleModel): JsonResponse
    {
        if (
            $vehicleModel->variants()->exists() ||
            $vehicleModel->vehicles()->exists()
        ) {
            return response()->json([
                'message' => 'This vehicle model cannot be deleted because it is already being used by variants or vehicles.',
            ], 409);
        }

        $vehicleModel->delete();

        return response()->json([
            'message' => 'Vehicle model deleted successfully.',
        ], 200);
    }
}
