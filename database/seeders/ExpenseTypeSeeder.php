<?php

namespace Database\Seeders;

use App\Models\ExpenseType;
use Illuminate\Database\Seeder;

class ExpenseTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $expenseTypes = [
            'Vehicle Purchase',
            'Fuel',
            'Maintenance',
            'Repair',
            'Parts',
            'Tires',
            'Oil Change',
            'Registration',
            'Insurance',
            'Car Wash',
            'Detailing',
            'Transportation',
            'Miscellaneous',
        ];

        foreach ($expenseTypes as $expenseName) {
            ExpenseType::updateOrCreate(
                [
                    'expense_name' => $expenseName,
                ],
                [
                    'is_active' => true,
                ]
            );
        }
    }
}
