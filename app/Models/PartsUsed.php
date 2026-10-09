<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartsUsed extends Model
{
    protected $table = 'parts_useds';

    protected $fillable = [
        'job_order_id',
        'vehicle_part_id',
        'quantity',
        'used_at',
    ];

    protected $casts = [
        'used_at' => 'datetime',
        'quantity' => 'integer',
    ];

    // Job Order
    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(
            JobOrder::class,
            'job_order_id'
        );
    }

    // Vehicle Part
    public function vehiclePart(): BelongsTo
    {
        return $this->belongsTo(
            VehiclePart::class,
            'vehicle_part_id'
        );
    }
}
