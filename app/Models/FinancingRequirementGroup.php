<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancingRequirementGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_name',
        'group_code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Requirements belonging to this group.
     */
    public function financingRequirements(): HasMany
    {
        return $this->hasMany(
            FinancingRequirement::class,
            'group_id'
        );
    }
}
