<?php

namespace App\Console\Commands;

use App\Models\JobOrderInspection;
use App\Services\ServiceReminderService;
use Illuminate\Console\Command;

class SendServiceReminders extends Command
{
    protected $signature = 'services:send-reminders {--days=3 : Remind this many days before the due date}';

    protected $description = 'Notify customers whose next vehicle service is coming up';

    public function handle(): int
    {
        $days = max(0, (int) $this->option('days'));

        $due = JobOrderInspection::query()
            ->whereNotNull('next_service_date')
            ->whereNull('reminder_sent_at')
            ->whereDate('next_service_date', '<=', now()->addDays($days))
            ->whereDate('next_service_date', '>=', now()->subDays(7))
            ->whereHas('jobOrder', fn ($query) => $query->where('status', 'completed'))
            ->get();

        $sent = $due
            ->reject(fn ($inspection) => ServiceReminderService::hasNewerJob($inspection))
            ->filter(fn ($inspection) => ServiceReminderService::remind($inspection))
            ->count();

        $this->info("Sent {$sent} reminder(s).");

        return self::SUCCESS;
    }
}
