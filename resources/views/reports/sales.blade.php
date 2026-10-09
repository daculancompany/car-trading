@extends('reports.layout')

@php
$title = 'Sales Report';
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
            <span class="summary-title">Completed</span>
            <span class="summary-value">
                {{ $summary['completed_sales'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Pending</span>
            <span class="summary-value">
                {{ $summary['pending_sales'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Cancelled</span>
            <span class="summary-value">
                {{ $summary['cancelled_sales'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Net Sales</span>
            <span class="summary-value">
                ₱{{ number_format($summary['net_sales'], 2) }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Invoice</th>
            <th>Date</th>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Price</th>
            <th>Discount</th>
            <th>Net</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @forelse($sales as $sale)

        @php
        $customer = $sale->reservation?->customer;

        $vehicle = $sale->reservation?->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';

        $net = $sale->selling_price - $sale->discount_amount;
        @endphp

        <tr>
            <td>{{ $sale->invoice_number }}</td>

            <td>
                {{ $sale->sale_date?->format('M d, Y') }}
            </td>

            <td>
                {{ $customer
                        ? $customer->first_name . ' ' . $customer->last_name
                        : 'N/A'
                    }}
            </td>

            <td>{{ $vehicleName }}</td>

            <td class="text-right">
                ₱{{ number_format($sale->selling_price, 2) }}
            </td>

            <td class="text-right">
                ₱{{ number_format($sale->discount_amount, 2) }}
            </td>

            <td class="text-right">
                ₱{{ number_format($net, 2) }}
            </td>

            <td>{{ ucfirst($sale->status->value) }}</td>
        </tr>

        @empty

        <tr>
            <td colspan="8" class="text-center">
                No sales found.
            </td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection