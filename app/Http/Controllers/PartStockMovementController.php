<?php

namespace App\Http\Controllers;

use App\Models\PartStockMovement;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PartStockMovementController extends Controller
{
    public function __construct(private InventoryService $inventory)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $movements = PartStockMovement::with([
            'vehiclePart:id,part_name,category,image_path',
            'jobOrder:id,job_order_no',
            'creator:id,username',
        ])
            ->when($request->filled('vehicle_part_id'), fn ($query) =>
                $query->where('vehicle_part_id', $request->integer('vehicle_part_id')))
            ->when($request->filled('type'), fn ($query) =>
                $query->where('type', $request->input('type')))
            ->when($request->filled('from'), fn ($query) =>
                $query->whereDate('moved_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($query) =>
                $query->whereDate('moved_at', '<=', $request->input('to')))
            ->latest('moved_at')
            ->latest('id')
            ->get();

        return response()->json([
            'message' => 'Stock movements retrieved successfully.',
            'data' => $movements,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_part_id' => [
                'required',
                'integer',
                'exists:vehicle_parts,id',
            ],

            'type' => [
                'required',
                Rule::in(PartStockMovement::TYPES),
            ],

            'quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'unit_cost' => [
                'required',
                'numeric',
                'min:0',
            ],

            'job_order_id' => [
                'nullable',
                'integer',
                'exists:job_orders,id',
            ],

            'reference_no' => [
                'nullable',
                'string',
                'max:255',
            ],

            'remarks' => [
                'nullable',
                'required_if:type,damage',
                'string',
                'max:1000',
            ],

            'image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],

            'moved_at' => [
                'nullable',
                'date',
            ],
        ], [
            'remarks.required_if' => 'Please describe the damage.',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('part-damages', 'public');
        }

        try {
            $movement = $this->inventory->record(
                $validated['vehicle_part_id'],
                $validated['type'],
                $validated['quantity'],
                $validated
            );
        } catch (\Throwable $e) {
            if (isset($validated['image_path'])) {
                Storage::disk('public')->delete($validated['image_path']);
            }

            throw $e;
        }

        $movement->load([
            'vehiclePart:id,part_name,category,image_path',
            'jobOrder:id,job_order_no',
            'creator:id,username',
        ]);

        return response()->json([
            'message' => 'Stock movement recorded successfully.',
            'data' => $movement,
        ], 201);
    }
}
