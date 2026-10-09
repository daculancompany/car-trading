<?php

namespace App\Helpers;

use App\Models\Notification;

class NotificationHelper
{
    public static function send(
        ?int $senderUserId,
        int $receiverUserId,
        string $title,
        string $message,
        string $notificationType
    ): Notification {
        return Notification::create([
            'sender_user_id' => $senderUserId,
            'receiver_user_id' => $receiverUserId,
            'title' => $title,
            'message' => $message,
            'notification_type' => $notificationType,
            'is_read' => false,
            'created_at' => now(),
        ]);
    }
}
