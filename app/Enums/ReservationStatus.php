<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case PENDING_RESERVATION = 'pending_reservation';
    case PENDING_DOCUMENTS = 'pending_documents';
    case PENDING_FINANCING = 'pending_financing';
    case PENDING_PAYMENT = 'pending_payment';
    case RESERVED = 'reserved';
    case REJECTED = 'rejected';
    case CANCELLED = 'cancelled';
    case EXPIRED = 'expired';
    case COMPLETED = 'completed';
}
