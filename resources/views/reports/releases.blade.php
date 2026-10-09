@extends('reports.layout')

@php
$title = 'Vehicle Release Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Releases</span>
            <span class="summary-value">{{ $summary['total_releases'] }}</span>
        </td>

        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">{{ $summary['pending'] }}</span>
        </td>

        <td>
            <span class="summary-title">Released</span>
            <span class="summary-value">{{ $summary['released'] }}</span>
        </td>

        <td>
            <span class="summary-title">Cancelled</span>
            <span class="summary-value">{{ $summary['cancelled'] }}</span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Release No.</th>
            <th>Release Date</th>
            <th>Invoice No.</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @forelse($data as $release)

        @php
        $reservation = $release->sale?->reservation;
        $customer = $reservation?->customer;
        $vehicle = $reservation?->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';
        @endphp

        <tr>
            <td>{{ $release->release_number }}</td>
            <td>{{ $release->release_date ? \Carbon\Carbon::parse($release->release_date)->format('M d, Y') : 'N/A' }}</td>
            <td>{{ $release->sale?->invoice_number ?? 'N/A' }}</td>
            <td>{{ $customer ? $customer->first_name . ' ' . $customer->last_name : 'N/A' }}</td>
            <td>{{ $vehicleName }}</td>
            <td>{{ ucfirst($release->status?->value ?? '') }}</td>
        </tr>

        @empty

        <tr>
            <td colspan="6" class="text-center">No releases found.</td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection
