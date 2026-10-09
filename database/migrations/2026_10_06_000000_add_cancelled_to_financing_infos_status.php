<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    // FinancingInfoStatus has a CANCELLED case that the original column did not allow.
    public function up(): void
    {
        DB::statement("ALTER TABLE financing_infos MODIFY financing_status ENUM('pending','approved','rejected','cancelled','completed') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::table('financing_infos')
            ->where('financing_status', 'cancelled')
            ->update(['financing_status' => 'rejected']);

        DB::statement("ALTER TABLE financing_infos MODIFY financing_status ENUM('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending'");
    }
};
