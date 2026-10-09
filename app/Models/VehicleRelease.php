<?php

namespace App\Models;

use App\Enums\VehicleReleaseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class VehicleRelease extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'sale_id',
        'release_number',
        'release_date',
        'status',
        'archived',
    ];

    protected $casts = [
        'archived' => 'boolean',
        'status' => VehicleReleaseStatus::class,
        'release_date' => 'date',
    ];

    /**
     * Vehicle release belongs to a sale.
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(
            Sale::class
        );
    }

    /**
     * Vehicle release can have one service request.
     */
    public function requestService(): HasOne
    {
        return $this->hasOne(
            RequestService::class
        );
    }
}
