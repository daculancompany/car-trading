<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    public $timestamps = false;

    protected $fillable = [
        'sender_user_id',
        'receiver_user_id',
        'title',
        'message',
        'notification_type',
        'is_read',
        'created_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    /**
     * Notification was sent by a user.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'sender_user_id'
        );
    }

    /**
     * Notification belongs to a receiver.
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'receiver_user_id'
        );
    }
}
