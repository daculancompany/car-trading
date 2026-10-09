<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'address',
        'civil_status',
        'employment_type',
        'mobile_number',
        'facebook',
        'image_path',
        'date_registered',
        'is_active',
    ];

    protected $appends = [
        'image_url',
    ];

    protected $casts = [
        'date_registered' => 'date',
        'is_active' => 'boolean',
    ];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? '/storage/' . $this->image_path : null;
    }

    /**
     * Customer belongs to a user account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * Customer can have many reservations.
     */
    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class, 'customer_id', 'id');
    }
}
