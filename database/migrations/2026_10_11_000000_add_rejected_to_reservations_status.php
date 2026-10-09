<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE reservations MODIFY reservation_status ENUM('pending_reservation','pending_documents','pending_financing','pending_payment','reserved','rejected','cancelled','expired','completed') NOT NULL DEFAULT 'pending_reservation'");
    }

    public function down(): void
    {
        DB::table('reservations')->where('reservation_status', 'rejected')->update(['reservation_status' => 'cancelled']);
        DB::statement("ALTER TABLE reservations MODIFY reservation_status ENUM('pending_reservation','pending_documents','pending_financing','pending_payment','reserved','cancelled','expired','completed') NOT NULL DEFAULT 'pending_reservation'");
    }
};
