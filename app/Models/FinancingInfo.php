<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\FinancingInfoStatus;

class FinancingInfo extends Model
{
    use \App\Models\Concerns\LogsActivity;

    // Relationships
    use HasFactory;

    // Table

    protected $table = 'financing_infos';

    // Mass Assignment

    protected $fillable = [
        'reservation_id',
        'company_name',
        'contact_person',
        'contact_number',
        'email',
        'address',
        'financing_reference_no',
        'financed_amount',
        'monthly_payment',
        'loan_term_months',
        'verified_by',
        'financing_status',
        'remarks',
        'archived',
    ];

    // Casts

    protected $casts = [
        'financed_amount' => 'decimal:2',
        'monthly_payment' => 'decimal:2',
        'loan_term_months' => 'integer',
        'financing_status' => FinancingInfoStatus::class,
        'archived' => 'boolean',
    ];

    // Reservation
    // Financing belongs to a reservation.

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(
            Reservation::class,
            'reservation_id'
        );
    }

    // Verified By
    // CDO staff member who verified the financing information.

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'verified_by'
        );
    }

    // Documents
    // Financing can have many submitted documents.

    public function documents(): HasMany
    {
        return $this->hasMany(
            FinancingDocument::class,
            'financing_info_id'
        );
    }
}
