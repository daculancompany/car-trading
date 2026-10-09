<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>
        Payment Receipt -
        {{ $vehicleRelease->release_number }}
    </title>

    <style>
        @page {
            size: A4;
            margin: 18mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #222;
            margin: 0;
            padding: 0;
        }

        .receipt {
            width: 100%;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .header {
            width: 100%;
            border-bottom: 2px solid #222;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .company {
            width: 65%;
            vertical-align: top;
        }

        .company-name {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .company-info {
            margin-top: 5px;
            font-size: 10px;
            line-height: 1.5;
        }

        .document-title {
            width: 35%;
            text-align: right;
            vertical-align: top;
        }

        .document-title h1 {
            margin: 0;
            font-size: 20px;
            font-weight: bold;
        }

        .receipt-number {
            margin-top: 8px;
            font-size: 11px;
        }

        /* =====================================================
           SECTION
        ===================================================== */

        .section-title {
            font-size: 13px;
            font-weight: bold;
            border-bottom: 1px solid #222;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }

        /* =====================================================
           INFORMATION
        ===================================================== */

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .info-table td {
            padding: 4px 0;
            vertical-align: top;
        }

        .label {
            width: 120px;
            font-weight: bold;
        }

        /* =====================================================
           VEHICLE
        ===================================================== */

        .vehicle-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }

        .vehicle-table th {
            background: #f2f2f2;
            border: 1px solid #bbb;
            padding: 7px;
            text-align: left;
            font-size: 10px;
        }

        .vehicle-table td {
            border: 1px solid #bbb;
            padding: 7px;
            font-size: 10px;
        }

        /* =====================================================
           PAYMENT
        ===================================================== */

        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5px;
        }

        .payment-table th {
            background: #f2f2f2;
            border: 1px solid #bbb;
            padding: 8px;
            text-align: left;
        }

        .payment-table td {
            border: 1px solid #bbb;
            padding: 8px;
        }

        .amount {
            text-align: right;
            white-space: nowrap;
        }

        .total-row td {
            font-weight: bold;
            font-size: 13px;
        }

        .balance-row td {
            font-weight: bold;
            font-size: 13px;
        }

        /* =====================================================
           STATUS
        ===================================================== */

        .status-box {
            margin-top: 18px;
            border: 1px solid #222;
            padding: 10px;
            text-align: center;
        }

        .status {
            font-size: 14px;
            font-weight: bold;
        }

        /* =====================================================
           SIGNATURES
        ===================================================== */

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 55px;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: bottom;
            padding: 0 25px;
        }

        .signature-line {
            border-top: 1px solid #222;
            padding-top: 6px;
            margin-top: 35px;
        }

        .signature-name {
            font-weight: bold;
        }

        .signature-label {
            font-size: 10px;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .footer {
            margin-top: 35px;
            border-top: 1px solid #aaa;
            padding-top: 8px;
            text-align: center;
            font-size: 9px;
            color: #666;
            line-height: 1.5;
        }

        .small {
            font-size: 9px;
        }
    </style>
</head>

<body>

    @php

    /*
    |--------------------------------------------------------------------------
    | MAIN RELATIONSHIPS
    |--------------------------------------------------------------------------
    */

    $sale =
    $vehicleRelease->sale;

    $reservation =
    $sale?->reservation;

    $customer =
    $reservation?->customer;

    $user =
    $customer?->user;

    $vehicle =
    $reservation?->vehicle;

    /*
    |--------------------------------------------------------------------------
    | VEHICLE SPECIFICATIONS
    |--------------------------------------------------------------------------
    |
    | plate_number, chassis_number and engine_number
    | are stored in vehicle_specs, not vehicles.
    |
    */

    $specs =
    $vehicle?->specs;

    /*
    |--------------------------------------------------------------------------
    | VEHICLE MASTER DATA
    |--------------------------------------------------------------------------
    */

    $brand =
    $vehicle?->brand?->brand ?? 'N/A';

    $model =
    $vehicle?->model?->model ?? 'N/A';

    $variant =
    $vehicle?->variant?->variant ?? 'N/A';

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER NAME
    |--------------------------------------------------------------------------
    */

    $customerName =
    $user?->name
    ?? trim(
    ($customer?->first_name ?? '') . ' ' .
    ($customer?->middle_name ?? '') . ' ' .
    ($customer?->last_name ?? '')
    );

    if (!$customerName) {
    $customerName = 'N/A';
    }

    /*
    |--------------------------------------------------------------------------
    | SALE AMOUNTS
    |--------------------------------------------------------------------------
    |
    | These use your current Sale fields.
    |
    */

    $sellingPrice =
    (float) (
    $sale?->selling_price ?? 0
    );

    $discountAmount =
    (float) (
    $sale?->discount_amount ?? 0
    );

    $netAmount =
    max(
    $sellingPrice - $discountAmount,
    0
    );

    /*
    |--------------------------------------------------------------------------
    | PAYMENT VALUES
    |--------------------------------------------------------------------------
    |
    | These fields are kept compatible with your
    | current Blade.
    |
    */

    $reservationFee =
    (float) (
    $sale?->reservation_fee ?? 0
    );

    $downPayment =
    (float) (
    $sale?->down_payment ?? 0
    );

    $totalPaid =
    (float) (
    $sale?->total_paid
    ?? $sale?->paid_amount
    ?? 0
    );

    /*
    |--------------------------------------------------------------------------
    | BALANCE
    |--------------------------------------------------------------------------
    */

    $balance =
    (float) (
    $sale?->balance
    ?? max(
    $netAmount - $totalPaid,
    0
    )
    );

    @endphp


    <div class="receipt">

        {{-- =========================================================
         HEADER
    ========================================================== --}}

        <div class="header">

            <table class="header-table">

                <tr>

                    <td class="company">

                        <div class="company-name">
                            CDO CAR TRADING
                        </div>

                        <div class="company-info">
                            {{ config('business.address') }}<br>
                            Contact: {{ config('business.phone') }}
                        </div>

                    </td>

                    <td class="document-title">

                        <h1>
                            PAYMENT RECEIPT
                        </h1>

                        <div class="receipt-number">

                            <strong>
                                Receipt No:
                            </strong>

                            <br>

                            {{ $vehicleRelease->release_number }}

                        </div>

                        <div class="receipt-number">

                            <strong>
                                Invoice No:
                            </strong>

                            <br>

                            {{ $sale?->invoice_number ?? 'N/A' }}

                        </div>

                        <div class="receipt-number">

                            <strong>
                                Date:
                            </strong>

                            <br>

                            {{ optional(
                            $vehicleRelease->release_date
                        )->format('F d, Y')
                        ?? now()->format('F d, Y') }}

                        </div>

                    </td>

                </tr>

            </table>

        </div>


        {{-- =========================================================
         CUSTOMER INFORMATION
    ========================================================== --}}

        <div class="section-title">
            CUSTOMER INFORMATION
        </div>

        <table class="info-table">

            <tr>

                <td class="label">
                    Customer Name:
                </td>

                <td>
                    {{ $customerName }}
                </td>

            </tr>

            <tr>

                <td class="label">
                    Address:
                </td>

                <td>
                    {{ $customer?->address ?? 'N/A' }}
                </td>

            </tr>

            <tr>

                <td class="label">
                    Contact No:
                </td>

                <td>
                    {{ $customer?->mobile_number ?? 'N/A' }}
                </td>

            </tr>

            <tr>

                <td class="label">
                    Email:
                </td>

                <td>
                    {{ $user?->email
                    ?? $customer?->email
                    ?? 'N/A'
                }}
                </td>

            </tr>

        </table>


        {{-- =========================================================
         VEHICLE INFORMATION
    ========================================================== --}}

        <div class="section-title">
            VEHICLE INFORMATION
        </div>

        <table class="vehicle-table">

            <thead>

                <tr>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Variant</th>
                    <th>Year</th>
                    <th>Color</th>
                </tr>

            </thead>

            <tbody>

                <tr>

                    <td>
                        {{ $brand }}
                    </td>

                    <td>
                        {{ $model }}
                    </td>

                    <td>
                        {{ $variant }}
                    </td>

                    <td>
                        {{ $vehicle?->year_model ?? 'N/A' }}
                    </td>

                    <td>
                        {{ $vehicle?->color ?? 'N/A' }}
                    </td>

                </tr>

            </tbody>

        </table>


        {{-- =========================================================
         VEHICLE IDENTIFICATION
    ========================================================== --}}

        <table class="vehicle-table">

            <thead>

                <tr>
                    <th>Stock No.</th>
                    <th>Plate No.</th>
                    <th>Chassis No.</th>
                    <th>Engine No.</th>
                </tr>

            </thead>

            <tbody>

                <tr>

                    <td>
                        {{ $vehicle?->stock_no ?? 'N/A' }}
                    </td>

                    <td>
                        {{ $specs?->plate_number ?? 'N/A' }}
                    </td>

                    <td>
                        {{ $specs?->chassis_number ?? 'N/A' }}
                    </td>

                    <td>
                        {{ $specs?->engine_number ?? 'N/A' }}
                    </td>

                </tr>

            </tbody>

        </table>


        {{-- =========================================================
         PAYMENT INFORMATION
    ========================================================== --}}

        <div class="section-title">
            PAYMENT INFORMATION
        </div>

        <table class="payment-table">

            <thead>

                <tr>

                    <th>
                        Description
                    </th>

                    <th class="amount">
                        Amount
                    </th>

                </tr>

            </thead>

            <tbody>

                {{-- SELLING PRICE --}}

                <tr>

                    <td>
                        Vehicle Selling Price
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                        $sellingPrice,
                        2
                    ) }}
                    </td>

                </tr>


                {{-- DISCOUNT --}}

                @if ($discountAmount > 0)

                <tr>

                    <td>
                        Discount
                    </td>

                    <td class="amount">
                        - ₱{{ number_format(
                            $discountAmount,
                            2
                        ) }}
                    </td>

                </tr>

                @endif


                {{-- NET AMOUNT --}}

                <tr class="total-row">

                    <td>
                        NET AMOUNT
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                        $netAmount,
                        2
                    ) }}
                    </td>

                </tr>


                {{-- RESERVATION FEE --}}

                @if ($reservationFee > 0)

                <tr>

                    <td>
                        Reservation Fee
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                            $reservationFee,
                            2
                        ) }}
                    </td>

                </tr>

                @endif


                {{-- DOWN PAYMENT --}}

                @if ($downPayment > 0)

                <tr>

                    <td>
                        Down Payment
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                            $downPayment,
                            2
                        ) }}
                    </td>

                </tr>

                @endif


                {{-- TOTAL PAID --}}

                <tr class="total-row">

                    <td>
                        TOTAL PAID
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                        $totalPaid,
                        2
                    ) }}
                    </td>

                </tr>


                {{-- BALANCE --}}

                <tr class="balance-row">

                    <td>
                        REMAINING BALANCE
                    </td>

                    <td class="amount">
                        ₱{{ number_format(
                        $balance,
                        2
                    ) }}
                    </td>

                </tr>

            </tbody>

        </table>


        {{-- =========================================================
         PAYMENT STATUS
    ========================================================== --}}

        <div class="status-box">

            @if ($balance <= 0)

                <div class="status">
                FULLY PAID
        </div>

        <div class="small">
            This vehicle has been fully paid.
        </div>

        @else

        <div class="status">
            PAYMENT BALANCE REMAINING
        </div>

        <div class="small">

            Remaining Balance:

            ₱{{ number_format(
                    $balance,
                    2
                ) }}

        </div>

        @endif

    </div>


    {{-- =========================================================
         SIGNATURES
    ========================================================== --}}

    <table class="signature-table">

        <tr>

            <td>

                <div class="signature-line">

                    <div class="signature-name">

                        {{ $customerName }}

                    </div>

                    <div class="signature-label">
                        Customer / Buyer
                    </div>

                </div>

            </td>


            <td>

                <div class="signature-line">

                    <div class="signature-name">
                        ______________________________
                    </div>

                    <div class="signature-label">
                        Authorized Representative
                    </div>

                </div>

            </td>

        </tr>

    </table>


    {{-- =========================================================
         FOOTER
    ========================================================== --}}

    <div class="footer">

        This document serves as a payment receipt for the
        vehicle transaction indicated above.

        <br>

        CDO CAR TRADING —
        Vehicle Release
        {{ $vehicleRelease->release_number }}

    </div>

    </div>

</body>

</html>