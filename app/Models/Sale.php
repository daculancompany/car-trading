<?php

namespace App\Models;

use App\Enums\SaleStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Sale extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'reservation_id',
        'created_by',
        'invoice_number',
        'sale_date',
        'discount_amount',
        'status',
        'archived',
    ];

    protected $casts = [
        'status' => SaleStatus::class,
        'discount_amount' => 'decimal:2',
        'sale_date' => 'datetime',
        'archived' => 'boolean',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function vehicleRelease(): HasOne
    {
        return $this->hasOne(VehicleRelease::class);
    }
}
