<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrderInspection extends Model
{
    use \App\Models\Concerns\LogsActivity;

    public const RESULTS = ['confirmed', 'partial', 'not_found'];

    public const CHECK_STATUSES = ['good', 'attention', 'urgent', 'na', 'ok', 'issue'];

    public const WHEELS = ['lf', 'rf', 'lr', 'rr'];

    public const DAMAGE_VIEWS = ['left', 'right', 'top', 'front', 'rear'];

    public const DAMAGE_TYPES = ['scratch', 'dent', 'crack', 'chip', 'rust', 'paint', 'missing', 'other'];

    protected $fillable = [
        'job_order_id',
        'inspected_by',
        'inspected_at',
        'odometer',
        'result',
        'findings',
        'recommendation',
        'checklist',
        'photos',
        'fuel_level',
        'pre_checks',
        'tires',
        'brakes',
        'damage_marks',
        'recommended_services',
        'next_service_date',
        'service_required',
        'estimated_cost',
        'notes',
        'office_decision',
        'decided_by',
        'decided_at',
        'decision_note',
    ];

    protected $casts = [
        'inspected_at' => 'datetime',
        'decided_at' => 'datetime',
        'odometer' => 'integer',
        'checklist' => 'array',
        'photos' => 'array',
        'pre_checks' => 'array',
        'tires' => 'array',
        'brakes' => 'array',
        'damage_marks' => 'array',
        'recommended_services' => 'array',
        'next_service_date' => 'date:Y-m-d',
        'estimated_cost' => 'decimal:2',
    ];

    protected $appends = [
        'photo_list',
        'summary',
    ];

    public static function normalizeStatus(?string $status): ?string
    {
        return match ($status) {
            'ok' => 'good',
            'issue' => 'urgent',
            default => $status,
        };
    }

    public function getSummaryAttribute(): array
    {
        $statuses = collect($this->checklist ?? [])->pluck('status')
            ->merge(collect($this->tires['wheels'] ?? [])->pluck('status'))
            ->merge(collect($this->brakes ?? [])->pluck('status'))
            ->map(fn ($status) => self::normalizeStatus($status))
            ->filter();

        return [
            'good' => $statuses->filter(fn ($status) => $status === 'good')->count(),
            'attention' => $statuses->filter(fn ($status) => $status === 'attention')->count(),
            'urgent' => $statuses->filter(fn ($status) => $status === 'urgent')->count(),
            'na' => $statuses->filter(fn ($status) => $status === 'na')->count(),
            'damages' => count($this->damage_marks ?? []),
        ];
    }

    public function getPhotoListAttribute(): array
    {
        return collect($this->photos ?? [])
            ->map(fn ($photo) => [
                'path' => $photo['path'],
                'url' => '/storage/' . $photo['path'],
                'item' => $photo['item'] ?? null,
                'caption' => $photo['caption'] ?? null,
            ])
            ->values()
            ->all();
    }

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function inspector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function decider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'decided_by');
    }
}
