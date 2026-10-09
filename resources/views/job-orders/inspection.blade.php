@php
$colors = ['good' => '#38A169', 'attention' => '#ECC94B', 'urgent' => '#E53E3E'];
$sectionColors = ['blue' => '#2B6CB0', 'orange' => '#C05621', 'purple' => '#6B46C1', 'gray' => '#4A5568', 'teal' => '#2C7A7B', 'green' => '#2F855A'];
$summary = $inspection->summary;
$marks = collect($inspection->damage_marks ?? []);
$tires = $inspection->tires ?? [];
$brakes = $inspection->brakes ?? [];
$preChecks = $inspection->pre_checks ?? [];
$services = collect($inspection->recommended_services ?? []);
$damageTypes = collect($template['damage_types'])->pluck('label', 'key');
$fuel = ['empty' => 'Empty', 'quarter' => '1/4', 'half' => '1/2', 'three_quarter' => '3/4', 'full' => 'Full'][$inspection->fuel_level] ?? ($inspection->fuel_level ?: '—');
$results = ['confirmed' => 'Problem confirmed', 'partial' => 'Partially confirmed', 'not_found' => 'Problem not found'];
$sections = $template['sections'];
$half = (int) ceil(count($sections) / 2);
$flatten = fn ($list) => collect($list)->flatMap(fn ($section) => collect([['type' => 'section', 'title' => $section['title'], 'color' => $section['color']]])
    ->merge(collect($section['items'])->map(fn ($item) => ['type' => 'item', 'item' => $item, 'status' => $checks[$item]['status'] ?? null, 'note' => $checks[$item]['note'] ?? null])))->values();
$leftRows = $flatten(array_slice($sections, 0, $half));
$rightRows = $flatten(array_slice($sections, $half));
$rows = collect(range(0, max($leftRows->count(), $rightRows->count()) - 1))->map(fn ($i) => [$leftRows[$i] ?? null, $rightRows[$i] ?? null]);
$dot = function ($status, $value) use ($colors) {
    $fill = $status === $value ? $colors[$value] : '#FFFFFF';
    return '<span class="dot" style="background:' . $fill . ';border-color:' . $colors[$value] . '"></span>';
};
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Vehicle Inspection {{ $jobOrder->job_order_no }}</title>
    <style>
        @page { margin: 22px 26px; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 8.5px; color: #1A202C; }
        table { border-collapse: collapse; width: 100%; }
        .title-1 { font-size: 30px; font-weight: bold; color: #C53030; line-height: 1; letter-spacing: 1px; }
        .title-2 { font-size: 30px; font-weight: bold; color: #1A202C; line-height: 1; letter-spacing: 1px; }
        .brand { text-align: right; font-size: 9px; color: #4A5568; }
        .brand b { font-size: 13px; color: #1A202C; }
        .bar { background: #EDF2F7; padding: 6px 8px; margin-top: 8px; }
        .bar td { font-size: 9.5px; padding: 2px 4px; }
        .field { border-bottom: 1px solid #A0AEC0; font-weight: bold; padding: 1px 4px; }
        .legend td { font-size: 8px; padding: 4px 2px; }
        .dot { display: inline-block; width: 9px; height: 9px; border-radius: 5px; border: 1.4px solid #ccc; margin: 0 2px; vertical-align: middle; }
        .box { display: inline-block; width: 8px; height: 8px; border: 1px solid #4A5568; margin-right: 4px; vertical-align: middle; text-align: center; font-size: 7px; line-height: 8px; }
        .diagram { position: relative; background: #F7FAFC; border: 1px solid #E2E8F0; }
        .diagram img { display: block; }
        .view-label { position: absolute; top: 3px; left: 5px; font-size: 7.5px; font-weight: bold; color: #4A5568; }
        .head { color: #fff; font-weight: bold; text-align: center; font-size: 10px; padding: 3px; letter-spacing: 0.5px; }
        .section-title td { background: #E2E8F0; font-weight: bold; padding: 2px 5px; font-size: 8.5px; }
        .item td { border-bottom: 1px solid #EDF2F7; padding: 1.6px 5px; }
        .item .dots { width: 52px; text-align: right; white-space: nowrap; }
        .note { color: #718096; font-size: 7px; }
        .grid td { border: 1px solid #CBD5E0; padding: 3px 5px; text-align: center; }
        .grid th { background: #EDF2F7; border: 1px solid #CBD5E0; padding: 3px 5px; font-size: 8px; }
        .label { color: #718096; font-size: 7.5px; text-transform: uppercase; }
        .sign td { padding-top: 22px; }
        .sign .line { border-top: 1px solid #1A202C; text-align: center; padding-top: 3px; font-size: 8px; }
        .chip { display: inline-block; padding: 2px 6px; border-radius: 8px; color: #fff; font-weight: bold; font-size: 8px; margin-right: 3px; }
    </style>
</head>
<body>

<table>
    <tr>
        <td style="width: 60%">
            <div class="title-1">VEHICLE</div>
            <div class="title-2">INSPECTION</div>
            <div style="margin-top: 4px; color: #4A5568;">Multi-point inspection report</div>
        </td>
        <td class="brand">
            <img src="{{ public_path('logo.jpg') }}" style="height: 46px;"><br>
            <b>CDO CAR TRADING</b><br>
            Opol, Cagayan de Oro · 0919 911 9030 | 0926 064 1774
        </td>
    </tr>
</table>

<div class="bar">
    <table>
        <tr>
            <td style="width: 13%">Job Order No.:</td><td class="field" style="width: 20%">{{ $jobOrder->job_order_no }}</td>
            <td style="width: 10%">Odometer:</td><td class="field" style="width: 18%">{{ $inspection->odometer ? number_format($inspection->odometer) . ' km' : '—' }}</td>
            <td style="width: 9%">Fuel:</td><td class="field" style="width: 10%">{{ $fuel }}</td>
            <td style="width: 7%">Date:</td><td class="field">{{ optional($inspection->inspected_at)->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td>Customer:</td><td class="field">{{ $customerName }}</td>
            <td>Vehicle:</td><td class="field" colspan="3">{{ $vehicleName ?: '—' }}</td>
            <td>Plate:</td><td class="field">{{ $jobOrder->vehicle?->specs?->plate_number ?? $jobOrder->vehicle?->stock_no ?? '—' }}</td>
        </tr>
        <tr>
            <td>Inspected by:</td><td class="field">{{ $mechanicName }}</td>
            <td>Work type:</td><td class="field">{{ ucwords(str_replace('_', ' ', $jobOrder->work_type)) }}</td>
            <td>Result:</td><td class="field" colspan="3">{{ $results[$inspection->result] ?? $inspection->result }}</td>
        </tr>
    </table>
</div>

<table class="legend">
    <tr>
        @foreach ($template['pre_checks'] as $check)
            <td><span class="box">{!! !empty($preChecks[$check['key']]) ? '&#10003;' : '' !!}</span>{{ $check['label'] }}</td>
        @endforeach
    </tr>
    <tr>
        <td>{!! $dot('good', 'good') !!} Checked and OK</td>
        <td>{!! $dot('attention', 'attention') !!} May require further attention</td>
        <td>{!! $dot('urgent', 'urgent') !!} Requires immediate attention</td>
    </tr>
</table>

<table style="margin-top: 2px;">
    <tr>
        @foreach (['left' => 'LEFT', 'top' => 'TOP', 'right' => 'RIGHT'] as $view => $label)
            <td style="width: 33.3%; padding: 0 2px;">
                <div class="diagram">
                    <span class="view-label">{{ $label }}</span>
                    <img src="{{ $diagrams[$view] }}" style="width: 100%;">
                </div>
            </td>
        @endforeach
    </tr>
</table>
<table style="margin-top: 3px;">
    <tr>
        @foreach (['front' => 'FRONT', 'rear' => 'REAR'] as $view => $label)
            <td style="width: 16%; padding: 0 2px; vertical-align: top;">
                <div class="diagram">
                    <span class="view-label">{{ $label }}</span>
                    <img src="{{ $diagrams[$view] }}" style="width: 100%;">
                </div>
            </td>
        @endforeach
        <td style="vertical-align: top; padding-left: 6px;">
            <div style="font-weight: bold; margin-bottom: 3px;">Body damage ({{ $marks->count() }})</div>
            @forelse ($marks as $mark)
                <div style="margin-bottom: 2px;">
                    <b style="color: {{ $colors[$mark['severity']] ?? '#E53E3E' }};">#{{ $mark['no'] }}</b>
                    <b>{{ $damageTypes[$mark['type']] ?? ucfirst($mark['type']) }}</b> · {{ ucfirst($mark['view']) }}@if (!empty($mark['note'])) — {{ $mark['note'] }}@endif
                </div>
            @empty
                <div class="note">No body damage marked.</div>
            @endforelse
        </td>
    </tr>
</table>

<div class="head" style="background: #2B6CB0; margin-top: 6px;">COURTESY INSPECTION</div>
<table>
    @foreach ($rows as $row)
        <tr class="{{ ($row[0]['type'] ?? null) === 'section' || ($row[1]['type'] ?? null) === 'section' ? 'section-row' : 'item' }}">
            @foreach ($row as $cell)
                @if (!$cell)
                    <td style="width: 38%;"></td><td class="dots"></td>
                @elseif ($cell['type'] === 'section')
                    <td colspan="2" style="background: #E2E8F0; font-weight: bold; padding: 2px 5px; border-left: 3px solid {{ $sectionColors[$cell['color']] ?? '#4A5568' }};">{{ $cell['title'] }}</td>
                @else
                    @php $status = $cell['status']; @endphp
                    <td style="width: 38%; border-bottom: 1px solid #EDF2F7; padding: 1.6px 5px;">
                        {{ $cell['item'] }}@if ($status === 'na') <span class="note">(N/A)</span>@endif
                        @if (!empty($cell['note']))<br><span class="note">{{ $cell['note'] }}</span>@endif
                    </td>
                    <td class="dots" style="border-bottom: 1px solid #EDF2F7; {{ $loop->first ? 'border-right: 6px solid #fff;' : '' }}">{!! $dot($status, 'good') !!}{!! $dot($status, 'attention') !!}{!! $dot($status, 'urgent') !!}</td>
                @endif
            @endforeach
        </tr>
    @endforeach
</table>

<div class="head" style="background: #1A202C; margin-top: 6px;">TIRES & BRAKES @if (!empty($tires['size'])) · SIZE {{ $tires['size'] }} @endif</div>
<table class="grid">
    <tr>
        <th style="text-align: left;">Wheel</th>
        <th>Tire PSI</th>
        <th>Tread depth</th>
        <th>Tire condition</th>
        <th>Brake pad</th>
        <th>Brake condition</th>
    </tr>
    @foreach ($template['wheels'] as $wheel)
        @php $tire = $tires['wheels'][$wheel['key']] ?? []; $brake = $brakes[$wheel['key']] ?? []; $tireStatus = \App\Models\JobOrderInspection::normalizeStatus($tire['status'] ?? null); $brakeStatus = \App\Models\JobOrderInspection::normalizeStatus($brake['status'] ?? null); @endphp
        <tr>
            <td style="text-align: left; font-weight: bold;">{{ $wheel['label'] }}</td>
            <td>{{ $tire['psi'] ?? '—' }}</td>
            <td>{{ isset($tire['tread_mm']) ? $tire['tread_mm'] . ' mm' : '—' }}</td>
            <td>{!! $dot($tireStatus, 'good') !!}{!! $dot($tireStatus, 'attention') !!}{!! $dot($tireStatus, 'urgent') !!}</td>
            <td>{{ isset($brake['pad_mm']) ? $brake['pad_mm'] . ' mm' : '—' }}</td>
            <td>{!! $dot($brakeStatus, 'good') !!}{!! $dot($brakeStatus, 'attention') !!}{!! $dot($brakeStatus, 'urgent') !!}</td>
        </tr>
    @endforeach
    <tr>
        <td colspan="6" style="font-size: 7.5px; color: #4A5568;">
            {!! $dot('good', 'good') !!} 7 mm or more &nbsp;&nbsp; {!! $dot('attention', 'attention') !!} 3 mm to 6 mm &nbsp;&nbsp; {!! $dot('urgent', 'urgent') !!} 2 mm or less
            &nbsp;&nbsp;&nbsp; <span class="box">{!! !empty($tires['spare_ok']) ? '&#10003;' : '' !!}</span>Spare tire checked
        </td>
    </tr>
</table>

<div class="head" style="background: #D69E2E; color: #1A202C; margin-top: 6px;">RECOMMENDED SERVICES</div>
<table>
    @foreach (collect($template['recommended_services'])->chunk(3) as $row)
        <tr>
            @foreach ($row as $service)
                <td style="width: 33.3%; padding: 2px 4px;"><span class="box">{!! $services->contains($service['key']) ? '&#10003;' : '' !!}</span>{{ $service['label'] }}</td>
            @endforeach
        </tr>
    @endforeach
</table>

<table style="margin-top: 6px;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 6px;">
            <div class="label">Findings</div>
            <div>{{ $inspection->findings }}</div>
            @if ($inspection->recommendation)
                <div class="label" style="margin-top: 4px;">Recommendation</div>
                <div>{{ $inspection->recommendation }}</div>
            @endif
        </td>
        <td style="vertical-align: top;">
            <div class="label">Summary</div>
            <div style="margin: 2px 0 4px;">
                <span class="chip" style="background: #38A169;">{{ $summary['good'] }} OK</span>
                <span class="chip" style="background: #D69E2E;">{{ $summary['attention'] }} attention</span>
                <span class="chip" style="background: #E53E3E;">{{ $summary['urgent'] }} urgent</span>
                <span class="chip" style="background: #4A5568;">{{ $summary['damages'] }} damage</span>
            </div>
            @if ($inspection->notes)
                <div class="label">Notes</div>
                <div>{{ $inspection->notes }}</div>
            @endif
        </td>
    </tr>
</table>

<table style="margin-top: 8px;" class="bar">
    <tr>
        <td style="width: 16%;">Next service date:</td><td class="field" style="width: 18%;">{{ optional($inspection->next_service_date)->format('M d, Y') ?? '—' }}</td>
        <td style="width: 14%;">Service required:</td><td class="field" style="width: 28%;">{{ $inspection->service_required ?: '—' }}</td>
        <td style="width: 6%;">₱</td><td class="field">{{ $inspection->estimated_cost !== null ? number_format((float) $inspection->estimated_cost, 2) : '—' }}</td>
    </tr>
</table>

<table class="sign">
    <tr>
        <td style="width: 40%;"><div class="line">Inspected by: {{ $mechanicName }}</div></td>
        <td style="width: 20%;"></td>
        <td style="width: 40%;"><div class="line">Customer signature</div></td>
    </tr>
</table>

</body>
</html>
