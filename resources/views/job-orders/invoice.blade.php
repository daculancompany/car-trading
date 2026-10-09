@php
$parts = $jobOrder->partsUsed;
$payments = $jobOrder->payments;
$methods = ['cash' => 'Cash', 'gcash' => 'GCash', 'bank_transfer' => 'Bank transfer', 'card' => 'Card', 'other' => 'Other'];
$status = ['paid' => ['PAID', '#2F855A'], 'partial' => ['PARTIALLY PAID', '#C05621'], 'unpaid' => ['UNPAID', '#C53030']][$jobOrder->payment_status] ?? ['—', '#4A5568'];
$money = fn ($value) => '₱' . number_format((float) $value, 2);
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Service Invoice {{ $jobOrder->invoice_no }}</title>
    <style>
        @page { margin: 28px 32px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 9.5px; color: #1A202C; }
        table { border-collapse: collapse; width: 100%; }
        .title { font-size: 24px; font-weight: bold; color: #C53030; letter-spacing: 1px; }
        .muted { color: #718096; }
        .box { background: #F7FAFC; border: 1px solid #E2E8F0; padding: 8px 10px; }
        .label { color: #718096; font-size: 7.5px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-weight: bold; font-size: 10px; }
        .lines th { background: #1A202C; color: #fff; padding: 6px; text-align: left; font-size: 8.5px; }
        .lines td { padding: 6px; border-bottom: 1px solid #E2E8F0; }
        .right { text-align: right; }
        .totals td { padding: 4px 6px; }
        .grand td { font-size: 13px; font-weight: bold; border-top: 2px solid #1A202C; padding-top: 6px; }
        .stamp { display: inline-block; border: 2px solid; padding: 4px 10px; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
        .sign td { padding-top: 34px; }
        .line { border-top: 1px solid #1A202C; text-align: center; padding-top: 3px; font-size: 8.5px; }
    </style>
</head>
<body>
<table>
    <tr>
        <td style="width: 55%;">
            <img src="{{ public_path('logo.jpg') }}" style="height: 48px;"><br>
            <b style="font-size: 13px;">CDO CAR TRADING</b><br>
            <span class="muted">Opol, Cagayan de Oro · 0919 911 9030 | 0926 064 1774</span>
        </td>
        <td class="right" style="vertical-align: top;">
            <div class="title">SERVICE INVOICE</div>
            <div style="font-size: 12px; font-weight: bold; margin-top: 2px;">{{ $jobOrder->invoice_no }}</div>
            <div class="muted">Date: {{ optional($jobOrder->invoiced_at ?? $jobOrder->finish_job)->format('M d, Y') }}</div>
            <div style="margin-top: 6px;"><span class="stamp" style="color: {{ $status[1] }}; border-color: {{ $status[1] }};">{{ $status[0] }}</span></div>
        </td>
    </tr>
</table>

<table style="margin-top: 14px;">
    <tr>
        <td style="width: 50%; padding-right: 6px; vertical-align: top;">
            <div class="box">
                <div class="label">Billed to</div>
                <div class="value">{{ $customer ? trim($customer->first_name . ' ' . $customer->last_name) : 'Shop job' }}</div>
                @if ($customer)
                    <div>{{ $customer->mobile_number }}</div>
                    <div class="muted">{{ $customer->address }}</div>
                @endif
            </div>
        </td>
        <td style="vertical-align: top;">
            <div class="box">
                <div class="label">Vehicle</div>
                <div class="value">{{ $vehicleName ?: '—' }}</div>
                <div>Plate: {{ $jobOrder->vehicle?->specs?->plate_number ?? '—' }} · Stock: {{ $jobOrder->vehicle?->stock_no ?? '—' }}</div>
                <div class="muted">Job order {{ $jobOrder->job_order_no }} · {{ ucwords(str_replace('_', ' ', $jobOrder->work_type)) }} · Mechanic: {{ $mechanicName }}</div>
            </div>
        </td>
    </tr>
</table>

<table class="lines" style="margin-top: 14px;">
    <tr>
        <th style="width: 50%;">Description</th>
        <th class="right">Qty</th>
        <th class="right">Unit price</th>
        <th class="right">Amount</th>
    </tr>
    <tr>
        <td>
            <b>Labor · {{ ucwords(str_replace('_', ' ', $jobOrder->work_type)) }}</b><br>
            <span class="muted">{{ \Illuminate\Support\Str::limit($jobOrder->description, 160) }}</span>
        </td>
        <td class="right">1</td>
        <td class="right">{{ $money($jobOrder->labor_cost) }}</td>
        <td class="right">{{ $money($jobOrder->labor_cost) }}</td>
    </tr>
    @foreach ($parts as $used)
        <tr>
            <td>{{ $used->vehiclePart?->part_name ?? 'Part' }}</td>
            <td class="right">{{ $used->quantity }}</td>
            <td class="right">{{ $money($used->vehiclePart?->unit_price ?? 0) }}</td>
            <td class="right">{{ $money(($used->vehiclePart?->unit_price ?? 0) * $used->quantity) }}</td>
        </tr>
    @endforeach
</table>

<table style="margin-top: 10px;">
    <tr>
        <td style="width: 55%; vertical-align: top; padding-right: 10px;">
            @if ($jobOrder->warranty_days)
                <div class="box" style="margin-bottom: 8px;">
                    <div class="label">Warranty</div>
                    <div class="value">{{ $jobOrder->warranty_days }} days{{ $jobOrder->warranty_km ? ' / ' . number_format($jobOrder->warranty_km) . ' km' : '' }}</div>
                    <div class="muted">Valid until {{ \Carbon\Carbon::parse($jobOrder->warranty_until)->format('M d, Y') }}. Covers the work and parts listed above.</div>
                </div>
            @endif
            @if ($payments->isNotEmpty())
                <div class="label" style="margin-bottom: 3px;">Payments</div>
                <table>
                    @foreach ($payments as $payment)
                        <tr>
                            <td style="padding: 2px 0;">{{ $payment->paid_at->format('M d, Y') }} · {{ $methods[$payment->method] ?? $payment->method }}@if ($payment->reference_no) · Ref {{ $payment->reference_no }}@endif</td>
                            <td class="right" style="padding: 2px 0;">{{ $money($payment->amount) }}</td>
                        </tr>
                    @endforeach
                </table>
            @endif
        </td>
        <td style="vertical-align: top;">
            <table class="totals">
                <tr><td class="muted">Labor</td><td class="right">{{ $money($jobOrder->labor_cost) }}</td></tr>
                <tr><td class="muted">Parts</td><td class="right">{{ $money($jobOrder->parts_total) }}</td></tr>
                <tr class="grand"><td>Total</td><td class="right">{{ $money($jobOrder->total_cost) }}</td></tr>
                <tr><td class="muted">Paid</td><td class="right">{{ $money($jobOrder->amount_paid) }}</td></tr>
                <tr><td><b>Balance</b></td><td class="right"><b style="color: {{ $jobOrder->balance > 0 ? '#C53030' : '#2F855A' }};">{{ $money($jobOrder->balance) }}</b></td></tr>
            </table>
        </td>
    </tr>
</table>

<table class="sign">
    <tr>
        <td style="width: 40%;"><div class="line">Received by (CDO Car Trading)</div></td>
        <td style="width: 20%;"></td>
        <td style="width: 40%;"><div class="line">Customer signature</div></td>
    </tr>
</table>

<div class="muted" style="margin-top: 18px; text-align: center; font-size: 8px;">Thank you for trusting CDO Car Trading. This is a system-generated service invoice.</div>
</body>
</html>
