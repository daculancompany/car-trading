<?php

namespace Database\Seeders;

use App\Models\VehicleBrand;
use App\Models\VehicleModel;
use App\Models\VehicleVariant;
use Illuminate\Database\Seeder;

class VehicleVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $variants = [
            'Toyota' => [
                'Vios' => [
                    'J',
                    'E',
                    'G',
                ],

                'Corolla Altis' => [
                    '1.6 J',
                    '1.6 V',
                    '1.8 G',
                ],

                'Camry' => [
                    '2.5 V',
                    '2.5 Hybrid',
                ],

                'Fortuner' => [
                    '2.4 G',
                    '2.4 V',
                    '2.8 Q',
                ],

                'Innova' => [
                    '2.0 J',
                    '2.0 E',
                    '2.0 G',
                ],

                'Hilux' => [
                    'J',
                    'E',
                    'G',
                    'Conquest',
                ],
            ],

            'Honda' => [
                'City' => [
                    'S',
                    'V',
                    'RS',
                ],

                'Civic' => [
                    'V Turbo',
                    'RS Turbo',
                ],

                'CR-V' => [
                    'S',
                    'V',
                    'VX',
                ],

                'BR-V' => [
                    'S',
                    'V',
                ],

                'HR-V' => [
                    'S',
                    'V',
                    'V Turbo',
                ],
            ],

            'Mitsubishi' => [
                'Mirage' => [
                    'GLX',
                    'G4',
                ],

                'Mirage G4' => [
                    'GLX',
                    'GLS',
                ],

                'Montero Sport' => [
                    'GLX',
                    'GT',
                    'Black Series',
                ],

                'Xpander' => [
                    'GLX',
                    'GLS',
                    'GT',
                ],

                'Triton' => [
                    'GL',
                    'GLS',
                    'Athlete',
                ],
            ],

            'Nissan' => [
                'Almera' => [
                    'EL',
                    'VE',
                    'VL',
                ],

                'Navara' => [
                    'EL',
                    'VE',
                    'VL',
                    'PRO-4X',
                ],

                'Terra' => [
                    'EL',
                    'VE',
                    'VL',
                ],

                'Kicks' => [
                    'e-POWER',
                    'VL',
                ],

                'X-Trail' => [
                    '2.0',
                    '2.5',
                ],
            ],

            'Suzuki' => [
                'Swift' => [
                    'GL',
                    'GLX',
                ],

                'Dzire' => [
                    'GA',
                    'GL',
                ],

                'Ertiga' => [
                    'GA',
                    'GL',
                    'GLX',
                ],

                'XL7' => [
                    'GL',
                    'GLX',
                ],

                'Jimny' => [
                    'MT',
                    'AT',
                ],
            ],

            'Ford' => [
                'Ranger' => [
                    'XL',
                    'XLT',
                    'Wildtrak',
                ],

                'Everest' => [
                    'Trend',
                    'Titanium',
                    'Sport',
                ],

                'Territory' => [
                    'Trend',
                    'Titanium',
                ],

                'EcoSport' => [
                    'Trend',
                    'Titanium',
                ],
            ],

            'Hyundai' => [
                'Accent' => [
                    'GL',
                    'GLS',
                ],

                'Tucson' => [
                    'GL',
                    'GLS',
                    'N Line',
                ],

                'Santa Fe' => [
                    'GL',
                    'GLS',
                ],

                'Stargazer' => [
                    'Smart',
                    'Premium',
                ],
            ],

            'Kia' => [
                'Picanto' => [
                    'LX',
                    'EX',
                    'GT Line',
                ],

                'Soluto' => [
                    'LX',
                    'EX',
                ],

                'Seltos' => [
                    'EX',
                    'SX',
                ],

                'Sportage' => [
                    'EX',
                    'GT Line',
                ],
            ],

            'Mazda' => [
                'Mazda2' => [
                    'Sport',
                    'Sedan',
                ],

                'Mazda3' => [
                    'Sedan',
                    'Hatchback',
                ],

                'CX-5' => [
                    'Sport',
                    'AWD',
                    'Turbo',
                ],

                'CX-8' => [
                    'Sport',
                    'AWD',
                    'Turbo',
                ],
            ],

            'Isuzu' => [
                'D-Max' => [
                    'LT',
                    'LS',
                    'LS-E',
                ],

                'mu-X' => [
                    'LS',
                    'LS-E',
                ],

                'Traviz' => [
                    'S',
                    'LS',
                ],
            ],

            'Chevrolet' => [
                'Spark' => [
                    'LS',
                    'LT',
                ],

                'Trailblazer' => [
                    'LT',
                    'Premier',
                ],

                'Colorado' => [
                    'LT',
                    'Z71',
                ],
            ],

            'Volkswagen' => [
                'Santana' => [
                    'MPI',
                    'GTS',
                ],

                'T-Cross' => [
                    '180 TSI',
                    'Comfortline',
                ],

                'Tiguan' => [
                    'Comfortline',
                    'Elegance',
                ],
            ],
        ];

        foreach ($variants as $brandName => $models) {

            $brand = VehicleBrand::where(
                'brand',
                $brandName
            )->first();

            if (!$brand) {
                continue;
            }

            foreach ($models as $modelName => $modelVariants) {

                $model = VehicleModel::where(
                    'brand_id',
                    $brand->id
                )
                    ->where('model', $modelName)
                    ->first();

                if (!$model) {
                    continue;
                }

                foreach ($modelVariants as $variantName) {

                    VehicleVariant::updateOrCreate(
                        [
                            'model_id' => $model->id,
                            'variant' => $variantName,
                        ],
                        [
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
