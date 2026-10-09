<?php

namespace Database\Seeders;

use App\Models\PaymentAccount;
use Database\Seeders\Support\PlaceholderImage;
use Illuminate\Database\Seeder;

class PaymentAccountSeeder extends Seeder
{
    public function run(): void
    {
        // Sample numbers only — replace with the shop's real accounts before going live.
        $accounts = [
            ['GCash', 'AUTO CDO Car Trading', '0917 555 0100'],
            ['Maya', 'AUTO CDO Car Trading', '0918 555 0100'],
            ['BDO', 'AUTO CDO Car Trading', '0055 5010 0100'],
            ['BPI', 'AUTO CDO Car Trading', '9555 0101 00'],
        ];

        foreach ($accounts as [$provider, $name, $number]) {
            $slug = strtolower($provider);

            PaymentAccount::updateOrCreate(
                ['account_provider' => $provider],
                [
                    'account_name' => $name,
                    'account_number' => $number,
                    'qr_code_path' => PlaceholderImage::qrCode("payment-accounts/{$slug}-qr.png", "{$provider} - {$number}"),
                    'is_active' => true,
                ]
            );
        }
    }
}
