<?php

namespace App\Http\Controllers;

use App\Models\PartsUsed;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Concerns\LimitsFieldStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartsUsedController extends Controller
{
    use LimitsFieldStaff;

    public function __construct(private InventoryService $inventory)
    {
    }

    /**
     * Display all parts used.
     */
    public function index()
    {
        $partsUsed = PartsUsed::with([
            'jobOrder',
            'vehiclePart',
        ])
            ->latest('used_at')
            ->get();

        return response()->json([
            'message' => 'Parts used retrieved successfully.',
            'data' => $partsUsed,
        ]);
    }

    /**
     * Store a part used in a job order.
     */
    public function store(Request $request): JsonResponse
    {
        $this->ensureAssignedTo(\App\Models\JobOrder::find($request->input('job_order_id')));

        $validated = $request->validate([
            'job_order_id' => [
                'required',
                'integer',
                'exists:job_orders,id',
            ],

            'vehicle_part_id' => [
                'required',
                'integer',
                'exists:vehicle_parts,id',
            ],

            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'used_at' => [
                'required',
                'date',
            ],
        ]);

        $partsUsed = DB::transaction(function () use ($validated) {

            // Create parts-used record.
            $partsUsed = PartsUsed::create([
                'job_order_id' => $validated['job_order_id'],
                'vehicle_part_id' => $validated['vehicle_part_id'],
                'quantity' => $validated['quantity'],
                'used_at' => $validated['used_at'],
            ]);

            // Deduct used quantity from inventory.
            $this->inventory->record($validated['vehicle_part_id'], 'stock_out', $validated['quantity'], [
                'job_order_id' => $validated['job_order_id'],
                'parts_used_id' => $partsUsed->id,
                'remarks' => 'Used in job order',
                'moved_at' => $validated['used_at'],
            ]);

            return $partsUsed;
        });

        $partsUsed->load([
            'jobOrder',
            'vehiclePart',
        ]);

        return response()->json([
            'message' => 'Part used successfully.',
            'data' => $partsUsed,
        ], 201);
    }

    /**
     * Display a specific parts-used record.
     */
    public function show(PartsUsed $partsUsed): JsonResponse
    {
        $partsUsed->load([
            'jobOrder',
            'vehiclePart',
        ]);

        return response()->json([
            'message' => 'Parts-used record retrieved successfully.',
            'data' => $partsUsed,
        ], 200);
    }

    /**
     * Update a parts-used record.
     */
    public function update(
        Request $request,
        PartsUsed $partsUsed
    ): JsonResponse {
        $this->ensureOfficeUser();


        $validated = $request->validate([
            'job_order_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:job_orders,id',
            ],

            'vehicle_part_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicle_parts,id',
            ],

            'quantity' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'used_at' => [
                'sometimes',
                'required',
                'date',
            ],
        ]);

        $updatedPartsUsed = DB::transaction(function () use (
            $validated,
            $partsUsed
        ) {

            $oldVehiclePartId = $partsUsed->vehicle_part_id;
            $oldQuantity = $partsUsed->quantity;

            $newVehiclePartId =
                $validated['vehicle_part_id'] ?? $oldVehiclePartId;

            $newQuantity =
                $validated['quantity'] ?? $oldQuantity;

            $newJobOrderId =
                $validated['job_order_id'] ?? $partsUsed->job_order_id;

            /*
             * If the vehicle part or quantity changes,
             * restore the old quantity first.
             */
            if (
                $newVehiclePartId != $oldVehiclePartId ||
                $newQuantity != $oldQuantity
            ) {
                $this->inventory->record($oldVehiclePartId, 'stock_in', $oldQuantity, [
                    'job_order_id' => $partsUsed->job_order_id,
                    'parts_used_id' => $partsUsed->id,
                    'remarks' => 'Adjustment: returned from job order',
                ]);

                $this->inventory->record($newVehiclePartId, 'stock_out', $newQuantity, [
                    'job_order_id' => $newJobOrderId,
                    'parts_used_id' => $partsUsed->id,
                    'remarks' => 'Adjustment: used in job order',
                ]);
            }

            // Update parts-used record.
            $partsUsed->update([
                'job_order_id' =>
                $validated['job_order_id']
                    ?? $partsUsed->job_order_id,

                'vehicle_part_id' =>
                $validated['vehicle_part_id']
                    ?? $partsUsed->vehicle_part_id,

                'quantity' =>
                $validated['quantity']
                    ?? $partsUsed->quantity,

                'used_at' =>
                $validated['used_at']
                    ?? $partsUsed->used_at,
            ]);

            return $partsUsed->fresh();
        });

        $updatedPartsUsed->load([
            'jobOrder',
            'vehiclePart',
        ]);

        return response()->json([
            'message' => 'Parts-used record updated successfully.',
            'data' => $updatedPartsUsed,
        ], 200);
    }

    /**
     * Delete a parts-used record.
     *
     * The used quantity is returned to inventory.
     */
    public function destroy(PartsUsed $partsUsed): JsonResponse
    {
        $this->ensureAssignedTo($partsUsed->jobOrder);

        DB::transaction(function () use ($partsUsed) {

            // Return quantity to inventory.
            $this->inventory->record($partsUsed->vehicle_part_id, 'stock_in', $partsUsed->quantity, [
                'job_order_id' => $partsUsed->job_order_id,
                'remarks' => 'Returned from job order',
            ]);

            // Delete parts-used record.
            $partsUsed->delete();
        });

        return response()->json([
            'message' =>
            'Parts-used record deleted and inventory restored successfully.',
        ], 200);
    }
}
