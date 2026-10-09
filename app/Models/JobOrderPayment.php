<?php

namespace App\Models;

use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrderPayment extends Model
{
    use LogsActivity;

    public const METHODS = ['cash', 'gcash', 'bank_transfer', 'card', 'other'];

    protected $fillable = [
        'job_order_id',
        'amount',
        'method',
        'reference_no',
        'paid_at',
        'note',
        'received_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by');
    }

    public function activityLabel(): string
    {
        return 'Service payment ₱' . number_format((float) $this->amount, 2) . ' · ' . ($this->jobOrder?->job_order_no ?? "JO #{$this->job_order_id}");
    }
}
