<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Vehicle Part Seeder
 *
 * Seeds the vehicle_parts table with default vehicle
 * parts used in the CDO Car Trading system.
 */
class VehiclePartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'part_name' => 'Engine Oil',
                'category' => 'Engine',
                'quantity' => 20,
                'unit_price' => 850.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Oil Filter',
                'category' => 'Engine',
                'quantity' => 15,
                'unit_price' => 450.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Air Filter',
                'category' => 'Engine',
                'quantity' => 15,
                'unit_price' => 650.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Fuel Filter',
                'category' => 'Fuel System',
                'quantity' => 10,
                'unit_price' => 550.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Brake Pads',
                'category' => 'Braking System',
                'quantity' => 12,
                'unit_price' => 1800.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Brake Disc',
                'category' => 'Braking System',
                'quantity' => 8,
                'unit_price' => 3200.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Spark Plug',
                'category' => 'Ignition System',
                'quantity' => 30,
                'unit_price' => 350.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Battery',
                'category' => 'Electrical',
                'quantity' => 8,
                'unit_price' => 5500.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Alternator',
                'category' => 'Electrical',
                'quantity' => 5,
                'unit_price' => 8500.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Radiator',
                'category' => 'Cooling System',
                'quantity' => 5,
                'unit_price' => 7500.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Tire 185/65 R15',
                'category' => 'Tires & Wheels',
                'quantity' => 16,
                'unit_price' => 3800.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Tire 265/65 R17',
                'category' => 'Tires & Wheels',
                'quantity' => 12,
                'unit_price' => 6900.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Wiper Blade',
                'category' => 'Body',
                'quantity' => 20,
                'unit_price' => 450.00,
                'archived' => false,
            ],
            [
                'part_name' => 'ATF Fluid (1L)',
                'category' => 'Transmission',
                'quantity' => 24,
                'unit_price' => 520.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Brake Fluid DOT 3',
                'category' => 'Braking System',
                'quantity' => 15,
                'unit_price' => 280.00,
                'archived' => false,
            ],
            [
                'part_name' => 'Coolant (1 gal)',
                'category' => 'Cooling System',
                'quantity' => 12,
                'unit_price' => 650.00,
                'archived' => false,
            ],
        ];

        // Insert-only: re-running must not reset stock counts that have changed since.
        foreach ($rows as $row) {
            if (DB::table('vehicle_parts')->where('part_name', $row['part_name'])->exists()) {
                continue;
            }

            DB::table('vehicle_parts')->insert($row + ['created_at' => now(), 'updated_at' => now()]);
        }
    }
}
