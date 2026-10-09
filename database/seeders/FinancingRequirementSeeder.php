<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FinancingRequirementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $groups = DB::table('financing_requirement_groups')
            ->pluck('id', 'group_code');

        $rows = [
            // COMMON REQUIREMENTS

            [
                'group_id' => $groups['COMMON'],
                'requirement_name' => 'Valid IDs',
                'description' => 'Two valid government-issued identification documents.',
                'required_quantity' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'group_id' => $groups['COMMON'],
                'requirement_name' => 'Application Form',
                'description' => 'Completed financing application form.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'group_id' => $groups['COMMON'],
                'requirement_name' => 'Proof of Billing',
                'description' => 'Recent proof of billing showing the applicant\'s address.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'group_id' => $groups['COMMON'],
                'requirement_name' => 'Bank Statement',
                'description' => 'Recent bank statement required for financing evaluation.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // EMPLOYED APPLICANTS

            [
                'group_id' => $groups['EMPLOYED'],
                'requirement_name' => 'Certificate of Employment (COE)',
                'description' => 'Certificate of Employment from the applicant\'s employer.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'group_id' => $groups['EMPLOYED'],
                'requirement_name' => 'Latest 3 Months Payslip',
                'description' => 'Payslips covering the latest three months.',
                'required_quantity' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // SELF-EMPLOYED APPLICANTS

            [
                'group_id' => $groups['SELF_EMPLOYED'],
                'requirement_name' => 'Business Permit',
                'description' => 'Valid business permit for the applicant\'s business.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'group_id' => $groups['SELF_EMPLOYED'],
                'requirement_name' => 'DTI Registration',
                'description' => 'Valid DTI business name registration.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // MARRIED APPLICANTS

            [
                'group_id' => $groups['MARRIED'],
                'requirement_name' => 'Marriage Certificate',
                'description' => 'Marriage certificate for married financing applicants.',
                'required_quantity' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($rows as $row) {
            DB::table('financing_requirements')->updateOrInsert(['group_id' => $row['group_id'], 'requirement_name' => $row['requirement_name']], $row);
        }
    }
}
