<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's roles.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'role_type' => 'system',
                'description' => 'Has full access to the system, including user management, master data, vehicle inventory, reservations, payments, financing, sales, vehicle releases, services, reports, and system configuration.',
            ],

            [
                'name' => 'Secretary',
                'role_type' => 'staffs',
                'description' => 'Manages customer records, reservations, payment processing, financing documents, sales transactions, vehicle releases, and other administrative operations.',
            ],

            [
                'name' => 'Mechanic',
                'role_type' => 'staffs',
                'description' => 'Handles vehicle inspection, maintenance, repair, service requests, job orders, vehicle parts, and other mechanical service activities.',
            ],

            [
                'name' => 'Washer',
                'role_type' => 'staffs',
                'description' => 'Handles vehicle washing, cleaning, preparation, and related vehicle service tasks assigned through the system.',
            ],

            [
                'name' => 'Customer',
                'role_type' => 'customers',
                'description' => 'Can browse available vehicles, view vehicle information, make reservations, submit required documents, manage payments, apply for financing, and monitor the status of transactions.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                [
                    'name' => $role['name'],
                ],
                [
                    'role_type' => $role['role_type'],
                    'description' => $role['description'],
                ]
            );
        }
    }
}
