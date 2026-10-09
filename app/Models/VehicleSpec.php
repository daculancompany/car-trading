<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleSpec extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'plate_number',
        'engine_number',
        'chassis_number',
        'mileage',
        'fuel_type',
        'transmission',
    ];

    protected $casts = [
        'mileage' => 'integer',
    ];

    /**
     * Vehicle specification belongs to a vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
