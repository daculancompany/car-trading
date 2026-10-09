<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->after('work_type');
            $table->dateTime('scheduled_at')->nullable()->after('priority');
            $table->dateTime('estimated_completion')->nullable()->after('scheduled_at');
            $table->text('reported_problem')->nullable()->after('description');
            $table->decimal('estimated_labor_cost', 15, 2)->nullable()->after('labor_cost');
            $table->unsignedInteger('odometer_in')->nullable()->after('estimated_labor_cost');
            $table->enum('fuel_level', ['empty', 'quarter', 'half', 'three_quarter', 'full'])->nullable()->after('odometer_in');
            $table->text('personal_items')->nullable()->after('fuel_level');
        });
    }

    public function down(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropColumn([
                'priority',
                'scheduled_at',
                'estimated_completion',
                'reported_problem',
                'estimated_labor_cost',
                'odometer_in',
                'fuel_level',
                'personal_items',
            ]);
        });
    }
};
