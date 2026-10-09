<?php

namespace App\Http\Controllers;

use App\Models\FinancingRequirement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FinancingRequirementController extends Controller
{
    /**
     * Display all financing requirements.
     */
    public function index(): JsonResponse
    {
        $requirements = FinancingRequirement::with([
            'group',
        ])
            ->withCount('financingDocuments')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Financing requirements retrieved successfully.',
            'data' => $requirements,
        ], 200);
    }

    /**
     * Store a new financing requirement.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_id' => [
                'required',
                'integer',
                'exists:financing_requirement_groups,id',
            ],

            'requirement_name' => [
                'required',
                'string',
                'max:255',
                'unique:financing_requirements,requirement_name',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'required_quantity' => [
                'required',
                'integer',
                'min:1',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $requirement = FinancingRequirement::create($validated);

        $requirement->load('group');

        return response()->json([
            'message' => 'Financing requirement created successfully.',
            'data' => $requirement,
        ], 201);
    }

    /**
     * Display a specific financing requirement.
     */
    public function show(
        FinancingRequirement $financingRequirement
    ): JsonResponse {
        $financingRequirement->load([
            'group',
        ]);

        $financingRequirement->loadCount(
            'financingDocuments'
        );

        return response()->json([
            'message' => 'Financing requirement retrieved successfully.',
            'data' => $financingRequirement,
        ], 200);
    }

    /**
     * Update a financing requirement.
     */
    public function update(
        Request $request,
        FinancingRequirement $financingRequirement
    ): JsonResponse {
        $validated = $request->validate([
            'group_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:financing_requirement_groups,id',
            ],

            'requirement_name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'financing_requirements',
                    'requirement_name'
                )->ignore($financingRequirement->id),
            ],

            'description' => [
                'sometimes',
                'nullable',
                'string',
            ],

            'required_quantity' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $financingRequirement->update($validated);

        return response()->json([
            'message' => 'Financing requirement updated successfully.',
            'data' => $financingRequirement->fresh('group'),
        ], 200);
    }

    /**
     * Delete a financing requirement.
     */
    public function destroy(
        FinancingRequirement $financingRequirement
    ): JsonResponse {
        if (
            $financingRequirement
            ->financingDocuments()
            ->exists()
        ) {
            return response()->json([
                'message' =>
                'This financing requirement cannot be deleted because it is already being used by financing documents.',
            ], 409);
        }

        $financingRequirement->delete();

        return response()->json([
            'message' => 'Financing requirement deleted successfully.',
        ], 200);
    }

    /**
     * Display only active financing requirements.
     */
    public function active(): JsonResponse
    {
        $requirements = FinancingRequirement::with('group')
            ->where('is_active', true)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Active financing requirements retrieved successfully.',
            'data' => $requirements,
        ], 200);
    }

    /**
     * Display active requirements grouped by requirement group.
     */
    public function grouped(): JsonResponse
    {
        $requirements = FinancingRequirement::with('group')
            ->where('is_active', true)
            ->get()
            ->groupBy('group_id')
            ->values();

        return response()->json([
            'message' => 'Financing requirements grouped successfully.',
            'data' => $requirements,
        ], 200);
    }
}
