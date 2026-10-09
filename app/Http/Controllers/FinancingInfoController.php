<?php

namespace App\Http\Controllers;

use App\Models\FinancingInfo;
use App\Enums\FinancingInfoStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ChecksCustomerOwnership;
use Illuminate\Validation\Rule;

class FinancingInfoController extends Controller
{
    use ChecksCustomerOwnership;

    private function relations(): array
    {
        return [
            'reservation.customer.user',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'verifiedBy',
        ];
    }

    private function rules(bool $update = false): array
    {
        $prefix = $update ? 'sometimes|' : '';

        return [
            'reservation_id' => $update
                ? [
                    'sometimes',
                    'required',
                    'integer',
                    'exists:reservations,id',
                    Rule::unique('financing_infos', 'reservation_id')
                        ->ignore(request()->route('financingInfo')?->id),
                ]
                : [
                    'required',
                    'integer',
                    'exists:reservations,id',
                    'unique:financing_infos,reservation_id',
                ],

            'company_name' => $prefix . 'required|string|max:255',
            'contact_person' => $prefix . 'required|string|max:255',
            'contact_number' => $prefix . 'required|string|max:50',
            'email' => $prefix . 'required|email|max:255',
            'address' => $prefix . 'required|string|max:500',

            'financing_reference_no' => 'nullable|string|max:255',
            'financed_amount' => $prefix . 'required|numeric|min:0',
            'monthly_payment' => 'nullable|numeric|min:0',
            'loan_term_months' => 'nullable|integer|min:1',

            'financing_status' => [
                'sometimes',
                Rule::enum(FinancingInfoStatus::class),
            ],

            'verified_by' => 'nullable|integer|exists:users,id',
            'remarks' => 'nullable|string',
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $query = FinancingInfo::with($this->relations());

        // Customers only see their own loan applications.
        if ($customer = $request->user()->customer) {
            $query->whereHas('reservation', fn($q) => $q->where('customer_id', $customer->id));
        }

        return response()->json([
            'message' => 'Financing records retrieved successfully.',
            'data' => $query->latest()->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());

        $data['financing_status'] ??= FinancingInfoStatus::PENDING;

        $financingInfo = FinancingInfo::create($data)
            ->load($this->relations());

        return response()->json([
            'message' => 'Financing record created successfully.',
            'data' => $financingInfo,
        ], 201);
    }

    public function show(FinancingInfo $financingInfo): JsonResponse
    {
        $this->ensureCustomerOwns($financingInfo->reservation?->customer_id);

        $financingInfo->load([
            ...$this->relations(),
            'documents.financingRequirement',
        ]);

        return response()->json([
            'message' => 'Financing record retrieved successfully.',
            'data' => $financingInfo,
        ]);
    }

    public function update(
        Request $request,
        FinancingInfo $financingInfo
    ): JsonResponse {
        $data = $request->validate($this->rules(true));

        $financingInfo->update($data);
        $financingInfo->load($this->relations());

        return response()->json([
            'message' => 'Financing record updated successfully.',
            'data' => $financingInfo,
        ]);
    }

    public function resubmit(
        Request $request,
        FinancingInfo $financingInfo
    ): JsonResponse {
        $this->ensureCustomerOwns($financingInfo->reservation?->customer_id);

        if ($financingInfo->financing_status !== FinancingInfoStatus::REJECTED) {
            return response()->json([
                'message' => 'Only rejected financing records can be resubmitted.',
            ], 422);
        }

        $data = $request->validate([
            'reservation_id' => [
                'required',
                'integer',
                'exists:reservations,id',
                Rule::unique('financing_infos', 'reservation_id')
                    ->ignore($financingInfo->id),
            ],

            'company_name' => ['required', 'string', 'max:255'],
            'contact_person' => ['required', 'string', 'max:255'],
            'contact_number' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],

            'financing_reference_no' => ['nullable', 'string', 'max:255'],
            'financed_amount' => ['required', 'numeric', 'min:0'],
            'monthly_payment' => ['nullable', 'numeric', 'min:0'],
            'loan_term_months' => ['nullable', 'integer', 'min:1'],

            'remarks' => ['nullable', 'string'],
        ]);

        $data['financing_status'] = FinancingInfoStatus::PENDING;

        // Clear previous verification information
        $data['verified_by'] = null;

        $financingInfo->update($data);

        $financingInfo->load($this->relations());

        return response()->json([
            'message' => 'Financing information resubmitted successfully.',
            'data' => $financingInfo,
        ]);
    }

    public function submit(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules());
        $data['financing_status'] = FinancingInfoStatus::PENDING;
        $financingInfo = FinancingInfo::create($data)
            ->load($this->relations());
        return response()->json([
            'message' => 'Financing information submitted successfully.',
            'data' => $financingInfo,
        ], 201);
    }

    public function approve(
        Request $request,
        FinancingInfo $financingInfo
    ): JsonResponse {
        if ($financingInfo->financing_status !== FinancingInfoStatus::PENDING) {
            return response()->json([
                'message' => 'Only pending financing records can be approved.',
            ], 422);
        }

        $data = $request->validate([
            'remarks' => ['nullable', 'string'],
        ]);

        $financingInfo->update([
            'financing_status' => FinancingInfoStatus::APPROVED,
            'verified_by' => auth()->id(),
            'remarks' => $data['remarks'] ?? $financingInfo->remarks,
        ]);

        return response()->json([
            'message' => 'Financing information approved successfully.',
            'data' => $financingInfo->fresh()->load($this->relations()),
        ]);
    }

    public function reject(
        Request $request,
        FinancingInfo $financingInfo
    ): JsonResponse {
        if ($financingInfo->financing_status !== FinancingInfoStatus::PENDING) {
            return response()->json([
                'message' => 'Only pending financing records can be rejected.',
            ], 422);
        }

        $data = $request->validate([
            'remarks' => ['required', 'string', 'min:1'],
        ]);

        $financingInfo->update([
            'financing_status' => FinancingInfoStatus::REJECTED,
            'verified_by' => auth()->id(),
            'remarks' => $data['remarks'],
        ]);

        return response()->json([
            'message' => 'Financing information rejected.',
            'data' => $financingInfo->fresh()->load($this->relations()),
        ]);
    }

    public function destroy(FinancingInfo $financingInfo): JsonResponse
    {
        if ($financingInfo->documents()->exists()) {
            return response()->json([
                'message' => 'This financing record cannot be archived because it has financing documents.',
            ], 409);
        }

        $financingInfo->update(['archived' => true]);

        return response()->json([
            'message' => 'Financing record archived successfully.',
        ]);
    }
}
