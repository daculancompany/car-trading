<?php

namespace App\Http\Controllers\Concerns;

use App\Models\JobOrder;

/**
 * Mechanics and washers ("field staff") only work on job orders assigned to them.
 */
trait LimitsFieldStaff
{
    // Staff profile id of the logged-in mechanic/washer, or null for office users.
    protected function fieldStaffId(): ?int
    {
        $user = request()->user();
        $role = strtolower($user?->role?->name ?? '');

        if (!in_array($role, ['mechanic', 'washer'], true)) {
            return null;
        }

        return $user->staff?->id ?? 0;
    }

    protected function ensureOfficeUser(): void
    {
        abort_if($this->fieldStaffId() !== null, 403, 'Only the office can do this.');
    }

    protected function ensureAssignedTo(?JobOrder $jobOrder): void
    {
        $staffId = $this->fieldStaffId();

        abort_if(
            $staffId !== null && $jobOrder?->assigned_staff_id !== $staffId,
            403,
            'This job order is assigned to someone else.'
        );
    }
}
