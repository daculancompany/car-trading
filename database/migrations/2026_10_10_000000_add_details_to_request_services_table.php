<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('request_services', function (Blueprint $table) {
            $table->enum('service_type', ['repair', 'maintenance', 'inspection', 'washing', 'detailing', 'other'])->default('repair')->after('service_request_number');
            $table->enum('urgency', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('service_type');
            $table->json('symptoms')->nullable()->after('request_detail');
            $table->string('problem_started')->nullable()->after('symptoms');
            $table->unsignedInteger('mileage')->nullable()->after('problem_started');
            $table->json('photos')->nullable()->after('request_proof');
            $table->string('preferred_time')->nullable()->after('request_date_pref');
            $table->string('contact_number', 30)->nullable()->after('preferred_time');
        });
    }

    public function down(): void
    {
        Schema::table('request_services', function (Blueprint $table) {
            $table->dropColumn([
                'service_type',
                'urgency',
                'symptoms',
                'problem_started',
                'mileage',
                'photos',
                'preferred_time',
                'contact_number',
            ]);
        });
    }
};
