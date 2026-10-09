<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

use App\Enums\ReservationStatus;

class Reservation extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'customer_id',
        'vehicle_id',
        'reserved_by_id',
        'reservation_source',
        'valid_id_type',
        'valid_id_front',
        'valid_id_back',
        'valid_id_front_status',
        'valid_id_back_status',
        'valid_id_front_remarks',
        'valid_id_back_remarks',
        'purchase_option',
        'reserved_at',
        'expires_at',
        'reservation_status',
        'remarks',
        'archived',
    ];

    public ?string $historyAction = null;

    public ?string $historyNote = null;

    protected $casts = [
        'reservation_status' => ReservationStatus::class,
        'reserved_at' => 'datetime',
        'expires_at' => 'datetime',
        'archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::created(function (Reservation $reservation) {
            $reservation->logStatus(null, 'created');
        });

        static::updated(function (Reservation $reservation) {
            if ($reservation->wasChanged('reservation_status')) {
                $from = $reservation->getOriginal('reservation_status');
                $reservation->logStatus($from instanceof ReservationStatus ? $from->value : $from);
            }
        });
    }

    public function logStatus(?string $from, ?string $action = null, ?string $note = null, ?string $to = null): ReservationStatusHistory
    {
        $current = $this->reservation_status instanceof ReservationStatus ? $this->reservation_status->value : (string) $this->reservation_status;

        $history = $this->statusHistories()->create([
            'from_status' => $from,
            'to_status' => $to ?? $current,
            'action' => $action ?? $this->historyAction ?? (auth()->id() ? 'status_changed' : 'auto'),
            'note' => $note ?? $this->historyNote,
            'user_id' => auth()->id(),
        ]);

        $this->historyAction = null;
        $this->historyNote = null;

        return $history;
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ReservationStatusHistory::class)->oldest()->orderBy('id');
    }

    /**
     * Reservation belongs to a customer.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Reservation belongs to a vehicle.
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Reservation may be created by a user.
     */
    public function reservedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reserved_by_id');
    }

    /**
     * Reservation can have many payments.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Reservation can have one financing application.
     */
    public function financing(): HasOne
    {
        return $this->hasOne(FinancingInfo::class);
    }

    /**
     * Reservation can have one sale.
     */
    public function sale(): HasOne
    {
        return $this->hasOne(Sale::class);
    }
}
