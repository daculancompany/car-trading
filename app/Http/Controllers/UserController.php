<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(): JsonResponse
    {
        $users = User::with('role')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Users retrieved successfully.',
            'data' => $users,
        ], 200);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'username' => [
                'required',
                'string',
                'max:255',
                'unique:users,username',
            ],
            'password' => [
                'required',
                'string',
                'min:5',
                'confirmed',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $user = User::create($validated);

        $user->load('role');

        return response()->json([
            'message' => 'User created successfully.',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        $user->load('role');

        return response()->json([
            'message' => 'User retrieved successfully.',
            'data' => $user,
        ], 200);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:roles,id',
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'username' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'password' => [
                'nullable',
                'string',
                'min:5',
                'confirmed',
            ],
            'is_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        /*
         * Don't update the password when it is empty.
         */
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        $user->load('role');

        return response()->json([
            'message' => 'User updated successfully.',
            'data' => $user,
        ], 200);
    }

    /**
     * Archive the specified user.
     */
    public function destroy(User $user): JsonResponse
    {
        /**
         * Prevent Archiving If User Has Staff or Customer Profile
         */
        if (
            $user->staff()->exists() ||
            $user->customer()->exists()
        ) {
            return response()->json([
                'message' =>
                'This user cannot be archived because it is associated with a staff or customer profile.',
            ], 409);
        }

        /**
         * Archive User
         */
        $user->update([
            'archived' => 1,
        ]);

        return response()->json([
            'message' => 'User archived successfully.',
        ], 200);
    }
}
