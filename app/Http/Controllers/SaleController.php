<?php

namespace App\Http\Controllers;

use App\Enums\SaleStatus;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SaleController extends Controller
{
    private function relations(): array
    {
        return [
            'reservation.customer.user',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'reservation.vehicle.images',
            'reservation.vehicle.specs',
            'createdBy',
            'payments',
            'vehicleRelease'
        ];
    }

    private function generateInvoiceNumber(): string
    {
        $year = now()->year;
        $last = Sale::whereYear('sale_date', $year)->latest('id')->first();
        $number = $last ? ((int) substr($last->invoice_number, -4)) + 1 : 1;
        return 'INV-' . $year . '-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Sale::with($this->relations())->where('archived', false);

        if ($customer = $request->user()->customer) {
            $query->whereHas('reservation', fn($q) => $q->where('customer_id', $customer->id));
        }

        $sales = $query->latest()->get();
        return response()->json(['message' => 'Sales retrieved successfully.', 'data' => $sales]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        $sale = Sale::create([
            'reservation_id' => $validated['reservation_id'],
            'created_by' => auth()->id(),
            'invoice_number' => $this->generateInvoiceNumber(),
            'sale_date' => now(),
            'discount_amount' => $validated['discount_amount'] ?? 0,
            'archived' => false,
        ]);

        return response()->json([
            'message' => 'Sale created successfully.',
            'data' => $sale->load(['reservation.vehicle.brand', 'reservation.vehicle.model', 'reservation.vehicle.variant', 'createdBy']),
        ], 201);
    }

    public function show(Sale $sale): JsonResponse
    {
        $sale->load($this->relations());
        return response()->json(['message' => 'Sale retrieved successfully.', 'data' => $sale]);
    }

    public function update(Request $request, Sale $sale): JsonResponse
    {
        $validated = $request->validate([
            'reservation_id' => ['sometimes', 'required', 'integer', 'exists:reservations,id', Rule::unique('sales', 'reservation_id')->ignore($sale->id)],
            'created_by' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'discount_amount' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::enum(SaleStatus::class)],
        ]);

        $sale->update($validated);

        return response()->json(['message' => 'Sale updated successfully.', 'data' => $sale->fresh($this->relations())]);
    }

    public function destroy(Sale $sale): JsonResponse
    {
        if ($sale->vehicleRelease()->exists()) {
            return response()->json(['message' => 'This sale cannot be archived because a vehicle release already exists.'], 409);
        }
        $sale->update(['archived' => true]);
        return response()->json(['message' => 'Sale archived successfully.']);
    }
}
