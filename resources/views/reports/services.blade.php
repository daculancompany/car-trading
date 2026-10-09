@extends('reports.layout')

@php
$title = 'Service Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Requests</span>
            <span class="summary-value">
                {{ $summary['total_requests'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">
                {{ $summary['pending'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Assigned</span>
            <span class="summary-value">
                {{ $summary['assigned'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">In Progress</span>
            <span class="summary-value">
                {{ $summary['in_progress'] }}
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
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Request No.</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Preferred Date</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>

        @forelse($services as $service)

        @php
        $reservation =
        $service->vehicleRelease?->sale?->reservation;

        $customer = $reservation?->customer;
        $vehicle = $reservation?->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';
        @endphp

        <tr>
            <td>
                {{ $service->service_request_number }}
            </td>

            <td>
                {{ $service->created_at?->format('M d, Y') }}
            </td>

            <td>
                {{ $customer
                        ? $customer->first_name . ' ' . $customer->last_name
                        : 'N/A'
                    }}
            </td>

            <td>{{ $vehicleName }}</td>

            <td>
                {{ $service->request_date_pref?->format('M d, Y') }}
            </td>

            <td>
                {{ ucwords(str_replace('_', ' ', $service->status)) }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="6" class="text-center">
                No service requests found.
            </td>
        </tr>

        @endforelse

    </tbody>
</table>

@endsection