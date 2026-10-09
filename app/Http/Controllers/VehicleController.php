<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\VehicleStatus;

class VehicleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $vehicles = Vehicle::with([
            'createdBy',
            'brand',
            'model',
            'variant',
            'specs',
            'images',
            'expenses.expenseType',
            'vehicleDocuments',
            'reservations',
            'latestInspection',
        ])->latest()->get();

        return response()->json(['message' => 'Vehicles retrieved successfully.', 'data' => $vehicles], 200);
    }

    public function customerVehicles(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) return response()->json(['message' => 'Unauthenticated.'], 401);

        $customer = $user->customer;

        if (!$customer) return response()->json(['message' => 'Customer profile not found.'], 404);

        $activeReservationStatuses = ['pending_reservation', 'pending_documents', 'pending_financing', 'pending_payment', 'reserved'];

        $vehicles = Vehicle::with(['brand', 'model', 'variant', 'specs', 'images', 'reservations', 'latestInspection'])
            ->where('archived', 0)
            ->where(function ($query) use ($customer, $activeReservationStatuses) {
                $query->where('status', 'available')
                    ->orWhere(function ($query) use ($customer, $activeReservationStatuses) {
                        $query->whereIn('status', ['reserved', 'unavailable'])
                            ->whereHas('reservations', function ($reservationQuery) use ($customer, $activeReservationStatuses) {
                                $reservationQuery->where('customer_id', $customer->id)->whereIn('reservation_status', $activeReservationStatuses);
                            });
                    });
            })
            ->latest()
            ->get();

        $data = $vehicles->map(function ($vehicle) use ($customer, $activeReservationStatuses) {
            $myReservation = $vehicle->reservations
                ->where('customer_id', $customer->id)
                ->filter(function ($reservation) use ($activeReservationStatuses) {
                    $status = $reservation->reservation_status instanceof \BackedEnum
                        ? $reservation->reservation_status->value
                        : $reservation->reservation_status;

                    return in_array(strtolower((string) $status), $activeReservationStatuses, true);
                })
                ->first();

            return array_merge($vehicle->toArray(), [
                'is_my_reservation' => $myReservation !== null,
                'my_reservation_id' => $myReservation?->id,
            ]);
        });

        return response()->json(['message' => 'Customer vehicles retrieved successfully.', 'data' => $data], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'integer', 'exists:vehicle_brands,id'],
            'model_id' => ['required', 'integer', 'exists:vehicle_models,id'],
            'variant_id' => ['required', 'integer', 'exists:vehicle_variants,id'],
            'year_model' => ['required', 'integer', 'min:1900', 'max:2100'],
            'color' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'string'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'reservation_price' => ['required', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::enum(VehicleStatus::class)],
        ]);

        $validated['created_by_user_id'] = $request->user()->id;
        $validated['stock_no'] = $this->generateStockNumber();

        $vehicle = Vehicle::create($validated);
        $vehicle->load(['createdBy', 'brand', 'model', 'variant']);

        return response()->json(['message' => 'Vehicle created successfully.', 'data' => $vehicle], 201);
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $vehicle->load([
            'createdBy',
            'brand',
            'model',
            'variant',
            'specs',
            'images',
            'expenses.expenseType',
            'reservations',
            'vehicleDocuments',
            'latestInspection',
        ]);

        return response()->json(['message' => 'Vehicle retrieved successfully.', 'data' => $vehicle], 200);
    }

    public function update(Request $request, Vehicle $vehicle): JsonResponse
    {
        $validated = $request->validate([
            'brand_id' => ['sometimes', 'required', 'integer', 'exists:vehicle_brands,id'],
            'model_id' => ['sometimes', 'required', 'integer', 'exists:vehicle_models,id'],
            'variant_id' => ['sometimes', 'required', 'integer', 'exists:vehicle_variants,id'],
            'year_model' => ['sometimes', 'required', 'integer', 'min:1900', 'max:2100'],
            'color' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'features' => ['nullable', 'string'],
            'selling_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'reservation_price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::enum(VehicleStatus::class)],
        ]);

        $vehicle->update($validated);
        $vehicle->load(['createdBy', 'brand', 'model', 'variant']);

        return response()->json([
            'message' => 'Vehicle updated successfully.',
            'data' => $vehicle->fresh(['createdBy', 'brand', 'model', 'variant']),
        ], 200);
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        if ($vehicle->reservations()->exists()) {
            return response()->json(['message' => 'This vehicle cannot be archived because it has existing reservations.'], 409);
        }

        $vehicle->update(['archived' => 1]);

        return response()->json(['message' => 'Vehicle archived successfully.'], 200);
    }

    private function generateStockNumber(): string
    {
        $year = now()->format('Y');
        $lastVehicle = Vehicle::where('stock_no', 'like', "ST-{$year}-%")->orderByDesc('id')->first();
        $number = $lastVehicle ? ((int) substr($lastVehicle->stock_no, -4)) + 1 : 1;

        return sprintf('ST-%s-%04d', $year, $number);
    }

    public function inspectionReport(Vehicle $vehicle): JsonResponse
    {
        $inspection = $vehicle->latestInspection;

        if (!$inspection) {
            return response()->json(['message' => 'This vehicle has no inspection yet.', 'data' => null], 404);
        }

        return response()->json([
            'data' => [
                'badge' => Vehicle::inspectionBadge($inspection),
                'inspected_at' => $inspection->inspected_at,
                'odometer' => $inspection->odometer,
                'checklist' => collect($inspection->checklist ?? [])->map(fn ($entry) => [
                    'section' => $entry['section'] ?? null,
                    'item' => $entry['item'],
                    'status' => \App\Models\JobOrderInspection::normalizeStatus($entry['status'] ?? null),
                    'note' => $entry['note'] ?? null,
                ])->values(),
                'tires' => $inspection->tires,
                'brakes' => $inspection->brakes,
                'damage_marks' => $inspection->damage_marks ?? [],
                'recommended_services' => $inspection->recommended_services ?? [],
                'photo_list' => $inspection->photo_list,
            ],
        ]);
    }
}
