<?php

namespace App\Http\Controllers;

use App\Models\VehicleExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleExpenseController extends Controller
{
    /**
     * Display all vehicle expenses.
     */
    public function index(): JsonResponse
    {
        $expenses = VehicleExpense::with([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ])
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Vehicle expenses retrieved successfully.',
            'data' => $expenses,
        ], 200);
    }

    /**
     * Store a new vehicle expense.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id' => [
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'expense_type_id' => [
                'required',
                'integer',
                'exists:expense_types,id',
            ],

            'amount' => [
                'required',
                'numeric',
                'min:0',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $expense = VehicleExpense::create($validated);

        $expense->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ]);

        return response()->json([
            'message' => 'Vehicle expense created successfully.',
            'data' => $expense,
        ], 201);
    }

    /**
     * Display a specific vehicle expense.
     */
    public function show(VehicleExpense $vehicleExpense): JsonResponse
    {
        $vehicleExpense->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ]);

        return response()->json([
            'message' => 'Vehicle expense retrieved successfully.',
            'data' => $vehicleExpense,
        ], 200);
    }

    /**
     * Update a vehicle expense.
     */
    public function update(
        Request $request,
        VehicleExpense $vehicleExpense
    ): JsonResponse {
        $validated = $request->validate([
            'vehicle_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:vehicles,id',
            ],

            'expense_type_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:expense_types,id',
            ],

            'amount' => [
                'sometimes',
                'required',
                'numeric',
                'min:0',
            ],

            'remarks' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $vehicleExpense->update($validated);

        $vehicleExpense->load([
            'vehicle.brand',
            'vehicle.model',
            'vehicle.variant',
            'expenseType',
        ]);

        return response()->json([
            'message' => 'Vehicle expense updated successfully.',
            'data' => $vehicleExpense->fresh([
                'vehicle.brand',
                'vehicle.model',
                'vehicle.variant',
                'expenseType',
            ]),
        ], 200);
    }

    /**
     * Delete a vehicle expense.
     */
    public function destroy(
        VehicleExpense $vehicleExpense
    ): JsonResponse {
        $vehicleExpense->delete();

        return response()->json([
            'message' => 'Vehicle expense deleted successfully.',
        ], 200);
    }
}
