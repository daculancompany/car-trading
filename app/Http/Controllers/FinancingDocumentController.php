<?php

namespace App\Http\Controllers;

use App\Enums\FinancingDocumentStatus;
use App\Models\FinancingDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Concerns\ChecksCustomerOwnership;
use Illuminate\Validation\Rule;

class FinancingDocumentController extends Controller
{
    use ChecksCustomerOwnership;

    /**
     * Common relationships used when returning financing documents.
     */
    private function documentRelations(): array
    {
        return [
            'financingRequirement.group',
            'financingRequirement',
            'financing.reservation.customer.user',
            'financing.reservation.vehicle.brand',
            'financing.reservation.vehicle.model',
            'financing.reservation.vehicle.variant',
            'verifiedBy',
        ];
    }

    /**
     * Display all financing documents.
     */
    public function index(Request $request): JsonResponse
    {
        $query = FinancingDocument::with($this->documentRelations());

        if ($customer = $request->user()->customer) {
            $query->whereHas('financing.reservation', fn($q) => $q->where('customer_id', $customer->id));
        }

        $documents = $query->latest()->get();

        return response()->json([
            'message' => 'Financing documents retrieved successfully.',
            'data' => $documents,
        ], 200);
    }

    /**
     * Store a financing document.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'financing_requirement_id' => [
                'required',
                'integer',
                'exists:financing_requirements,id',
            ],

            // IMPORTANT:
            // Parent financing table is financing_infos
            'financing_info_id' => [
                'required',
                'integer',
                'exists:financing_infos,id',
            ],

            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240',
            ],

            'uploaded_at' => [
                'nullable',
                'date',
            ],

            'verified_by' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'verified_at' => [
                'nullable',
                'date',
            ],

            'remarks' => [
                'nullable',
                'string',
            'financing_info_id'
            ],
        ]);

        $file = $request->file('file');

        $filePath = $file->store(
            'financing-documents',
            'public'
        );

        $document = FinancingDocument::create([
            'financing_requirement_id' =>
            $validated['financing_requirement_id'],

            'financing_info_id' =>
            $validated['financing_info_id'],

            'file_name' =>
            $file->getClientOriginalName(),

            'file_path' =>
            $filePath,

            'uploaded_at' =>
            $validated['uploaded_at'] ?? now(),

            'verification_status' =>
            FinancingDocumentStatus::PENDING,

            'verified_by' => null,

            'verified_at' => null,

            'remarks' =>
            $validated['remarks'] ?? null,
        ]);

        $document->load(
            $this->documentRelations()
        );

        return response()->json([
            'message' =>
            'Financing document uploaded successfully.',
            'data' => $document,
        ], 201);
    }

    /**
     * Display a specific financing document.
     */
    public function show(
        FinancingDocument $financingDocument
    ): JsonResponse {
        $this->ensureCustomerOwns($financingDocument->financing?->reservation?->customer_id);

        $financingDocument->load(
            $this->documentRelations()
        );

        return response()->json([
            'message' =>
            'Financing document retrieved successfully.',
            'data' => $financingDocument,
        ], 200);
    }

    /**
     * Update a financing document.
     */
    public function update(
        Request $request,
        FinancingDocument $financingDocument
    ): JsonResponse {
        $validated = $request->validate([
            'financing_requirement_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:financing_requirements,id',
            ],

            // IMPORTANT:
            // Parent financing table is financing_infos
            'financing_info_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:financing_infos,id',
            ],

            'verified_by' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'file_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'file_path' => [
                'sometimes',
                'required',
                'string',
                'max:255',
            ],

            'uploaded_at' => [
                'sometimes',
                'required',
                'date',
            ],

            'verification_status' => [
                'sometimes',
                Rule::enum(FinancingDocumentStatus::class),
            ],

            'verified_at' => [
                'nullable',
                'date',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $financingDocument->update($validated);

        return response()->json([
            'message' =>
            'Financing document updated successfully.',

            'data' =>
            $financingDocument->fresh(
                $this->documentRelations()
            ),
        ], 200);
    }

    /**
     * Reject a financing document.
     */
    public function reject(
        Request $request,
        FinancingDocument $financingDocument
    ): JsonResponse {
        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:1000',
            ],
        ]);

        $financingDocument->update([
            'verification_status' =>
            FinancingDocumentStatus::REJECTED,

            'verified_by' => auth()->id(),

            'verified_at' => now(),

            'remarks' => $validated['remarks'],
        ]);

        return response()->json([
            'message' =>
            'Financing document rejected. Resubmission is required.',

            'data' =>
            $financingDocument->fresh(
                $this->documentRelations()
            ),
        ], 200);
    }

    /**
     * Resubmit a rejected financing document.
     */
    public function resubmit(
        Request $request,
        FinancingDocument $financingDocument
    ): JsonResponse {
        $this->ensureCustomerOwns($financingDocument->financing?->reservation?->customer_id);

        if (
            $financingDocument->verification_status !==
            FinancingDocumentStatus::REJECTED
        ) {
            return response()->json([
                'message' =>
                'Only rejected financing documents can be resubmitted.',
            ], 422);
        }

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240',
            ],

            'uploaded_at' => [
                'nullable',
                'date',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $file = $request->file('file');

        $filePath = $file->store(
            'financing-documents',
            'public'
        );

        $newDocument = FinancingDocument::create([
            'financing_info_id' =>
            $financingDocument->financing_info_id,

            'financing_requirement_id' =>
            $financingDocument->financing_requirement_id,

            'file_name' =>
            $file->getClientOriginalName(),

            'file_path' =>
            $filePath,

            'uploaded_at' =>
            $validated['uploaded_at'] ?? now(),

            'verification_status' =>
            FinancingDocumentStatus::PENDING,

            'verified_by' => null,

            'verified_at' => null,

            'remarks' =>
            $validated['remarks'] ?? null,
        ]);

        $newDocument->load(
            $this->documentRelations()
        );

        return response()->json([
            'message' =>
            'Financing document resubmitted successfully. It is now pending verification.',

            'data' => $newDocument,
        ], 201);
    }

    /**
     * Preview financing document.
     */
    public function preview(
        FinancingDocument $financingDocument
    ) {
        $this->ensureCustomerOwns($financingDocument->financing?->reservation?->customer_id);

        $filePath = $financingDocument->file_path;

        $fullPath = storage_path(
            'app/public/' . $filePath
        );

        if (!file_exists($fullPath)) {
            return response()->json([
                'message' => 'Document file not found.',
                'path' => $fullPath,
            ], 404);
        }

        return response()->file($fullPath);
    }

    /**
     * Archive a financing document.
     */
    public function destroy(
        FinancingDocument $financingDocument
    ): JsonResponse {
        $financingDocument->update([
            'archived' => 1,
        ]);

        return response()->json([
            'message' =>
            'Financing document archived successfully.',
        ], 200);
    }
}
