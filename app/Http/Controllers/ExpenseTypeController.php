<?php

namespace App\Http\Controllers;

use App\Models\ExpenseType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExpenseTypeController extends Controller
{
    /**
     * Display all expense types.
     */
    public function index(): JsonResponse
    {
        $expenseTypes = ExpenseType::withCount('vehicleExpenses')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Expense types retrieved successfully.',
            'data' => $expenseTypes,
        ], 200);
    }

    /**
     * Store a new expense type.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expense_name' => [
                'required',
                'string',
                'max:255',
                'unique:expense_types,expense_name',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $expenseType = ExpenseType::create($validated);

        return response()->json([
            'message' => 'Expense type created successfully.',
            'data' => $expenseType,
        ], 201);
    }

    /**
     * Display a specific expense type.
     */
    public function show(ExpenseType $expenseType): JsonResponse
    {
        $expenseType->loadCount('vehicleExpenses');

        return response()->json([
            'message' => 'Expense type retrieved successfully.',
            'data' => $expenseType,
        ], 200);
    }

    /**
     * Update an expense type.
     */
    public function update(
        Request $request,
        ExpenseType $expenseType
    ): JsonResponse {
        $validated = $request->validate([
            'expense_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('expense_types', 'expense_name')
                    ->ignore($expenseType->id),
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $expenseType->update($validated);

        return response()->json([
            'message' => 'Expense type updated successfully.',
            'data' => $expenseType->fresh(),
        ], 200);
    }

    /**
     * Delete an expense type.
     */
    public function destroy(ExpenseType $expenseType): JsonResponse
    {
        if ($expenseType->vehicleExpenses()->exists()) {
            return response()->json([
                'message' => 'This expense type cannot be deleted because it is already being used by vehicle expenses.',
            ], 409);
        }

        $expenseType->delete();

        return response()->json([
            'message' => 'Expense type deleted successfully.',
        ], 200);
    }
}
