<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_order_inspections', function (Blueprint $table) {
            $table->string('fuel_level', 20)->nullable()->after('odometer');
            $table->json('pre_checks')->nullable()->after('checklist');
            $table->json('tires')->nullable()->after('pre_checks');
            $table->json('brakes')->nullable()->after('tires');
            $table->json('damage_marks')->nullable()->after('brakes');
            $table->json('recommended_services')->nullable()->after('damage_marks');
            $table->date('next_service_date')->nullable()->after('recommended_services');
            $table->string('service_required')->nullable()->after('next_service_date');
            $table->decimal('estimated_cost', 15, 2)->nullable()->after('service_required');
            $table->text('notes')->nullable()->after('estimated_cost');
        });
    }

    public function down(): void
    {
        Schema::table('job_order_inspections', function (Blueprint $table) {
            $table->dropColumn([
                'fuel_level',
                'pre_checks',
                'tires',
                'brakes',
                'damage_marks',
                'recommended_services',
                'next_service_date',
                'service_required',
                'estimated_cost',
                'notes',
            ]);
        });
    }
};
