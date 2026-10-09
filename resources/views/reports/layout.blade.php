<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">

    <title>{{ $title ?? 'CDO Car Trading Report' }}</title>

    <style>
        @page {
            margin: 25px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #222;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 20px;
        }

        .header p {
            margin: 4px 0;
            font-size: 10px;
        }

        .summary {
            width: 100%;
            margin-bottom: 20px;
        }

        .summary td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }

        .summary-title {
            font-size: 9px;
            display: block;
        }

        .summary-value {
            font-size: 14px;
            font-weight: bold;
        }

        table.report {
            width: 100%;
            border-collapse: collapse;
        }

        table.report th {
            background: #eeeeee;
            border: 1px solid #bbb;
            padding: 6px;
            text-align: left;
        }

        table.report td {
            border: 1px solid #ccc;
            padding: 5px;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 8px;
            color: #777;
        }
    </style>
</head>

<body>

    <div class="header">
        <h1>{{ config('business.name') }}</h1>
        <p>{{ config('business.address') }} · {{ config('business.phone') }}</p>

        <p>
            {{ $title ?? 'Report' }}
        </p>

        @isset($from)
        <p>
            Period:
            {{ $from->format('M d, Y') }}
            -
            {{ $to->format('M d, Y') }}
        </p>
        @endisset
    </div>

    @yield('content')

    <div class="footer">
        Generated on {{ now()->format('M d, Y h:i A') }}
    </div>

</body>

</html>