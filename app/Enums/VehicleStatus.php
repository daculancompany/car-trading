<?php

namespace App\Enums;

enum VehicleStatus: string
{
    case AVAILABLE = 'available';
    case RESERVED = 'reserved';
    case SOLD = 'sold';
    case MAINTENANCE = 'maintenance';
    case UNAVAILABLE = 'unavailable';
}
