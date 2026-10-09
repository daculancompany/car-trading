<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        "role_type",
        'description',
    ];

    /**
     * A role can have many users.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
