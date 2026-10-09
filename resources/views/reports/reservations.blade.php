@extends('reports.layout')

@php
$title = 'Reservation Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Total</span>
            <span class="summary-value">
                {{ $summary['total_reservations'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">
                {{ $summary['pending'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Reserved</span>
            <span class="summary-value">
                {{ $summary['reserved'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Completed</span>
            <span class="summary-value">
                {{ $summary['completed'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Cancelled</span>
            <span class="summary-value">
                {{ $summary['cancelled'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Expired</span>
            <span class="summary-value">
                {{ $summary['expired'] }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Source</th>
            <th>Purchase Option</th>
            <th>Reserved At</th>
            <th>Expires At</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>

        @forelse($reservations as $reservation)

        @php
        $customer = $reservation->customer;
        $vehicle = $reservation->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';
        @endphp

        <tr>
            <td>
                {{ $reservation->reserved_at?->format('M d, Y') }}
            </td>

            <td>
                {{ $customer
                        ? $customer->first_name . ' ' . $customer->last_name
                        : 'N/A'
                    }}
            </td>

            <td>{{ $vehicleName }}</td>

            <td>
                {{ ucfirst(str_replace('_', ' ', $reservation->reservation_source)) }}
            </td>

            <td>
                {{ ucfirst($reservation->purchase_option) }}
            </td>

            <td>
                {{ $reservation->expires_at?->format('M d, Y') }}
            </td>

            <td>
                {{ ucwords(str_replace('_', ' ', $reservation->reservation_status->value)) }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="7" class="text-center">
                No reservations found.
            </td>
        </tr>

        @endforelse

    </tbody>
</table>

@endsection