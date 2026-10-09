<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Staff extends Model
{
    use HasFactory;
    use \App\Models\Concerns\LogsActivity;

    protected $table = 'staffs';

    protected $fillable = [
        'user_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'address',
        'mobile_number',
        'hire_date',
        'work_start_hour',
        'work_end_hour',
        'status',
        'archived',
    ];

    protected $casts = [
        'hire_date' => 'date',
        'work_start_hour' => 'datetime:H:i',
        'work_end_hour' => 'datetime:H:i',
        'archived' => 'boolean',
    ];

    /**
     * Staff belongs to a user account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
