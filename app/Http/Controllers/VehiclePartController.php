<?php

namespace App\Http\Controllers;

use App\Models\VehiclePart;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class VehiclePartController extends Controller
{
    public function __construct(private InventoryService $inventory)
    {
    }

    /**
     * Display all vehicle parts.
     */
    public function index(): JsonResponse
    {
        $vehicleParts = VehiclePart::where('archived', false)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle parts retrieved successfully.',
            'data' => $vehicleParts,
        ], 200);
    }

    /**
     * Store a new vehicle part.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'part_name' => [
                'required',
                'string',
                'max:255',
                'unique:vehicle_parts,part_name',
            ],

            'category' => [
                'required',
                'string',
                'max:255',
            ],

            'quantity' => [
                'required',
                'integer',
                'min:0',
            ],

            'unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'reference_no' => [
                'nullable',
                'string',
                'max:255',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],

            'archived' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $vehiclePart = DB::transaction(function () use ($request, $validated) {
            $vehiclePart = VehiclePart::create([
                'part_name' => $validated['part_name'],
                'category' => $validated['category'],
                'quantity' => 0,
                'unit_price' => $validated['unit_price'],
                'archived' => $validated['archived'] ?? false,
                'image_path' => $request->hasFile('image')
                    ? $request->file('image')->store('vehicle-parts', 'public')
                    : null,
            ]);

            if ($validated['quantity'] > 0) {
                $this->inventory->record($vehiclePart->id, 'receiving', $validated['quantity'], [
                    'unit_cost' => $validated['unit_price'],
                    'reference_no' => $validated['reference_no'] ?? null,
                    'remarks' => 'Opening stock',
                ]);
            }

            return $vehiclePart->fresh();
        });

        return response()->json([
            'message' => 'Vehicle part created successfully.',
            'data' => $vehiclePart,
        ], 201);
    }

    /**
     * Display a specific vehicle part.
     */
    public function show(VehiclePart $vehiclePart): JsonResponse
    {
        return response()->json([
            'message' => 'Vehicle part retrieved successfully.',
            'data' => $vehiclePart,
        ], 200);
    }

    /**
     * Update a vehicle part.
     */
    public function update(
        Request $request,
        VehiclePart $vehiclePart
    ): JsonResponse {
        $validated = $request->validate([
            'part_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('vehicle_parts', 'part_name')
                    ->ignore($vehiclePart->id),
            ],

            'category' => [
                'required',
                'string',
                'max:255',
            ],

            'unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],

            'remove_image' => [
                'sometimes',
                'boolean',
            ],

            'archived' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $data = collect($validated)
            ->only(['part_name', 'category', 'unit_price', 'archived'])
            ->all();

        if ($request->hasFile('image') || $request->boolean('remove_image')) {
            if ($vehiclePart->image_path) {
                Storage::disk('public')->delete($vehiclePart->image_path);
            }

            $data['image_path'] = $request->hasFile('image')
                ? $request->file('image')->store('vehicle-parts', 'public')
                : null;
        }

        $vehiclePart->update($data);

        return response()->json([
            'message' => 'Vehicle part updated successfully.',
            'data' => $vehiclePart->fresh(),
        ], 200);
    }

    /**
     * Archive a vehicle part.
     */
    public function destroy(
        VehiclePart $vehiclePart
    ): JsonResponse {
        $vehiclePart->update([
            'archived' => true,
        ]);

        return response()->json([
            'message' => 'Vehicle part archived successfully.',
        ], 200);
    }
}
