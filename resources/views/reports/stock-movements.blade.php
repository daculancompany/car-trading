@extends('reports.layout')

@php
$title = 'Stock Movement Report';

$typeLabels = [
'receiving' => 'In - Receiving',
'stock_in' => 'In - Returned',
'stock_out' => 'Out - Used',
'damage' => 'Out - Damage',
];
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Movements</span>
            <span class="summary-value">{{ $summary['total_movements'] }}</span>
        </td>

        <td>
            <span class="summary-title">Stock In</span>
            <span class="summary-value">
                {{ number_format($summary['in_quantity']) }} / ₱{{ number_format($summary['in_amount'], 2) }}
            </span>
        </td>

        <td>
            <span class="summary-title">Stock Out</span>
            <span class="summary-value">
                {{ number_format($summary['out_quantity']) }} / ₱{{ number_format($summary['out_amount'], 2) }}
            </span>
        </td>

        <td>
            <span class="summary-title">Damage</span>
            <span class="summary-value">
                {{ number_format($summary['damage_quantity']) }} / ₱{{ number_format($summary['damage_amount'], 2) }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Date</th>
            <th>Part</th>
            <th>Type</th>
            <th>Unit Cost</th>
            <th>Qty</th>
            <th>Amount</th>
            <th>Prev - New Qty</th>
            <th>Ref No.</th>
            <th>By</th>
            <th>Remarks</th>
        </tr>
    </thead>

    <tbody>
        @forelse($data as $movement)

        @php
        $incoming = in_array($movement->type, \App\Models\PartStockMovement::INCOMING_TYPES, true);
        @endphp

        <tr>
            <td>{{ $movement->moved_at?->format('M d, Y h:i A') }}</td>
            <td>{{ $movement->vehiclePart?->part_name ?? 'N/A' }}</td>
            <td>{{ $typeLabels[$movement->type] ?? $movement->type }}</td>
            <td class="text-right">₱{{ number_format($movement->unit_cost, 2) }}</td>
            <td class="text-center">{{ $incoming ? '+' : '-' }}{{ $movement->quantity }}</td>
            <td class="text-right">₱{{ number_format($movement->amount, 2) }}</td>
            <td class="text-center">{{ $movement->previous_quantity }} - {{ $movement->new_quantity }}</td>
            <td>{{ $movement->reference_no ?? '-' }}</td>
            <td>{{ $movement->creator?->username ?? '-' }}</td>
            <td>{{ $movement->remarks ?? '-' }}</td>
        </tr>

        @empty

        <tr>
            <td colspan="10" class="text-center">No stock movements found.</td>
        </tr>

        @endforelse
    </tbody>
</table>

@endsection
