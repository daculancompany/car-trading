<?php

namespace App\Http\Controllers;

use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of roles.
     */
    public function index(): JsonResponse
    {
        $roles = Role::withCount('users')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Roles retrieved successfully.',
            'data' => $roles,
        ], 200);
    }

    /**
     * Store a newly created role.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
            ],
            'role_type' => [
                'required',
                Rule::in([
                    'system',
                    'staffs',
                    'customers',
                ]),
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $role = Role::create($validated);

        return response()->json([
            'message' => 'Role created successfully.',
            'data' => $role,
        ], 201);
    }

    /**
     * Display the specified role.
     */
    public function show(Role $role): JsonResponse
    {
        $role->loadCount('users');

        return response()->json([
            'message' => 'Role retrieved successfully.',
            'data' => $role,
        ], 200);
    }

    /**
     * Update the specified role.
     */
    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
            ],
            'role_type' => [
                'required',
                'sometimes',
                Rule::in([
                    'system',
                    'staffs',
                    'customers',
                ]),
            ],
            'description' => [
                'nullable',
                'string',
            ],
        ]);

        $role->update($validated);

        return response()->json([
            'message' => 'Role updated successfully.',
            'data' => $role->fresh(),
        ], 200);
    }

    /**
     * Remove the specified role.
     */
    public function destroy(Role $role): JsonResponse
    {
        if ($role->users()->exists()) {
            return response()->json([
                'message' => 'This role cannot be deleted because it is currently assigned to one or more users.',
            ], 409);
        }

        $role->delete();

        return response()->json([
            'message' => 'Role deleted successfully.',
        ], 200);
    }
}
