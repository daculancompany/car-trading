<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_id',
        'variant',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Vehicle variant belongs to a vehicle model.
     */
    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'model_id');
    }

    /**
     * Vehicle variant can have many vehicles.
     */
    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'variant_id');
    }
}
