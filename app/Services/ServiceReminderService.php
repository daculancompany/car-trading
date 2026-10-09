<?php

namespace App\Services;

use App\Helpers\NotificationHelper;
use App\Models\JobOrder;
use App\Models\JobOrderInspection;
use App\Models\User;

class ServiceReminderService
{
    public static function remind(JobOrderInspection $inspection, ?int $senderId = null): bool
    {
        $inspection->loadMissing([
            'jobOrder.vehicle.brand',
            'jobOrder.vehicle.model',
            'jobOrder.requestService.vehicleRelease.sale.reservation.customer',
        ]);

        $receiver = $inspection->jobOrder?->requestService?->vehicleRelease?->sale?->reservation?->customer?->user_id;

        if (!$receiver || !$inspection->next_service_date) {
            return false;
        }

        $vehicle = $inspection->jobOrder->vehicle;
        $name = trim(($vehicle?->brand?->brand ?? '') . ' ' . ($vehicle?->model?->model ?? '')) ?: 'your vehicle';
        $date = $inspection->next_service_date->format('M d, Y');
        $service = $inspection->service_required ? " ({$inspection->service_required})" : '';

        $senderId ??= User::whereHas('role', fn ($query) => $query->where('name', 'Admin'))->value('id') ?? $receiver;

        NotificationHelper::send(
            $senderId,
            $receiver,
            'Service reminder',
            "Your {$name} is due for service on {$date}{$service}. Book a visit in My Service Requests.",
            'service'
        );

        $inspection->forceFill(['reminder_sent_at' => now()])->saveQuietly();

        return true;
    }

    public static function hasNewerJob(JobOrderInspection $inspection): bool
    {
        $jobOrder = $inspection->jobOrder;

        return $jobOrder !== null && JobOrder::where('vehicle_id', $jobOrder->vehicle_id)
            ->where('id', '>', $jobOrder->id)
            ->where('status', '!=', 'cancelled')
            ->exists();
    }
}
