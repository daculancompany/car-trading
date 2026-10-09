<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Master data (safe to re-run)
        $this->call([
            RoleSeeder::class,
            VehicleBrandSeeder::class,
            VehicleModelSeeder::class,
            VehicleVariantSeeder::class,
            ExpenseTypeSeeder::class,
            FinancingRequirementGroupSeeder::class,
            FinancingRequirementSeeder::class,
            VehiclePartSeeder::class,
            PaymentAccountSeeder::class,
            SampleUserSeeder::class,
        ]);

        // Sample inventory and transactions (expects a fresh database)
        $this->call([
            VehicleInventorySeeder::class,
            TransactionSeeder::class,
        ]);
    }
}
