<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use Illuminate\Database\Seeder;

class VehicleModelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $models = [
            'Toyota' => [
                'Vios',
                'Corolla Altis',
                'Camry',
                'Fortuner',
                'Innova',
                'Hilux',
            ],

            'Honda' => [
                'City',
                'Civic',
                'CR-V',
                'BR-V',
                'HR-V',
            ],

            'Mitsubishi' => [
                'Mirage',
                'Mirage G4',
                'Montero Sport',
                'Xpander',
                'Triton',
            ],

            'Nissan' => [
                'Almera',
                'Navara',
                'Terra',
                'Kicks',
                'X-Trail',
            ],

            'Suzuki' => [
                'Swift',
                'Dzire',
                'Ertiga',
                'XL7',
                'Jimny',
            ],

            'Ford' => [
                'Ranger',
                'Everest',
                'Territory',
                'EcoSport',
            ],

            'Hyundai' => [
                'Accent',
                'Tucson',
                'Santa Fe',
                'Stargazer',
            ],

            'Kia' => [
                'Picanto',
                'Soluto',
                'Seltos',
                'Sportage',
            ],

            'Mazda' => [
                'Mazda2',
                'Mazda3',
                'CX-5',
                'CX-8',
            ],

            'Isuzu' => [
                'D-Max',
                'mu-X',
                'Traviz',
            ],

            'Chevrolet' => [
                'Spark',
                'Trailblazer',
                'Colorado',
            ],

            'Volkswagen' => [
                'Santana',
                'T-Cross',
                'Tiguan',
            ],
        ];

        foreach ($models as $brandName => $brandModels) {

            $brand = VehicleBrand::where('brand', $brandName)->first();

            if (!$brand) {
                continue;
            }

            foreach ($brandModels as $modelName) {
                VehicleModel::updateOrCreate(
                    [
                        'brand_id' => $brand->id,
                        'model' => $modelName,
                    ],
                    [
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}
