<?php

namespace App\Models\Concerns;

use App\Models\ActivityLog;
use BackedEnum;
use Illuminate\Support\Str;
use Throwable;

trait LogsActivity
{
    protected static array $activityHidden = ['password', 'remember_token', 'updated_at', 'created_at'];

    public static function bootLogsActivity(): void
    {
        static::created(fn ($model) => $model->writeActivity('created', $model->activityValues($model->getAttributes())));

        static::updated(function ($model) {
            $changes = [];
            foreach ($model->getChanges() as $key => $value) {
                if (in_array($key, static::$activityHidden, true)) {
                    continue;
                }
                $changes[$key] = [
                    'from' => $model->activityValue($model->getOriginal($key)),
                    'to' => $model->activityValue($model->getAttribute($key)),
                ];
            }
            if ($changes) {
                $model->writeActivity('updated', $changes);
            }
        });

        static::deleted(fn ($model) => $model->writeActivity('deleted', null));
    }

    public function activityLabel(): string
    {
        foreach (['job_order_no', 'invoice_number', 'service_request_number', 'stock_no', 'part_name', 'username'] as $field) {
            if (!empty($this->{$field})) {
                return class_basename($this) . ' ' . $this->{$field};
            }
        }

        if (!empty($this->first_name)) {
            return class_basename($this) . ' ' . trim($this->first_name . ' ' . ($this->last_name ?? ''));
        }

        return class_basename($this) . ' #' . $this->getKey();
    }

    protected function activityValues(array $attributes): array
    {
        return collect($attributes)
            ->except(static::$activityHidden)
            ->map(fn ($value, $key) => $this->activityValue($this->getAttribute($key)))
            ->all();
    }

    protected function activityValue(mixed $value): mixed
    {
        if ($value instanceof BackedEnum) {
            return $value->value;
        }
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d H:i');
        }
        if (is_array($value)) {
            return Str::limit(json_encode($value), 300);
        }
        if (is_string($value)) {
            return Str::limit($value, 300);
        }

        return $value;
    }

    protected function writeActivity(string $action, ?array $changes): void
    {
        try {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'subject_type' => class_basename($this),
                'subject_id' => $this->getKey(),
                'subject_label' => Str::limit($this->activityLabel(), 250),
                'changes' => $changes,
                'ip_address' => app()->runningInConsole() ? null : request()->ip(),
            ]);
        } catch (Throwable) {
        }
    }
}
