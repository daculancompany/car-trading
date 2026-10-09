@extends('reports.layout')

@php
$title = 'Job Order Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Job Orders</span>
            <span class="summary-value">{{ $summary['total_job_orders'] }}</span>
        </td>

        <td>
            <span class="summary-title">Completed</span>
            <span class="summary-value">{{ $summary['completed'] }}</span>
        </td>

        <td>
            <span class="summary-title">Labor</span>
            <span class="summary-value">₱{{ number_format($summary['total_labor'], 2) }}</span>
        </td>

        <td>
            <span class="summary-title">Parts</span>
            <span class="summary-value">₱{{ number_format($summary['total_parts'], 2) }}</span>
        </td>

        <td>
            <span class="summary-title">Grand Total</span>
            <span class="summary-value">₱{{ number_format($summary['grand_total'], 2) }}</span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>JO No.</th>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Work Type</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Labor</th>
            <th>Parts</th>
            <th>Total</th>
        </tr>
    </thead>

    <tbody>
        @forelse($data as $jobOrder)

        @php
        $vehicle = $jobOrder->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';

        $staff = $jobOrder->assignedStaff;
        @endphp

        <tr>
            <td>{{ $jobOrder->job_order_no }}</td>
            <td>{{ $jobOrder->created_at?->format('M d, Y') }}</td>
            <td>{{ $vehicleName }}</td>
            <td>{{ ucfirst($jobOrder->work_type) }}</td>
            <td>{{ $staff ? $staff->first_name . ' ' . $staff->last_name : 'N/A' }}</td>
            <td>{{ ucwords(str_replace('_', ' ', $jobOrder->status)) }}</td>
            <td class="text-right">₱{{ number_format($jobOrder->labor_cost, 2) }}</td>
            <td class="text-right">₱{{ number_format($jobOrder->parts_cost, 2) }}</td>
            <td class="text-right">₱{{ number_format($jobOrder->total_cost, 2) }}</td>
        </tr>

        @empty

        <tr>
            <td colspan="9" class="text-center">No job orders found.</td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection
