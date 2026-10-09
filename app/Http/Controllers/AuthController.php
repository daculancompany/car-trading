<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            // Optional: the single login page sends no role and the portal is picked from the account.
            'role' => ['nullable', 'string'],
        ]);
        $user = User::with('role')
            ->where(function ($query) use ($credentials) {
                $query->where('email', $credentials['login'])
                    ->orWhere('username', $credentials['login']);
            })
            ->first();
        if (
            !$user ||
            !Hash::check($credentials['password'], $user->password)
        ) {
            return response()->json([
                'message' => 'Invalid username/email or password.',
            ], 401);
        }
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is inactive. Please contact the administrator.',
            ], 403);
        }
        // RBAC - i-check kung naa bay role nga naka-assign sa user
        if (!$user->role) {
            return response()->json([
                'message' => 'Your account does not have a valid role assigned.',
            ], 403);
        }
        // Kuhaon ang portal nga gipili sa user,
        // ang type sa iyang role, ug ang actual nga role name.
        $requestedRole = strtolower(trim($credentials['role'] ?? ''));
        $roleType = strtolower(trim($user->role->role_type));
        $roleName = strtolower(trim($user->role->name));

        // RBAC - PORTAL ACCESS

        // Customer Portal:
        // I-check kung ang user kay customer ug customer gyud ang iyang role.
        if ($requestedRole === 'customer') {
            if (
                $roleType !== 'customers' ||
                $roleName !== 'customer'
            ) {
                return response()->json([
                    'message' => 'This account does not have access to the Customer Portal.',
                ], 403);
            }
        }

        // Staff Portal:
        // Ang mga role nga naa sa "staffs" nga role type pwede maka-access sa Staff Portal.
        // same sa secretary, mechanic, ug washer.
        elseif ($requestedRole === 'staff') {
            if ($roleType !== 'staffs') {
                return response()->json([
                    'message' => 'This account does not have access to the Staff Portal.',
                ], 403);
            }
        }

        // Admin Portal:
        // Kinahanglan ang role_type kay "system" ug ang role name kay "admin".
        elseif ($requestedRole === 'admin') {
            if (
                $roleType !== 'system' ||
                $roleName !== 'admin'
            ) {
                return response()->json([
                    'message' => 'This account does not have access to the Administrator Portal.',
                ], 403);
            }
        }

        // Single login page: allow every role that has a page in the app.
        elseif ($requestedRole === '') {
            if (!in_array($roleName, ['admin', 'secretary', 'customer', 'mechanic', 'washer'], true)) {
                return response()->json([
                    'message' => 'This account does not have a portal yet. Please contact the administrator.',
                ], 403);
            }
        }

        // Kung dili customer, staff, or admin ang gipangayo nga portal,
        // i-reject ang request.
        else {
            return response()->json([
                'message' => 'Invalid portal type.',
            ], 422);
        }
        // One session per account: a new login signs out the previous one
        // instead of locking the user out (e.g. after clearing the browser).
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request
            ->user()
            ->load(['role', 'customer', 'staff']);
        return response()->json([
            'message' => 'Authenticated user retrieved successfully.',
            'user' => $user,
        ], 200);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentToken = $user->currentAccessToken();

        if (
            $currentToken instanceof
            \Laravel\Sanctum\PersonalAccessToken
        ) {
            $currentToken->delete();
        }
        return response()->json([
            'message' => 'Logout successful.',
        ], 200);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => ['sometimes', 'required', 'string', 'max:50', 'alpha_dash', \Illuminate\Validation\Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['sometimes', 'required', 'email', 'max:255', \Illuminate\Validation\Rule::unique('users', 'email')->ignore($user->id)],
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'mobile_number' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'facebook' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update(collect($validated)->only(['username', 'email'])->all());

        $personal = collect($validated)->only(['first_name', 'middle_name', 'last_name', 'mobile_number', 'address'])->all();

        if ($user->customer) {
            $user->customer->update($personal + collect($validated)->only(['facebook'])->all());
        } elseif ($user->staff && $personal) {
            $user->staff->update($personal);
        }

        return response()->json([
            'message' => 'Profile updated.',
            'user' => $user->fresh(['role', 'customer', 'staff']),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed', 'different:current_password'],
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Your current password is incorrect.',
                'errors' => ['current_password' => ['Your current password is incorrect.']],
            ], 422);
        }

        $user->update(['password' => $validated['password']]);

        $current = $user->currentAccessToken();
        $user->tokens()
            ->when($current instanceof \Laravel\Sanctum\PersonalAccessToken, fn ($query) => $query->where('id', '!=', $current->id))
            ->delete();

        return response()->json(['message' => 'Password changed. Other devices were logged out.']);
    }
}
