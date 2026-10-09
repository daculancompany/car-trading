@extends('reports.layout')

@php
$title = 'Mechanic Performance Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td><span class="summary-title">Staff</span><span class="summary-value">{{ $summary['staff'] }}</span></td>
        <td><span class="summary-title">Jobs</span><span class="summary-value">{{ $summary['total_jobs'] }}</span></td>
        <td><span class="summary-title">Completed</span><span class="summary-value">{{ $summary['completed'] }}</span></td>
        <td><span class="summary-title">Avg Rating</span><span class="summary-value">{{ $summary['avg_rating'] ?? '—' }}</span></td>
        <td><span class="summary-title">Revenue</span><span class="summary-value">₱{{ number_format($summary['total_revenue'], 2) }}</span></td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Staff</th>
            <th>Role</th>
            <th>Jobs</th>
            <th>Completed</th>
            <th>In Progress</th>
            <th>Cancelled</th>
            <th>Avg Hours</th>
            <th>On Time</th>
            <th>Rating</th>
            <th>Labor</th>
            <th>Total Revenue</th>
        </tr>
    </thead>
    <tbody>
        @forelse($data as $row)
        <tr>
            <td>{{ $row['name'] }}</td>
            <td>{{ $row['role'] }}</td>
            <td class="text-center">{{ $row['total_jobs'] }}</td>
            <td class="text-center">{{ $row['completed'] }}</td>
            <td class="text-center">{{ $row['in_progress'] }}</td>
            <td class="text-center">{{ $row['cancelled'] }}</td>
            <td class="text-center">{{ $row['avg_hours'] ?? '—' }}</td>
            <td class="text-center">{{ $row['on_time_rate'] !== null ? $row['on_time_rate'] . '%' : '—' }}</td>
            <td class="text-center">{{ $row['avg_rating'] !== null ? $row['avg_rating'] . ' (' . $row['ratings'] . ')' : '—' }}</td>
            <td class="text-right">₱{{ number_format($row['labor_revenue'], 2) }}</td>
            <td class="text-right">₱{{ number_format($row['total_revenue'], 2) }}</td>
        </tr>
        @empty
        <tr><td colspan="11" class="text-center">No staff found.</td></tr>
        @endforelse
    </tbody>
</table>

@endsection
