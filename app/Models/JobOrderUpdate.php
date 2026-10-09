<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrderUpdate extends Model
{
    protected $fillable = [
        'job_order_id',
        'user_id',
        'progress',
        'comment',
        'photos',
    ];

    protected $casts = [
        'progress' => 'integer',
        'photos' => 'array',
    ];

    protected $appends = [
        'photo_urls',
    ];

    public function getPhotoUrlsAttribute(): array
    {
        return collect($this->photos ?? [])
            ->map(fn ($path) => '/storage/' . $path)
            ->values()
            ->all();
    }

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
