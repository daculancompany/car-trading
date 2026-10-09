<?php

namespace App\Services;

use App\Models\JobOrder;
use App\Models\PartStockMovement;
use App\Models\VehiclePart;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function record(
        int $vehiclePartId,
        string $type,
        int $quantity,
        array $options = []
    ): PartStockMovement {
        return DB::transaction(function () use ($vehiclePartId, $type, $quantity, $options) {

            $part = VehiclePart::lockForUpdate()->findOrFail($vehiclePartId);

            $previous = $part->quantity;
            $incoming = in_array($type, PartStockMovement::INCOMING_TYPES, true);
            $new = $incoming ? $previous + $quantity : $previous - $quantity;

            if ($new < 0) {
                abort(response()->json([
                    'message' => "Insufficient stock for {$part->part_name}.",
                    'available_quantity' => $previous,
                    'requested_quantity' => $quantity,
                ], 422));
            }

            $unitCost = (float) ($options['unit_cost'] ?? $part->unit_price);

            $jobOrderId = $options['job_order_id'] ?? null;
            $referenceNo = $options['reference_no'] ?? null;

            if ($jobOrderId && !$referenceNo) {
                $referenceNo = JobOrder::find($jobOrderId)?->job_order_no;
            }

            $part->update(['quantity' => $new]);

            return PartStockMovement::create([
                'vehicle_part_id' => $part->id,
                'type' => $type,
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'amount' => round($unitCost * $quantity, 2),
                'previous_quantity' => $previous,
                'new_quantity' => $new,
                'reference_type' => $jobOrderId ? 'job_order' : ($referenceNo ? 'manual' : null),
                'job_order_id' => $jobOrderId,
                'parts_used_id' => $options['parts_used_id'] ?? null,
                'reference_no' => $referenceNo,
                'remarks' => $options['remarks'] ?? null,
                'image_path' => $options['image_path'] ?? null,
                'created_by' => auth()->id(),
                'moved_at' => $options['moved_at'] ?? now(),
            ]);
        });
    }
}
