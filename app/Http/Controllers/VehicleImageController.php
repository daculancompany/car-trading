<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehicleImageController extends Controller
{
    /**
     * Display all vehicle images.
     */
    public function index(): JsonResponse
    {
        $images = VehicleImage::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle images retrieved successfully.',
            'data' => $images,
        ], 200);
    }

    /**
     * Upload multiple images for a vehicle.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'images' => [
                'required',
                'array',
                'min:1',
            ],

            'images.*' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ]);

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);

        $uploadedImages = [];

        foreach ($validated['images'] as $image) {
            $path = $image->store(
                'vehicles/' . $vehicle->id,
                'public'
            );

            $vehicleImage = VehicleImage::create([
                'vehicle_id' => $vehicle->id,
                'image_path' => $path,
            ]);

            $uploadedImages[] = $vehicleImage;
        }

        return response()->json([
            'message' => 'Vehicle images uploaded successfully.',
            'data' => $uploadedImages,
        ], 201);
    }

    /**
     * Display a specific vehicle image.
     */
    public function show(VehicleImage $vehicleImage): JsonResponse
    {
        $vehicleImage->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' => 'Vehicle image retrieved successfully.',
            'data' => $vehicleImage,
        ], 200);
    }

    /**
     * Replace a specific vehicle image.
     */
    public function update(
        Request $request,
        VehicleImage $vehicleImage
    ): JsonResponse {
        $validated = $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ]);

        // Delete old image from storage
        if (
            $vehicleImage->image_path &&
            Storage::disk('public')->exists($vehicleImage->image_path)
        ) {
            Storage::disk('public')->delete(
                $vehicleImage->image_path
            );
        }

        // Store new image
        $path = $validated['image']->store(
            'vehicles/' . $vehicleImage->vehicle_id,
            'public'
        );

        $vehicleImage->update([
            'image_path' => $path,
        ]);

        return response()->json([
            'message' => 'Vehicle image updated successfully.',
            'data' => $vehicleImage->fresh(),
        ], 200);
    }

    /**
     * Delete a specific vehicle image.
     */
    public function destroy(
        VehicleImage $vehicleImage
    ): JsonResponse {
        // Delete physical image
        if (
            $vehicleImage->image_path &&
            Storage::disk('public')->exists($vehicleImage->image_path)
        ) {
            Storage::disk('public')->delete(
                $vehicleImage->image_path
            );
        }

        // Delete database record
        $vehicleImage->delete();

        return response()->json([
            'message' => 'Vehicle image deleted successfully.',
        ], 200);
    }
}
