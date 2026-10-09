@extends('reports.layout')

@php
$title = 'Financing Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Applications</span>
            <span class="summary-value">{{ $summary['total_applications'] }}</span>
        </td>
        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">{{ $summary['pending'] }}</span>
        </td>
        <td>
            <span class="summary-title">Approved</span>
            <span class="summary-value">{{ $summary['approved'] }}</span>
        </td>
        <td>
            <span class="summary-title">Completed</span>
            <span class="summary-value">{{ $summary['completed'] }}</span>
        </td>
        <td>
            <span class="summary-title">Approved Amount</span>
            <span class="summary-value">P{{ number_format($summary['approved_amount'], 2) }}</span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Recorded</th>
            <th>Reference</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Financing Company</th>
            <th>Financed Amount</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse($financings as $financing)
            @php
            $customer = $financing->reservation?->customer;
            $vehicle = $financing->reservation?->vehicle;
            $vehicleName = $vehicle
                ? ($vehicle->brand?->brand ?? '') . ' ' . ($vehicle->model?->model ?? '') . ' ' . ($vehicle->variant?->variant ?? '')
                : 'N/A';
            @endphp
            <tr>
                <td>{{ $financing->created_at?->format('M d, Y') }}</td>
                <td>{{ $financing->financing_reference_no ?? 'N/A' }}</td>
                <td>{{ $customer ? $customer->first_name . ' ' . $customer->last_name : 'N/A' }}</td>
                <td>{{ $vehicleName }}</td>
                <td>{{ $financing->company_name ?? 'N/A' }}</td>
                <td class="text-right">P{{ number_format($financing->financed_amount, 2) }}</td>
                <td>{{ ucfirst($financing->financing_status->value ?? $financing->financing_status) }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="7" class="text-center">No financing records found.</td>
            </tr>
        @endforelse
    </tbody>
</table>

@endsection