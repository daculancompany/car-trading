<?php

namespace App\Models;

use App\Enums\FinancingDocumentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancingDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'financing_info_id',
        'financing_requirement_id',
        'verified_by',
        'file_name',
        'file_path',
        'uploaded_at',
        'verification_status',
        'verified_at',
        'remarks',
        'archived'
    ];

    protected $casts = [
        'archived' => 'boolean',
        'uploaded_at' => 'datetime',
        'verified_at' => 'datetime',
        'verification_status' => FinancingDocumentStatus::class,
    ];

    /**
     * Document belongs to a financing info application.
     */
    public function financing(): BelongsTo
    {
        return $this->belongsTo(FinancingInfo::class, 'financing_info_id');
    }

    /**
     * Document belongs to a financing requirement.
     */
    public function financingRequirement(): BelongsTo
    {
        return $this->belongsTo(
            FinancingRequirement::class,
            'financing_requirement_id'
        );
    }

    /**
     * Document may be verified/rejected by a user.
     */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
