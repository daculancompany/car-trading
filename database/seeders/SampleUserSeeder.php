<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Login accounts for every role. All passwords are "password".
 * Phone numbers use the 555 range so they never reach a real subscriber.
 */
class SampleUserSeeder extends Seeder
{
    public const PASSWORD = 'password';

    public function run(): void
    {
        $roles = Role::pluck('id', 'name');

        $staff = [
            // username, email, role, first, middle, last, suffix, address, mobile, hired, start, end
            ['admin', 'admin@gmail.com', 'Admin', 'Rodrigo', 'Pabillore', 'Abellana', 'Jr.', 'Zone 1-B Colanda, Iponan, Cagayan de Oro City', '0917 555 0101', '2023-11-06', '08:00', '17:00'],
            ['secretary', 'secretary@autocdo.test', 'Secretary', 'Kristine Mae', 'Ladera', 'Pabualan', null, 'Purok 4, Barra, Opol, Misamis Oriental', '0917 555 0102', '2024-01-15', '08:00', '17:00'],
            ['mechanic1', 'mechanic1@autocdo.test', 'Mechanic', 'Ernesto', 'Daba', 'Lumanog', null, 'Purok 2, Igpit, Opol, Misamis Oriental', '0917 555 0103', '2023-11-20', '07:30', '16:30'],
            ['mechanic2', 'mechanic2@autocdo.test', 'Mechanic', 'Jayson', null, 'Bacarro', null, 'Zone 5, Bulua, Cagayan de Oro City', '0917 555 0104', '2024-06-03', '07:30', '16:30'],
            ['washer', 'washer@autocdo.test', 'Washer', 'Mark Anthony', 'Ybañez', 'Ladera', null, 'Zone 3, Taboc, Opol, Misamis Oriental', '0917 555 0105', '2025-02-10', '08:00', '17:00'],
        ];

        foreach ($staff as [$username, $email, $role, $first, $middle, $last, $suffix, $address, $mobile, $hired, $start, $end]) {
            $user = $this->user($username, $email, $roles[$role]);

            Staff::updateOrCreate(['user_id' => $user->id], [
                'first_name' => $first,
                'middle_name' => $middle,
                'last_name' => $last,
                'suffix' => $suffix,
                'address' => $address,
                'mobile_number' => $mobile,
                'hire_date' => $hired,
                'work_start_hour' => $start,
                'work_end_hour' => $end,
                'status' => 'active',
                'archived' => false,
            ]);
        }

        // The mix of civil status / employment type covers every financing requirement group.
        $customers = [
            ['customer1', 'Juan Carlo', 'Saldua', 'Ebarle', 'Purok 7, Kauswagan, Cagayan de Oro City', 'married', 'employed', '0917 555 0201', '2026-07-28'],
            ['customer2', 'Maricel', 'Tan', 'Pacana', 'Zone 2, Carmen, Cagayan de Oro City', 'married', 'employed', '0917 555 0202', '2026-08-30'],
            ['customer3', 'Dennis', 'Ramos', 'Ochavo', 'Poblacion, Opol, Misamis Oriental', 'single', 'self_employed', '0917 555 0203', '2026-09-02'],
            ['customer4', 'Angelica', null, 'Lagbas', 'Purok 3, Gusa, Cagayan de Oro City', 'single', 'employed', '0917 555 0204', '2026-08-25'],
            ['customer5', 'Roberto', 'Uy', 'Salcedo', 'Zone 6, Bugo, Cagayan de Oro City', 'married', 'self_employed', '0917 555 0205', '2026-09-28'],
            ['customer6', 'Lyka', 'Gomez', 'Maglangit', 'Purok 1, Patag, Cagayan de Oro City', 'single', 'employed', '0917 555 0206', '2026-08-12'],
        ];

        foreach ($customers as [$username, $first, $middle, $last, $address, $civil, $employment, $mobile, $registered]) {
            $user = $this->user($username, "{$username}@autocdo.test", $roles['Customer']);

            Customer::updateOrCreate(['user_id' => $user->id], [
                'first_name' => $first,
                'middle_name' => $middle,
                'last_name' => $last,
                'address' => $address,
                'civil_status' => $civil,
                'employment_type' => $employment,
                'mobile_number' => $mobile,
                'facebook' => 'facebook.com/sample.' . $username,
                'date_registered' => $registered,
                'is_active' => true,
            ]);
        }
    }

    private function user(string $username, string $email, int $roleId): User
    {
        return User::updateOrCreate(['username' => $username], [
            'email' => $email,
            'role_id' => $roleId,
            'password' => Hash::make(self::PASSWORD),
            'is_active' => true,
        ]);
    }
}
