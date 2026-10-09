<?php

namespace App\Services;

use App\Enums\FinancingInfoStatus;
use App\Models\FinancingInfo;
use Illuminate\Support\Facades\Log;

class FinancingInfoStatusService
{
    /**
     * Update financing status.
     *
     * CDO Car Trading records the financing information
     * and the status provided by the financing company.
     */
    public function updateStatus(
        FinancingInfo $financing,
        FinancingInfoStatus $status
    ): FinancingInfo {
        $oldStatus = $financing->financing_status;

        Log::info('FINANCING STATUS UPDATE', [
            'financing_id' => $financing->id,

            'old_status' => $oldStatus instanceof FinancingInfoStatus
                ? $oldStatus->value
                : $oldStatus,

            'new_status' => $status->value,

            'reservation_id' => $financing->reservation_id,

            // Financing company information
            'company_name' => $financing->company_name,
            'contact_person' => $financing->contact_person,
            'contact_number' => $financing->contact_number,
            'email' => $financing->email,
        ]);

        $financing->update([
            'financing_status' => $status,
        ]);

        return $financing->fresh([
            'reservation.customer.user',
            'reservation.vehicle.brand',
            'reservation.vehicle.model',
            'reservation.vehicle.variant',
            'verifiedBy',
        ]);
    }

    /**
     * Check whether financing is pending.
     */
    public function isPending(FinancingInfo $financing): bool
    {
        return $financing->financing_status === FinancingInfoStatus::PENDING;
    }

    /**
     * Check whether financing has been approved.
     */
    public function isApproved(FinancingInfo $financing): bool
    {
        return $financing->financing_status === FinancingInfoStatus::APPROVED;
    }

    /**
     * Check whether financing has been rejected.
     */
    public function isRejected(FinancingInfo $financing): bool
    {
        return $financing->financing_status === FinancingInfoStatus::REJECTED;
    }

    /**
     * Check whether financing has been completed.
     */
    public function isCompleted(FinancingInfo $financing): bool
    {
        return $financing->financing_status === FinancingInfoStatus::COMPLETED;
    }
}