<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartStockMovement extends Model
{
    use \App\Models\Concerns\LogsActivity;

    public const INCOMING_TYPES = ['receiving', 'stock_in'];

    public const TYPES = ['receiving', 'stock_in', 'stock_out', 'damage'];

    protected $table = 'part_stock_movements';

    protected $fillable = [
        'vehicle_part_id',
        'type',
        'quantity',
        'unit_cost',
        'amount',
        'previous_quantity',
        'new_quantity',
        'reference_type',
        'job_order_id',
        'parts_used_id',
        'reference_no',
        'remarks',
        'image_path',
        'created_by',
        'moved_at',
    ];

    protected $appends = [
        'image_url',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_cost' => 'decimal:2',
        'amount' => 'decimal:2',
        'previous_quantity' => 'integer',
        'new_quantity' => 'integer',
        'moved_at' => 'datetime',
    ];

    public function vehiclePart(): BelongsTo
    {
        return $this->belongsTo(VehiclePart::class, 'vehicle_part_id');
    }

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class, 'job_order_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? '/storage/' . $this->image_path : null;
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
