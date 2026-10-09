<?php

namespace App\Enums;

enum VehicleReleaseStatus: string
{
    case PENDING = 'pending';
    case RELEASED = 'released';
    case CANCELLED = 'cancelled';
}
