@extends('reports.layout')

@php
$title = 'Vehicle Expense Report';
@endphp

@section('content')

<table class="summary">
    <tr>
        <td>
            <span class="summary-title">Expense Records</span>
            <span class="summary-value">
                {{ $summary['total_expenses'] }}
            </span>
        </td>

        <td>
            <span class="summary-title">Total Expenses</span>
            <span class="summary-value">
                ₱{{ number_format($summary['total_amount'], 2) }}
            </span>
        </td>
    </tr>
</table>

<table class="report">
    <thead>
        <tr>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Expense Type</th>
            <th>Amount</th>
            <th>Remarks</th>
        </tr>
    </thead>

    <tbody>

        @forelse($expenses as $expense)

        @php
        $vehicle = $expense->vehicle;

        $vehicleName = $vehicle
        ? ($vehicle->brand?->brand ?? '') . ' ' .
        ($vehicle->model?->model ?? '') . ' ' .
        ($vehicle->variant?->variant ?? '')
        : 'N/A';
        @endphp

        <tr>
            <td>
                {{ $expense->created_at?->format('M d, Y') }}
            </td>

            <td>{{ $vehicleName }}</td>

            <td>
                {{ $expense->expenseType?->expense_name ?? 'N/A' }}
            </td>

            <td class="text-right">
                ₱{{ number_format($expense->amount, 2) }}
            </td>

            <td>
                {{ $expense->remarks }}
            </td>
        </tr>

        @empty

        <tr>
            <td colspan="5" class="text-center">
                No expenses found.
            </td>
        </tr>

        @endforelse

    </tbody>
</table>

@endsection