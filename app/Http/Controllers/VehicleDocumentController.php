<?php

namespace App\Http\Controllers;

use App\Models\VehicleDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class VehicleDocumentController extends Controller
{
    /**
     * Display all vehicle documents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = VehicleDocument::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        // Customers only get the papers of cars they bought.
        if ($customer = $request->user()->customer) {
            $query->whereHas('vehicle.reservations', fn($q) => $q
                ->where('customer_id', $customer->id)
                ->whereHas('sale', fn($sale) => $sale->where('status', 'completed')));
        }

        $documents = $query->latest()->get();

        return response()->json([
            'message' =>
            'Vehicle documents retrieved successfully.',
            'data' => $documents,
        ], 200);
    }

    /**
     * Store vehicle documents.
     */
    public function store(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
                'unique:vehicle_documents,vehicle_id',
            ],

            'vehicle_cr' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],

            'vehicle_or' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],
        ]);

        // At least one document required

        if (
            !$request->hasFile('vehicle_cr') &&
            !$request->hasFile('vehicle_or')
        ) {
            throw ValidationException::withMessages([
                'documents' =>
                'Please upload at least one vehicle document.',
            ]);
        }

        // Create Document Record

        $document = new VehicleDocument();

        $document->vehicle_id =
            $validated['vehicle_id'];

        // Upload CR

        if ($request->hasFile('vehicle_cr')) {
            $document->vehicle_cr_path =
                $request->file('vehicle_cr')->store(
                    'vehicle-documents/cr',
                    'public'
                );
        }

        // Upload OR

        if ($request->hasFile('vehicle_or')) {
            $document->vehicle_or_path =
                $request->file('vehicle_or')->store(
                    'vehicle-documents/or',
                    'public'
                );
        }

        $document->save();

        // Load Vehicle

        $document->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' =>
            'Vehicle documents created successfully.',
            'data' => $document,
        ], 201);
    }

    /**
     * Display a specific vehicle document.
     */
    public function show(
        VehicleDocument $vehicleDocument
    ): JsonResponse {
        $vehicleDocument->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' =>
            'Vehicle documents retrieved successfully.',
            'data' => $vehicleDocument,
        ], 200);
    }

    /**
     * Update vehicle documents.
     */
    public function update(
        Request $request,
        VehicleDocument $vehicleDocument
    ): JsonResponse {
        $validated = $request->validate([
            'vehicle_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicles,id',
                'unique:vehicle_documents,vehicle_id,' .
                    $vehicleDocument->id,
            ],

            'vehicle_cr' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],

            'vehicle_or' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240',
            ],
        ]);

        // At least one document required

        if (
            !$request->hasFile('vehicle_cr') &&
            !$request->hasFile('vehicle_or') &&
            !array_key_exists(
                'vehicle_id',
                $validated
            )
        ) {
            throw ValidationException::withMessages([
                'documents' =>
                'Please provide a document to update.',
            ]);
        }

        // Vehicle

        if (
            isset($validated['vehicle_id'])
        ) {
            $vehicleDocument->vehicle_id =
                $validated['vehicle_id'];
        }

        // Replace CR

        if ($request->hasFile('vehicle_cr')) {

            if (
                $vehicleDocument->vehicle_cr_path &&
                Storage::disk('public')->exists(
                    $vehicleDocument->vehicle_cr_path
                )
            ) {
                Storage::disk('public')->delete(
                    $vehicleDocument->vehicle_cr_path
                );
            }

            $vehicleDocument->vehicle_cr_path =
                $request->file('vehicle_cr')->store(
                    'vehicle-documents/cr',
                    'public'
                );
        }

        // Replace OR

        if ($request->hasFile('vehicle_or')) {

            if (
                $vehicleDocument->vehicle_or_path &&
                Storage::disk('public')->exists(
                    $vehicleDocument->vehicle_or_path
                )
            ) {
                Storage::disk('public')->delete(
                    $vehicleDocument->vehicle_or_path
                );
            }

            $vehicleDocument->vehicle_or_path =
                $request->file('vehicle_or')->store(
                    'vehicle-documents/or',
                    'public'
                );
        }

        $vehicleDocument->save();

        // Load Vehicle

        $vehicleDocument->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
        ]);

        return response()->json([
            'message' =>
            'Vehicle documents updated successfully.',
            'data' => $vehicleDocument,
        ], 200);
    }

    /**
     * Delete vehicle documents.
     */
    public function destroy(
        VehicleDocument $vehicleDocument
    ): JsonResponse {

        // Delete CR

        if (
            $vehicleDocument->vehicle_cr_path &&
            Storage::disk('public')->exists(
                $vehicleDocument->vehicle_cr_path
            )
        ) {
            Storage::disk('public')->delete(
                $vehicleDocument->vehicle_cr_path
            );
        }

        // Delete OR

        if (
            $vehicleDocument->vehicle_or_path &&
            Storage::disk('public')->exists(
                $vehicleDocument->vehicle_or_path
            )
        ) {
            Storage::disk('public')->delete(
                $vehicleDocument->vehicle_or_path
            );
        }

        // Delete Database Record

        $vehicleDocument->delete();

        return response()->json([
            'message' =>
            'Vehicle documents deleted successfully.',
        ], 200);
    }
}
