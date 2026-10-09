@extends('reports.layout')

@php
$title = 'Payment Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Transactions</span>
            <span class="summary-value">
                {{ $summary['total_transactions'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Verified</span>
            <span class="summary-value">
                {{ $summary['verified_payments'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">
                {{ $summary['pending_payments'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Rejected</span>
            <span class="summary-value">
                {{ $summary['rejected_payments'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Verified Amount</span>
            <span class="summary-value">
                ₱{{ number_format($summary['total_verified_amount'], 2) }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Payment Type</th>
            <th>Method</th>
            <th>Amount</th>
            <th>Reference</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @forelse($payments as $payment)

        @php
        $customer = $payment->reservation?->customer;
        @endphp

        <tr>
            <td>
                {{ $payment->payment_date?->format('M d, Y') }}
            </td>

            <td>
                {{ $customer
                        ? $customer->first_name . ' ' . $customer->last_name
                        : 'N/A'
                    }}
            </td>

            <td>
                {{ ucwords(str_replace('_', ' ', $payment->payment_type)) }}
            </td>

            <td>
                {{ ucwords(str_replace('_', ' ', $payment->payment_method)) }}
            </td>

            <td class="text-right">
                ₱{{ number_format($payment->amount, 2) }}
            </td>

            <td>
                {{ $payment->reference_number ?? 'N/A' }}
            </td>

            <td>
                {{ ucfirst($payment->payment_status->value) }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="7" class="text-center">
                No payments found.
            </td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection