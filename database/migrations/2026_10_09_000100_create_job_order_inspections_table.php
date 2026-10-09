<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_order_inspections', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_order_id')
                ->unique()
                ->constrained('job_orders')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('inspected_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->dateTime('inspected_at');
            $table->unsignedInteger('odometer')->nullable();
            $table->enum('result', ['confirmed', 'partial', 'not_found']);
            $table->text('findings');
            $table->text('recommendation')->nullable();
            $table->json('checklist')->nullable();
            $table->json('photos')->nullable();

            $table->enum('office_decision', ['proceed', 'cancel'])->nullable();
            $table->foreignId('decided_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->dateTime('decided_at')->nullable();
            $table->text('decision_note')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_order_inspections');
    }
};
