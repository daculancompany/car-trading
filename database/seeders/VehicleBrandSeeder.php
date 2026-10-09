<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use Illuminate\Database\Seeder;

class VehicleBrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $brands = [
            'Toyota',
            'Honda',
            'Mitsubishi',
            'Nissan',
            'Suzuki',
            'Ford',
            'Hyundai',
            'Kia',
            'Mazda',
            'Isuzu',
            'Chevrolet',
            'Volkswagen',
        ];

        foreach ($brands as $brand) {
            VehicleBrand::updateOrCreate(
                ['brand' => $brand],
                ['is_active' => true]
            );
        }
    }
}
