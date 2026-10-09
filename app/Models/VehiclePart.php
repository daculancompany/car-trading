<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehiclePart extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $table = 'vehicle_parts';

    protected $fillable = [
        'part_name',
        'category',
        'quantity',
        'unit_price',
        'image_path',
        'archived',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'unit_price' => 'decimal:2',
        'archived' => 'boolean',
    ];

    protected $appends = [
        'image_url',
    ];

    /**
     * Part can be used in many job orders.
     */
    public function partsUsed(): HasMany
    {
        return $this->hasMany(PartsUsed::class, 'vehicle_part_id');
    }

    /**
     * Stock ledger of this part.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(PartStockMovement::class, 'vehicle_part_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? '/storage/' . $this->image_path : null;
    }
}
