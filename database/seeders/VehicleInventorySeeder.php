<?php

namespace Database\Seeders;

use App\Models\ExpenseType;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use App\Models\VehicleExpense;
use App\Models\VehicleImage;
use App\Models\VehicleSpec;
use App\Models\VehicleVariant;
use Database\Seeders\Support\PlaceholderImage;
use Illuminate\Database\Seeder;

/**
 * Typical second-hand stock for a CDO lot. Status is set to "available" here;
 * TransactionSeeder moves the units that get reserved or sold.
 */
class VehicleInventorySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('username', 'admin')->firstOrFail();
        $expenseTypes = ExpenseType::pluck('id', 'expense_name');

        // brand, model, variant, year, color, price, reservation, plate, km, fuel, transmission, buy cost, description, features
        $stock = [
            ['Toyota', 'Vios', 'E', 2019, 'Silver Metallic', 545000, 10000, 'NBC 4127', 48210, 'gasoline', 'manual', 455000,
                'First owner, Cagayan de Oro-registered. Casa-maintained until 40,000 km, records available. Cold aircon, no flood history.',
                'Dual airbags, ABS, touchscreen stereo, rear camera, new tires (2025)'],
            ['Mitsubishi', 'Montero Sport', 'GLX', 2020, 'White Pearl', 1180000, 20000, 'KAA 8812', 62340, 'diesel', 'manual', 1015000,
                '2.4 diesel, manual. Used for family trips to Bukidnon, never used for hauling. Complete papers, LTO-registered until 2027.',
                '7-seater, 2-DIN head unit, roof rails, tow hitch, rear parking sensors'],
            ['Toyota', 'Innova', '2.0 E', 2018, 'Silver Metallic', 780000, 15000, 'NCE 2051', 71500, 'gasoline', 'manual', 665000,
                'Well-kept family van. Second-row captain seats, aircon blows cold front and rear. Minor scratch on rear bumper.',
                '8-seater, rear aircon, keyless entry, alloy wheels'],
            ['Honda', 'City', 'V', 2021, 'Lunar Silver', 735000, 15000, 'NDF 6630', 29870, 'gasoline', 'automatic', 640000,
                'Low mileage, lady-owned. CVT shifts smooth, still under extended warranty with Honda Cars CDO.',
                'Push start, cruise control, Apple CarPlay/Android Auto, LED headlights'],
            ['Mitsubishi', 'Mirage G4', 'GLX', 2019, 'Red Metallic', 465000, 10000, 'NBQ 1934', 55400, 'gasoline', 'manual', 390000,
                'Fuel-efficient city sedan, ideal for Grab or daily commute. Fresh change oil, new battery.',
                'Dual airbags, ABS, Bluetooth stereo, power windows'],
            ['Nissan', 'Navara', 'EL', 2020, 'Slate Gray', 895000, 20000, 'KAB 3307', 68900, 'diesel', 'manual', 770000,
                'Single owner, used for farm supply runs. Bedliner installed, underchassis recently washed and rust-proofed.',
                'Bedliner, tonneau cover, 2-DIN stereo, towing hitch'],
            ['Toyota', 'Hilux', 'E', 2017, 'Super White', 820000, 20000, 'KVC 5520', 98500, 'diesel', 'manual', 700000,
                'Workhorse pickup. Brake pads replaced during inspection, engine strong, no smoke.',
                'Bedliner, roll bar, 4x2, steel wheels'],
            ['Suzuki', 'Ertiga', 'GLX', 2022, 'Midnight Blue', 798000, 15000, 'NFH 2219', 18200, 'gasoline', 'automatic', 700000,
                'Almost new. 7-seater, very economical. Original paint all around.',
                'Touchscreen with rear camera, auto climate, 7 seats, alloy wheels'],
            ['Toyota', 'Fortuner', '2.4 G', 2018, 'Attitude Black', 1250000, 25000, 'KAD 7741', 84300, 'diesel', 'automatic', 1095000,
                'Clean 2.4 G AT. New timing belt and tires. Tinted all around, dashcam included.',
                'Dashcam, power tailgate, LED fogs, 7-seater'],
            ['Mitsubishi', 'Xpander', 'GLS', 2020, 'Quartz White', 865000, 15000, 'NDA 9902', 45100, 'gasoline', 'automatic', 760000,
                'Family MPV with very comfortable ride. Third row folds flat. Complete casa records.',
                'Rear camera, push start, 7 seats, roof spoiler'],
            ['Honda', 'BR-V', 'V', 2019, 'Taffeta White', 760000, 15000, 'NBV 4415', 52700, 'gasoline', 'automatic', 655000,
                'Currently in for detailing before display. Interior shampooed, engine bay cleaned.',
                'Push start, rear aircon, alloy wheels, 7 seats'],
            ['Nissan', 'Almera', 'VE', 2016, 'Brilliant Silver', 385000, 10000, 'LAJ 2286', 91200, 'gasoline', 'manual', 315000,
                'Budget-friendly sedan, engine and transmission in good condition. Some swirl marks on paint.',
                'Power windows, CD stereo, manual aircon'],
            ['Suzuki', 'Dzire', 'GL', 2021, 'Fire Red', 520000, 10000, 'NEE 7310', 31800, 'gasoline', 'manual', 445000,
                'Low mileage, Opol-registered. Very fuel-efficient, perfect first car.',
                'Touchscreen stereo, rear camera, dual airbags'],
            ['Ford', 'Ranger', 'XL', 2019, 'Aluminum Metallic', 830000, 20000, 'KAC 6158', 76900, 'diesel', 'manual', 715000,
                '2.2 diesel 4x2. Strong pulling power, suspension refreshed in 2025.',
                'Bedliner, side steps, 4x2, Bluetooth'],
            ['Toyota', 'Vios', 'J', 2020, 'Freedom White', 495000, 10000, 'NDB 3092', 58600, 'gasoline', 'manual', 420000,
                'Former company car, regularly serviced at Toyota CDO. Basic but reliable.',
                'Dual airbags, ABS, AM/FM stereo, manual aircon'],
        ];

        foreach ($stock as $i => [$brand, $model, $variant, $year, $color, $price, $reservation, $plate, $km, $fuel, $trans, $cost, $description, $features]) {
            $variantRow = VehicleVariant::whereHas('model', fn($q) => $q->where('model', $model)
                ->whereHas('brand', fn($b) => $b->where('brand', $brand)))
                ->where('variant', $variant)
                ->firstOrFail();

            $stockNo = sprintf('ST-2026-%04d', $i + 1);

            $vehicle = Vehicle::updateOrCreate(['stock_no' => $stockNo], [
                'created_by_user_id' => $admin->id,
                'brand_id' => $variantRow->model->brand_id,
                'model_id' => $variantRow->model_id,
                'variant_id' => $variantRow->id,
                'year_model' => $year,
                'color' => $color,
                'description' => $description,
                'features' => $features,
                'selling_price' => $price,
                'reservation_price' => $reservation,
                'status' => 'available',
                'archived' => false,
            ]);

            VehicleSpec::updateOrCreate(['vehicle_id' => $vehicle->id], [
                'plate_number' => $plate,
                'engine_number' => sprintf('%s%07d', strtoupper(substr($model, 0, 2)), 4100000 + $i * 7919),
                'chassis_number' => sprintf('PH%s%011d', strtoupper(substr($brand, 0, 3)), 30000000 + $i * 104729),
                'mileage' => $km,
                'fuel_type' => $fuel,
                'transmission' => $trans,
            ]);

            $title = "{$year} {$brand} {$model} {$variant}";

            VehicleImage::where('vehicle_id', $vehicle->id)->delete();
            foreach ([1, 2, 3] as $shot) {
                VehicleImage::create([
                    'vehicle_id' => $vehicle->id,
                    'image_path' => PlaceholderImage::vehiclePhoto("vehicles/{$vehicle->id}", $title, "{$stockNo} - {$color}", $shot),
                ]);
            }

            VehicleDocument::updateOrCreate(['vehicle_id' => $vehicle->id], [
                'vehicle_cr_path' => PlaceholderImage::document("vehicle-documents/cr/{$stockNo}.jpg", 'CERTIFICATE OF REGISTRATION', [$title, "Plate {$plate}", 'Sample document']),
                'vehicle_or_path' => PlaceholderImage::document("vehicle-documents/or/{$stockNo}.jpg", 'OFFICIAL RECEIPT', [$title, "Plate {$plate}", 'Sample document']),
            ]);

            // Units were bought over the past few months; date the costs accordingly.
            $acquiredAt = now()->subDays(95 - $i * 4)->setTime(10, 0);
            $vehicle->forceFill(['created_at' => $acquiredAt])->save();

            VehicleExpense::where('vehicle_id', $vehicle->id)->delete();
            $expenses = [
                ['Vehicle Purchase', $cost, 'Bought from previous owner'],
                ['Registration', 2850 + ($i % 3) * 450, 'LTO renewal and transfer'],
                ['Car Wash', 350, 'Pre-display wash'],
            ];
            if ($i % 2 === 0) {
                $expenses[] = ['Detailing', 3500, 'Interior and exterior detailing'];
            }
            if ($i % 3 === 0) {
                $expenses[] = ['Oil Change', 2400, 'Engine oil and filter'];
            }
            foreach ($expenses as [$type, $amount, $remarks]) {
                VehicleExpense::create([
                    'vehicle_id' => $vehicle->id,
                    'expense_type_id' => $expenseTypes[$type],
                    'amount' => $amount,
                    'remarks' => $remarks,
                    'created_at' => $type === 'Vehicle Purchase' ? $acquiredAt : $acquiredAt->copy()->addDays(3),
                ]);
            }
        }
    }
}
