@extends('reports.layout')

@php
$title = 'Vehicle Inventory Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Total</span>
            <span class="summary-value">
                {{ $summary['total_vehicles'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Available</span>
            <span class="summary-value">
                {{ $summary['available'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Reserved</span>
            <span class="summary-value">
                {{ $summary['reserved'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Sold</span>
            <span class="summary-value">
                {{ $summary['sold'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Maintenance</span>
            <span class="summary-value">
                {{ $summary['maintenance'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Unavailable</span>
            <span class="summary-value">
                {{ $summary['unavailable'] }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Stock No.</th>
            <th>Vehicle</th>
            <th>Year</th>
            <th>Color</th>
            <th>Transmission</th>
            <th>Fuel</th>
            <th>Mileage</th>
            <th>Selling Price</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>

        @forelse($vehicles as $vehicle)

        @php
        $vehicleName =
        ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '');
        @endphp

        <tr>
            <td>{{ $vehicle->stock_no }}</td>

            <td>{{ $vehicleName }}</td>

            <td>{{ $vehicle->year_model }}</td>

            <td>{{ $vehicle->color }}</td>

            <td>
                {{ ucfirst($vehicle->specs?->transmission ?? 'N/A') }}
            </td>

            <td>
                {{ ucfirst($vehicle->specs?->fuel_type ?? 'N/A') }}
            </td>

            <td class="text-right">
                {{ number_format($vehicle->specs?->mileage ?? 0) }} km
            </td>

            <td class="text-right">
                ₱{{ number_format($vehicle->selling_price, 2) }}
            </td>

            <td>
                {{ ucfirst($vehicle->status->value) }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="9" class="text-center">
                No vehicles found.
            </td>
        </tr>

        @endforelse

    </tbody>
</table>

@endsection