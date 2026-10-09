<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

use App\Enums\VehicleStatus;

class Vehicle extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'created_by_user_id',
        'brand_id',
        'model_id',
        'variant_id',
        'stock_no',
        'year_model',
        'color',
        'description',
        'features',
        'selling_price',
        'reservation_price',
        'status',
        'archived',
    ];

    protected $casts = [
        'status' => VehicleStatus::class,
        'selling_price' => 'decimal:2',
        'reservation_price' => 'decimal:2',
        'archived' => 'boolean',
    ];

    /**
     * Vehicle was created by a user.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Vehicle belongs to a brand.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(VehicleBrand::class, 'brand_id');
    }

    /**
     * Vehicle belongs to a model.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    /**
     * Vehicle belongs to a variant.
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(VehicleVariant::class, 'variant_id');
    }

    /**
     * Vehicle has one set of specifications.
     */
    public function specs(): HasOne
    {
        return $this->hasOne(VehicleSpec::class);
    }

    /**
     * Vehicle can have many expenses.
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(VehicleExpense::class);
    }

    /**
     * Vehicle can have many images.
     */
    public function images(): HasMany
    {
        return $this->hasMany(VehicleImage::class);
    }

    /**
     * Vehicle has one document record.
     */
    public function vehicleDocuments(): HasOne
    {
        return $this->hasOne(
            VehicleDocument::class
        );
    }

    /**
     * Vehicle can have many reservations.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }


    protected $appends = ['inspection_badge'];

    protected $hidden = ['latestInspection'];

    public function latestInspection(): HasOneThrough
    {
        return $this->hasOneThrough(JobOrderInspection::class, JobOrder::class, 'vehicle_id', 'job_order_id', 'id', 'id')
            ->latest('job_order_inspections.inspected_at');
    }

    public static function inspectionBadge(?JobOrderInspection $inspection): ?array
    {
        if (!$inspection) {
            return null;
        }

        $summary = $inspection->summary;
        $rated = $summary['good'] + $summary['attention'] + $summary['urgent'];

        return [
            'score' => $rated > 0 ? (int) round($summary['good'] / $rated * 100) : null,
            'good' => $summary['good'],
            'attention' => $summary['attention'],
            'urgent' => $summary['urgent'],
            'damages' => $summary['damages'],
            'inspected_at' => $inspection->inspected_at?->toDateString(),
            'odometer' => $inspection->odometer,
        ];
    }

    public function getInspectionBadgeAttribute(): ?array
    {
        return $this->relationLoaded('latestInspection') ? self::inspectionBadge($this->latestInspection) : null;
    }
}
