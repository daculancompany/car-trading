@extends('reports.layout')

@php
$title = 'Service Billing Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td><span class="summary-title">Invoices</span><span class="summary-value">{{ $summary['invoices'] }}</span></td>
        <td><span class="summary-title">Billed</span><span class="summary-value">₱{{ number_format($summary['billed'], 2) }}</span></td>
        <td><span class="summary-title">Collected</span><span class="summary-value">₱{{ number_format($summary['collected'], 2) }}</span></td>
        <td><span class="summary-title">Outstanding</span><span class="summary-value">₱{{ number_format($summary['outstanding'], 2) }}</span></td>
        <td><span class="summary-title">Unpaid / Partial</span><span class="summary-value">{{ $summary['unpaid'] }}</span></td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Invoice</th>
            <th>Job Order</th>
            <th>Completed</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Labor</th>
            <th>Parts</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse($data as $row)
        <tr>
            <td>{{ $row['invoice_no'] ?? '—' }}</td>
            <td>{{ $row['job_order_no'] }}</td>
            <td>{{ $row['finish_job'] ? \Carbon\Carbon::parse($row['finish_job'])->format('M d, Y') : '—' }}</td>
            <td>{{ $row['customer_name'] }}</td>
            <td>{{ $row['vehicle'] }}</td>
            <td class="text-right">₱{{ number_format($row['labor_cost'], 2) }}</td>
            <td class="text-right">₱{{ number_format($row['parts_total'], 2) }}</td>
            <td class="text-right">₱{{ number_format($row['total_cost'], 2) }}</td>
            <td class="text-right">₱{{ number_format($row['amount_paid'], 2) }}</td>
            <td class="text-right">₱{{ number_format($row['balance'], 2) }}</td>
            <td>{{ ucwords(str_replace('_', ' ', $row['payment_status'])) }}</td>
        </tr>
        @empty
        <tr><td colspan="11" class="text-center">No completed jobs in this period.</td></tr>
        @endforelse
    </tbody>
</table>

@endsection
