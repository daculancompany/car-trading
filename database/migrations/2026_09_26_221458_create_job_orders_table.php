<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('job_orders', function (Blueprint $table) {

            $table->id();

            // Vehicle assigned to the Job Order
            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Optional: Customer Service Request
            $table->foreignId('request_service_id')
                ->nullable()
                ->constrained('request_services')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Staff assigned to perform the work
            $table->foreignId('assigned_staff_id')
                ->constrained('staffs')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Admin / Business user who created the JO
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Job Order Number
            $table->string('job_order_no')->unique();

            // Work Type
            $table->enum('work_type', [
                'repair',
                'maintenance',
                'inspection',
                'washing',
                'detailing',
                'other'
            ]);

            // Job Schedule
            $table->dateTime('start_job')->nullable();
            $table->dateTime('finish_job')->nullable();

            // Work Description
            $table->text('description')->nullable();

            // Labor Cost
            $table->decimal('labor_cost', 15, 2)->nullable()->default(0);

            // Job Order Status
            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('pending');

            // Archive
            $table->boolean('archived')->default(false);

            // Timestamps
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_orders');
    }
};
