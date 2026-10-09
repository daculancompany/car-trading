<?php

namespace App\Http\Controllers;

use App\Models\FinancingRequirementGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FinancingRequirementGroupController extends Controller
{
    /**
     * Display all financing requirement groups.
     */
    public function index(): JsonResponse
    {
        $groups = FinancingRequirementGroup::withCount(
            'financingRequirements'
        )
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Financing requirement groups retrieved successfully.',
            'data' => $groups,
        ], 200);
    }

    /**
     * Store a new financing requirement group.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'group_name' => [
                'required',
                'string',
                'max:255',
            ],

            'group_code' => [
                'required',
                'string',
                'max:255',
                'unique:financing_requirement_groups,group_code',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $group = FinancingRequirementGroup::create($validated);

        return response()->json([
            'message' => 'Financing requirement group created successfully.',
            'data' => $group,
        ], 201);
    }

    /**
     * Display a specific financing requirement group.
     */
    public function show(
        FinancingRequirementGroup $financingRequirementGroup
    ): JsonResponse {
        $financingRequirementGroup->loadCount(
            'financingRequirements'
        );

        return response()->json([
            'message' => 'Financing requirement group retrieved successfully.',
            'data' => $financingRequirementGroup,
        ], 200);
    }

    /**
     * Update a financing requirement group.
     */
    public function update(
        Request $request,
        FinancingRequirementGroup $financingRequirementGroup
    ): JsonResponse {
        $validated = $request->validate([
            'group_name' => [
                'required',
                'string',
                'max:255',
            ],

            'group_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique(
                    'financing_requirement_groups',
                    'group_code'
                )->ignore($financingRequirementGroup->id),
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $financingRequirementGroup->update($validated);

        return response()->json([
            'message' => 'Financing requirement group updated successfully.',
            'data' => $financingRequirementGroup->fresh(),
        ], 200);
    }

    /**
     * Delete a financing requirement group.
     */
    public function destroy(
        FinancingRequirementGroup $financingRequirementGroup
    ): JsonResponse {
        if (
            $financingRequirementGroup
            ->financingRequirements()
            ->exists()
        ) {
            return response()->json([
                'message' =>
                'This financing requirement group cannot be deleted because it contains financing requirements.',
            ], 409);
        }

        $financingRequirementGroup->delete();

        return response()->json([
            'message' => 'Financing requirement group deleted successfully.',
        ], 200);
    }
}
