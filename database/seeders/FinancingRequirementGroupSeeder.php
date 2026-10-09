<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancingRequirementGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rows = [
            [
                'group_name' => 'Common Requirements',
                'group_code' => 'COMMON',
                'description' => 'Requirements that are required for all financing applicants.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'Employed Applicants',
                'group_code' => 'EMPLOYED',
                'description' => 'Additional requirements for applicants who are employed.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'Self-Employed Applicants',
                'group_code' => 'SELF_EMPLOYED',
                'description' => 'Additional requirements for applicants who are self-employed.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'group_name' => 'Married Applicants',
                'group_code' => 'MARRIED',
                'description' => 'Additional requirement for married financing applicants.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($rows as $row) {
            DB::table('financing_requirement_groups')->updateOrInsert(['group_code' => $row['group_code']], $row);
        }
    }
}
