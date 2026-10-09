<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $fillable = [
        'reservation_id',
        'sale_id',
        'financing_info_id',
        'payment_account_id',
        'verified_by',
        'payer_type',
        'payment_type',
        'payment_method',
        'amount',
        'reference_number',
        'payment_proof',
        'payment_date',
        'payment_status',
        'verified_at',
        'remarks',
        'archived',
    ];

    protected $casts = [
        'payment_status' => PaymentStatus::class,
        'amount' => 'decimal:2',
        'payment_date' => 'datetime',
        'verified_at' => 'datetime',
        'archived' => 'boolean',
    ];

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function financingInfo(): BelongsTo
    {
        return $this->belongsTo(FinancingInfo::class);
    }

    public function paymentAccount(): BelongsTo
    {
        return $this->belongsTo(PaymentAccount::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
