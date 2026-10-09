<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobOrder extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'vehicle_id',
        'request_service_id',
        'assigned_staff_id',
        'created_by',
        'job_order_no',
        'invoice_no',
        'invoiced_at',
        'estimate_status',
        'estimate_amount',
        'estimate_note',
        'estimate_sent_at',
        'estimate_responded_at',
        'estimate_response_note',
        'estimate_responded_by',
        'warranty_days',
        'warranty_km',
        'rating',
        'feedback',
        'rated_at',
        'start_job',
        'finish_job',
        'work_type',
        'priority',
        'scheduled_at',
        'estimated_completion',
        'description',
        'reported_problem',
        'labor_cost',
        'estimated_labor_cost',
        'odometer_in',
        'fuel_level',
        'personal_items',
        'status',
        'progress',
        'archived',
    ];

    protected $casts = [
        'start_job' => 'datetime',
        'finish_job' => 'datetime',
        'labor_cost' => 'decimal:2',
        'estimated_labor_cost' => 'decimal:2',
        'scheduled_at' => 'datetime',
        'estimated_completion' => 'datetime',
        'odometer_in' => 'integer',
        'progress' => 'integer',
        'archived' => 'boolean',
        'estimate_amount' => 'decimal:2',
        'estimate_sent_at' => 'datetime',
        'estimate_responded_at' => 'datetime',
        'invoiced_at' => 'datetime',
        'rated_at' => 'datetime',
        'warranty_days' => 'integer',
        'warranty_km' => 'integer',
        'rating' => 'integer',
    ];

    /**
     * Job order belongs to a vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(
            Vehicle::class,
            'vehicle_id'
        );
    }

    /**
     * Job order optionally belongs to a customer service request.
     */
    public function requestService(): BelongsTo
    {
        return $this->belongsTo(
            RequestService::class,
            'request_service_id'
        );
    }

    /**
     * Job order is assigned to a staff member.
     */
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(
            Staff::class,
            'assigned_staff_id'
        );
    }

    /**
     * Job order was created by a user (Admin / Business).
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'created_by'
        );
    }

    /**
     * Job order can have many vehicle parts.
     */
    public function partsUsed(): HasMany
    {
        return $this->hasMany(
            PartsUsed::class,
            'job_order_id'
        );
    }

    public const NO_INSPECTION_WORK_TYPES = ['washing', 'detailing'];

    protected $appends = [
        'requires_inspection',
        'needs_estimate_approval',
        'parts_total',
        'total_cost',
        'amount_paid',
        'balance',
        'payment_status',
        'warranty_until',
        'warranty_active',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(JobOrderPayment::class)->orderBy('paid_at');
    }

    public function estimateResponder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'estimate_responded_by');
    }

    public function getNeedsEstimateApprovalAttribute(): bool
    {
        return $this->request_service_id !== null && $this->requires_inspection;
    }

    public function getPartsTotalAttribute(): float
    {
        $parts = $this->relationLoaded('partsUsed') ? $this->partsUsed : $this->partsUsed()->with('vehiclePart:id,unit_price')->get();

        return round($parts->sum(fn ($used) => (float) ($used->vehiclePart?->unit_price ?? 0) * $used->quantity), 2);
    }

    public function getTotalCostAttribute(): float
    {
        return round((float) $this->labor_cost + $this->parts_total, 2);
    }

    public function getAmountPaidAttribute(): float
    {
        $payments = $this->relationLoaded('payments') ? $this->payments : $this->payments()->get();

        return round((float) $payments->sum('amount'), 2);
    }

    public function getBalanceAttribute(): float
    {
        return max(round($this->total_cost - $this->amount_paid, 2), 0);
    }

    public function getPaymentStatusAttribute(): string
    {
        if ($this->status !== 'completed') {
            return 'not_billed';
        }
        if ($this->total_cost <= 0 || $this->amount_paid >= $this->total_cost) {
            return 'paid';
        }

        return $this->amount_paid > 0 ? 'partial' : 'unpaid';
    }

    public function getWarrantyUntilAttribute(): ?string
    {
        if (!$this->warranty_days || !$this->finish_job) {
            return null;
        }

        return $this->finish_job->copy()->addDays($this->warranty_days)->toDateString();
    }

    public function getWarrantyActiveAttribute(): bool
    {
        return $this->warranty_until !== null && now()->toDateString() <= $this->warranty_until;
    }

    public function activityLabel(): string
    {
        return 'Job order ' . $this->job_order_no;
    }

    public function getRequiresInspectionAttribute(): bool
    {
        return !in_array($this->work_type, self::NO_INSPECTION_WORK_TYPES, true);
    }

    public function updates(): HasMany
    {
        return $this->hasMany(JobOrderUpdate::class)->latest();
    }

    public function inspection(): HasOne
    {
        return $this->hasOne(JobOrderInspection::class);
    }

    public function canStart(): bool
    {
        if (!$this->requires_inspection) {
            return true;
        }

        $inspection = $this->inspection;

        if (!$inspection) {
            return false;
        }

        if ($inspection->result === 'not_found' && $inspection->office_decision !== 'proceed') {
            return false;
        }

        return !$this->needs_estimate_approval || $this->estimate_status === 'approved';
    }

    public function startBlockReason(): ?string
    {
        if ($this->canStart()) {
            return null;
        }

        $inspection = $this->inspection;

        if (!$inspection) {
            return 'Inspect the vehicle first before starting this job.';
        }

        if ($inspection->result === 'not_found' && $inspection->office_decision !== 'proceed') {
            return 'The inspection found no problem. The office must decide to proceed before work can start.';
        }

        return match ($this->estimate_status) {
            'pending' => 'Waiting for the customer to approve the estimate.',
            'declined' => 'The customer declined the estimate. Send a revised estimate or cancel the job.',
            default => 'Send the estimate to the customer and wait for approval before starting.',
        };
    }
}
