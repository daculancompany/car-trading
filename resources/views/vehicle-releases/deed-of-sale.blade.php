<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <title>
        Deed of Absolute Sale -
        {{ $vehicleRelease->release_number }}
    </title>

    <style>
        @page {
            size: A4;
            margin: 22mm 20mm 22mm 20mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Serif, serif;
            font-size: 12px;
            line-height: 1.7;
            color: #111;
            margin: 0;
            padding: 0;
        }

        .document {
            width: 100%;
        }

        /* =====================================================
           HEADER
        ====================================================== */

        .header {
            text-align: center;
            margin-bottom: 25px;
        }

        .company-name {
            font-family: DejaVu Sans, sans-serif;
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .company-info {
            font-family: DejaVu Sans, sans-serif;
            font-size: 9px;
            line-height: 1.4;
            margin-top: 3px;
        }

        .title {
            margin-top: 28px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .subtitle {
            text-align: center;
            font-size: 10px;
            margin-top: 5px;
        }

        /* =====================================================
           BODY
        ====================================================== */

        .paragraph {
            text-align: justify;
            margin-top: 14px;
            margin-bottom: 14px;
        }

        .indent {
            text-indent: 35px;
        }

        .bold {
            font-weight: bold;
        }

        .underline {
            text-decoration: underline;
        }

        /* =====================================================
           PARTY INFORMATION
        ====================================================== */

        .party-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0 18px;
        }

        .party-table td {
            padding: 3px 0;
            vertical-align: top;
        }

        .party-label {
            width: 145px;
            font-weight: bold;
        }

        /* =====================================================
           VEHICLE DETAILS
        ====================================================== */

        .vehicle-box {
            border: 1px solid #222;
            margin: 15px 0 20px;
            padding: 12px;
        }

        .vehicle-title {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .vehicle-table {
            width: 100%;
            border-collapse: collapse;
        }

        .vehicle-table td {
            padding: 4px 5px;
            vertical-align: top;
        }

        .vehicle-table .label {
            width: 125px;
            font-weight: bold;
        }

        /* =====================================================
           PRICE
        ====================================================== */

        .price-box {
            border: 1px solid #222;
            padding: 12px;
            margin: 18px 0;
        }

        .price-table {
            width: 100%;
            border-collapse: collapse;
        }

        .price-table td {
            padding: 4px 0;
        }

        .price-label {
            font-weight: bold;
        }

        .price-value {
            text-align: right;
            font-weight: bold;
            font-size: 13px;
        }

        /* =====================================================
           SIGNATURES
        ====================================================== */

        .signature-section {
            margin-top: 50px;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-table td {
            width: 50%;
            text-align: center;
            vertical-align: bottom;
            padding: 0 20px;
        }

        .signature-space {
            height: 55px;
        }

        .signature-line {
            border-top: 1px solid #111;
            padding-top: 5px;
        }

        .signature-name {
            font-weight: bold;
        }

        .signature-role {
            font-size: 10px;
        }

        /* =====================================================
           WITNESSES
        ====================================================== */

        .witness-section {
            margin-top: 40px;
        }

        .witness-title {
            text-align: center;
            font-weight: bold;
            margin-bottom: 35px;
        }

        /* =====================================================
           ACKNOWLEDGMENT
        ====================================================== */

        .acknowledgment {
            page-break-before: always;
        }

        .ack-title {
            text-align: center;
            font-family: DejaVu Sans, sans-serif;
            font-size: 15px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 25px;
        }

        .acknowledgment p {
            text-align: justify;
            margin-bottom: 14px;
        }

        .notary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .notary-table td {
            padding: 5px;
            vertical-align: top;
        }

        .notary-label {
            width: 130px;
            font-weight: bold;
        }

        /* =====================================================
           FOOTER
        ====================================================== */

        .footer {
            margin-top: 35px;
            padding-top: 8px;
            border-top: 1px solid #aaa;
            text-align: center;
            font-family: DejaVu Sans, sans-serif;
            font-size: 8px;
            color: #666;
        }
    </style>
</head>

<body>

    @php

    /*
    |--------------------------------------------------------------------------
    | RELATED RECORDS
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
    | plate_number
    | engine_number
    | chassis_number
    | mileage
    | fuel_type
    | transmission
    |
    | are stored in vehicle_specs.
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
    $vehicle?->brand?->brand
    ?? 'N/A';

    $model =
    $vehicle?->model?->model
    ?? 'N/A';

    $variant =
    $vehicle?->variant?->variant
    ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | BUYER NAME
    |--------------------------------------------------------------------------
    */

    $buyerName =
    $user?->name
    ??
    trim(
    ($customer?->first_name ?? '') . ' ' .
    ($customer?->middle_name ?? '') . ' ' .
    ($customer?->last_name ?? '')
    );

    if (empty(trim($buyerName))) {
    $buyerName = 'N/A';
    }


    /*
    |--------------------------------------------------------------------------
    | BUYER INFORMATION
    |--------------------------------------------------------------------------
    */

    $buyerAddress =
    $customer?->address
    ?? 'N/A';

    $buyerContact =
    $customer?->mobile_number
    ?? 'N/A';


    /*
    |--------------------------------------------------------------------------
    | SELLER INFORMATION
    |--------------------------------------------------------------------------
    */

    $sellerName =
    'CDO CAR TRADING';

    $sellerAddress =
    config('business.address');


    /*
    |--------------------------------------------------------------------------
    | SELLING PRICE
    |--------------------------------------------------------------------------
    */

    $sellingPrice =
    (float) (
    $sale?->selling_price
    ?? $vehicle?->selling_price
    ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | DISCOUNT
    |--------------------------------------------------------------------------
    */

    $discount =
    (float) (
    $sale?->discount_amount
    ?? 0
    );


    /*
    |--------------------------------------------------------------------------
    | NET PURCHASE PRICE
    |--------------------------------------------------------------------------
    */

    $netPurchasePrice =
    max(
    $sellingPrice - $discount,
    0
    );


    /*
    |--------------------------------------------------------------------------
    | SALE DATE
    |--------------------------------------------------------------------------
    */

    $saleDate =
    $sale?->sale_date
    ?? $sale?->created_at
    ?? $vehicleRelease->created_at
    ?? now();

    @endphp


    <div class="document">

        {{-- =====================================================
         HEADER
    ====================================================== --}}

        <div class="header">

            <div class="company-name">
                CDO CAR TRADING
            </div>

            <div class="company-info">
                {{ config('business.address') }}
            </div>

            <div class="title">
                Deed of Absolute Sale
            </div>

            <div class="subtitle">
                Vehicle Sale and Transfer of Ownership
            </div>

        </div>


        {{-- =====================================================
         INTRODUCTION
    ====================================================== --}}

        <p class="paragraph indent">

            KNOW ALL MEN BY THESE PRESENTS:

        </p>


        <p class="paragraph indent">

            That

            <span class="bold underline">
                {{ $sellerName }}
            </span>,

            with business address at

            <span class="bold underline">
                {{ $sellerAddress }}
            </span>,

            hereinafter referred to as the

            <span class="bold">
                "SELLER"
            </span>,

            and

            <span class="bold underline">
                {{ $buyerName }}
            </span>,

            of legal age, with address at

            <span class="bold underline">
                {{ $buyerAddress }}
            </span>,

            hereinafter referred to as the

            <span class="bold">
                "BUYER"
            </span>,

            have agreed to the sale and transfer of the motor vehicle
            described below.

        </p>


        {{-- =====================================================
         VEHICLE INFORMATION
    ====================================================== --}}

        <div class="vehicle-box">

            <div class="vehicle-title">
                Motor Vehicle Description
            </div>

            <table class="vehicle-table">

                <tr>

                    <td class="label">
                        Brand:
                    </td>

                    <td>
                        {{ $brand }}
                    </td>

                    <td class="label">
                        Model:
                    </td>

                    <td>
                        {{ $model }}
                    </td>

                </tr>


                <tr>

                    <td class="label">
                        Variant:
                    </td>

                    <td>
                        {{ $variant }}
                    </td>

                    <td class="label">
                        Year Model:
                    </td>

                    <td>
                        {{ $vehicle?->year_model ?? 'N/A' }}
                    </td>

                </tr>


                <tr>

                    <td class="label">
                        Color:
                    </td>

                    <td>
                        {{ $vehicle?->color ?? 'N/A' }}
                    </td>

                    <td class="label">
                        Plate No.:
                    </td>

                    <td>
                        {{ $specs?->plate_number ?? 'N/A' }}
                    </td>

                </tr>


                <tr>

                    <td class="label">
                        Engine No.:
                    </td>

                    <td>
                        {{ $specs?->engine_number ?? 'N/A' }}
                    </td>

                    <td class="label">
                        Chassis No.:
                    </td>

                    <td>
                        {{ $specs?->chassis_number ?? 'N/A' }}
                    </td>

                </tr>


                <tr>

                    <td class="label">
                        Stock No.:
                    </td>

                    <td>
                        {{ $vehicle?->stock_no ?? 'N/A' }}
                    </td>

                    <td class="label">
                        Transmission:
                    </td>

                    <td>
                        {{ $specs?->transmission ?? 'N/A' }}
                    </td>

                </tr>


                <tr>

                    <td class="label">
                        Fuel Type:
                    </td>

                    <td>
                        {{ $specs?->fuel_type ?? 'N/A' }}
                    </td>

                    <td class="label">
                        Mileage:
                    </td>

                    <td>
                        {{ $specs?->mileage ?? 'N/A' }}
                    </td>

                </tr>

            </table>

        </div>


        {{-- =====================================================
         SALE AGREEMENT
    ====================================================== --}}

        <p class="paragraph indent">

            That the SELLER hereby sells, transfers, and conveys
            unto the BUYER the above-described motor vehicle,
            together with its accessories and existing documents,
            subject to the terms and conditions agreed upon by both
            parties.

        </p>


        <p class="paragraph indent">

            The BUYER acknowledges having inspected the motor vehicle
            and accepts the same in its present condition, subject to
            the representations and warranties expressly agreed upon
            by the parties.

        </p>


        {{-- =====================================================
         PURCHASE PRICE
    ====================================================== --}}

        <div class="price-box">

            <table class="price-table">

                <tr>

                    <td class="price-label">
                        Vehicle Selling Price:
                    </td>

                    <td class="price-value">
                        ₱{{ number_format(
                        $sellingPrice,
                        2
                    ) }}
                    </td>

                </tr>


                @if ($discount > 0)

                <tr>

                    <td class="price-label">
                        Less: Discount:
                    </td>

                    <td class="price-value">
                        - ₱{{ number_format(
                            $discount,
                            2
                        ) }}
                    </td>

                </tr>

                @endif


                <tr>

                    <td class="price-label">
                        Net Purchase Price:
                    </td>

                    <td class="price-value">
                        ₱{{ number_format(
                        $netPurchasePrice,
                        2
                    ) }}
                    </td>

                </tr>

            </table>

        </div>


        <p class="paragraph indent">

            The BUYER confirms that the purchase price stated above
            has been paid or shall be paid according to the payment
            arrangement recorded in the corresponding sales and
            payment records of the SELLER.

        </p>


        {{-- =====================================================
         TRANSFER
    ====================================================== --}}

        <p class="paragraph indent">

            Upon completion of the agreed payment obligations and
            release requirements, the SELLER shall deliver the
            motor vehicle and the applicable vehicle documents to
            the BUYER, subject to the applicable laws, regulations,
            and registration requirements.

        </p>


        {{-- =====================================================
         DOCUMENTS
    ====================================================== --}}

        <p class="paragraph indent">

            The vehicle documents associated with the motor vehicle,
            including the Certificate of Registration (CR) and
            Official Receipt (OR), shall be delivered to the BUYER
            in accordance with the applicable release and transfer
            procedures of the SELLER.

        </p>


        {{-- =====================================================
         AGREEMENT
    ====================================================== --}}

        <p class="paragraph indent">

            IN WITNESS WHEREOF, the parties have hereunto set their
            hands this

            <span class="bold underline">
                {{ $saleDate->format('F d, Y') }}
            </span>

            at Cagayan de Oro City, Philippines.

        </p>


        {{-- =====================================================
         SIGNATURES
    ====================================================== --}}

        <div class="signature-section">

            <table class="signature-table">

                <tr>

                    <td>

                        <div class="signature-space"></div>

                        <div class="signature-line">

                            <div class="signature-name">
                                {{ $sellerName }}
                            </div>

                            <div class="signature-role">
                                SELLER / AUTHORIZED REPRESENTATIVE
                            </div>

                        </div>

                    </td>


                    <td>

                        <div class="signature-space"></div>

                        <div class="signature-line">

                            <div class="signature-name">
                                {{ $buyerName }}
                            </div>

                            <div class="signature-role">
                                BUYER
                            </div>

                        </div>

                    </td>

                </tr>

            </table>

        </div>


        {{-- =====================================================
         WITNESSES
    ====================================================== --}}

        <div class="witness-section">

            <div class="witness-title">
                SIGNED IN THE PRESENCE OF:
            </div>

            <table class="signature-table">

                <tr>

                    <td>

                        <div class="signature-space"></div>

                        <div class="signature-line">

                            <div class="signature-name">
                                ______________________________
                            </div>

                            <div class="signature-role">
                                WITNESS
                            </div>

                        </div>

                    </td>


                    <td>

                        <div class="signature-space"></div>

                        <div class="signature-line">

                            <div class="signature-name">
                                ______________________________
                            </div>

                            <div class="signature-role">
                                WITNESS
                            </div>

                        </div>

                    </td>

                </tr>

            </table>

        </div>


        {{-- =====================================================
         ACKNOWLEDGMENT
    ====================================================== --}}

        <div class="acknowledgment">

            <div class="ack-title">
                ACKNOWLEDGMENT
            </div>


            <p>

                REPUBLIC OF THE PHILIPPINES )

                <br>

                CITY / MUNICIPALITY OF
                ____________________________ )

            </p>


            <p class="paragraph">

                BEFORE ME, a Notary Public for and in the
                ______________________________, personally appeared
                the following persons:

            </p>


            <table class="notary-table">

                <tr>

                    <td class="notary-label">
                        SELLER:
                    </td>

                    <td>
                        {{ $sellerName }}
                    </td>

                </tr>


                <tr>

                    <td class="notary-label">
                        BUYER:
                    </td>

                    <td>
                        {{ $buyerName }}
                    </td>

                </tr>

            </table>


            <p class="paragraph">

                who are known to me and to me known to be the same
                persons who executed this instrument and they
                acknowledged to me that the same is their free and
                voluntary act and deed.

            </p>


            <p class="paragraph">

                This instrument consists of pages, including this
                page on which this acknowledgment is written, and
                has been signed by the parties and their witnesses
                on each and every page thereof.

            </p>


            <p class="paragraph">

                WITNESS MY HAND AND SEAL this
                ______ day of __________________, 20____ at
                ______________________________, Philippines.

            </p>


            {{-- =====================================================
             NOTARY
        ====================================================== --}}

            <div class="signature-section">

                <table class="signature-table">

                    <tr>

                        <td></td>

                        <td>

                            <div class="signature-space"></div>

                            <div class="signature-line">

                                <div class="signature-name">
                                    NOTARY PUBLIC
                                </div>

                                <div class="signature-role">
                                    Commission No. ______________
                                </div>

                            </div>

                        </td>

                    </tr>

                </table>

            </div>


            <table class="notary-table">

                <tr>

                    <td class="notary-label">
                        Doc. No.
                    </td>

                    <td>
                        ______________________
                    </td>

                </tr>

                <tr>

                    <td class="notary-label">
                        Page No.
                    </td>

                    <td>
                        ______________________
                    </td>

                </tr>

                <tr>

                    <td class="notary-label">
                        Book No.
                    </td>

                    <td>
                        ______________________
                    </td>

                </tr>

                <tr>

                    <td class="notary-label">
                        Series of
                    </td>

                    <td>
                        ______________________
                    </td>

                </tr>

            </table>

        </div>


        {{-- =====================================================
         FOOTER
    ====================================================== --}}

        <div class="footer">

            Vehicle Release No.:
            {{ $vehicleRelease->release_number }}

            &nbsp; | &nbsp;

            CDO CAR TRADING

        </div>

    </div>

</body>

</html>