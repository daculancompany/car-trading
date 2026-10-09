<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancingRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'requirement_name',
        'description',
        'required_quantity',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'required_quantity' => 'integer',
    ];

    /**
     * The group this requirement belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(
            FinancingRequirementGroup::class,
            'group_id'
        );
    }

    /**
     * Financing documents using this requirement.
     */
    public function financingDocuments(): HasMany
    {
        return $this->hasMany(
            FinancingDocument::class,
            'financing_requirement_id'
        );
    }
}
