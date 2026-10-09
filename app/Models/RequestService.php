<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RequestService extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'vehicle_release_id',
        'service_request_number',
        'service_type',
        'urgency',
        'request_detail',
        'symptoms',
        'problem_started',
        'mileage',
        'request_proof',
        'photos',
        'request_date_pref',
        'preferred_time',
        'contact_number',
        'status',
        'archived',
    ];

    protected $appends = [
        'photo_urls',
    ];

    public function getPhotoUrlsAttribute(): array
    {
        $paths = $this->photos ?: array_filter([$this->request_proof]);

        return collect($paths)
            ->map(fn ($path) => '/storage/' . $path)
            ->values()
            ->all();
    }

    protected $casts = [
        'request_date_pref' => 'date',
        'symptoms' => 'array',
        'photos' => 'array',
        'mileage' => 'integer',
        'archived' => 'boolean',
    ];

    /**
     * Service request belongs to a vehicle release.
     */
    public function vehicleRelease()
    {
        return $this->belongsTo(
            VehicleRelease::class,
            'vehicle_release_id'
        );
    }

    /**
     * Service request can have one job order.
     */
    public function jobOrder(): HasOne
    {
        return $this->hasOne(JobOrder::class);
    }
}
