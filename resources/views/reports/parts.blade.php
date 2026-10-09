@extends('reports.layout')

@php
$title = 'Parts Inventory Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Parts</span>
            <span class="summary-value">{{ $summary['total_parts'] }}</span>
        </td>

        <td>
            <span class="summary-title">Total Quantity</span>
            <span class="summary-value">{{ number_format($summary['total_quantity']) }}</span>
        </td>

        <td>
            <span class="summary-title">Stock Value</span>
            <span class="summary-value">₱{{ number_format($summary['stock_value'], 2) }}</span>
        </td>

        <td>
            <span class="summary-title">Low Stock</span>
            <span class="summary-value">{{ $summary['low_stock'] }}</span>
        </td>

        <td>
            <span class="summary-title">Out of Stock</span>
            <span class="summary-value">{{ $summary['out_of_stock'] }}</span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Part</th>
            <th>Category</th>
            <th>Qty on Hand</th>
            <th>Unit Price</th>
            <th>Stock Value</th>
            <th>Status</th>
        </tr>
    </thead>

    <tbody>
        @forelse($data as $part)

        <tr>
            <td>{{ $part->part_name }}</td>
            <td>{{ $part->category }}</td>
            <td class="text-center">{{ $part->quantity }}</td>
            <td class="text-right">₱{{ number_format($part->unit_price, 2) }}</td>
            <td class="text-right">₱{{ number_format($part->stock_value, 2) }}</td>
            <td>
                {{ $part->quantity <= 0 ? 'Out of Stock' : ($part->quantity <= 5 ? 'Low Stock' : 'In Stock') }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="6" class="text-center">No parts found.</td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection
