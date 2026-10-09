<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    public function index(): JsonResponse
    {
        $staffs = Staff::with('user.role')
            ->where('archived', 0)
            ->whereHas('user', fn($q) => $q->where('archived', 0))
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Staff retrieved successfully.',
            'data' => $staffs
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role_id' => [
                'required',
                'integer',
                Rule::exists('roles', 'id')->where(fn($q) => $q->where('role_type', 'staffs'))
            ],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'mobile_number' => ['required', 'string', 'max:20'],
            'hire_date' => ['required', 'date'],
            'work_start_hour' => ['required', 'date_format:H:i'],
            'work_end_hour' => ['required', 'date_format:H:i', 'after:work_start_hour'],
        ]);

        $staff = DB::transaction(function () use ($validated) {
            $user = User::create([
                'role_id' => $validated['role_id'],
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'is_active' => true,
            ]);

            return Staff::create([
                'user_id' => $user->id,
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'suffix' => $validated['suffix'] ?? null,
                'address' => $validated['address'],
                'mobile_number' => $validated['mobile_number'],
                'hire_date' => $validated['hire_date'],
                'work_start_hour' => $validated['work_start_hour'],
                'work_end_hour' => $validated['work_end_hour'],
                'status' => 'active',
            ]);
        });

        $staff->load('user.role');

        return response()->json([
            'message' => 'Staff account created successfully.',
            'data' => $staff
        ], 201);
    }

    public function show(Staff $staff): JsonResponse
    {
        $staff->load('user.role');

        return response()->json([
            'message' => 'Staff retrieved successfully.',
            'data' => $staff
        ]);
    }

    public function update(Request $request, Staff $staff): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['sometimes', 'required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'mobile_number' => ['sometimes', 'required', 'string', 'max:20'],
            'hire_date' => ['sometimes', 'required', 'date'],
            'work_start_hour' => ['sometimes', 'required', 'date_format:H:i'],
            'work_end_hour' => ['sometimes', 'required', 'date_format:H:i'],
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'resigned', 'terminated'])],
        ]);

        $staff->update($validated);
        $staff->load('user.role');

        return response()->json([
            'message' => 'Staff updated successfully.',
            'data' => $staff->fresh('user.role')
        ]);
    }

    public function destroy(Staff $staff): JsonResponse
    {
        DB::transaction(function () use ($staff) {
            $staff->update(['archived' => 1]);

            if ($staff->user) {
                $staff->user->update(['archived' => 1]);
            }
        });

        return response()->json([
            'message' => 'Staff archived successfully.'
        ]);
    }
}
