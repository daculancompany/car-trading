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
        Schema::create('vehicle_specs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_id')
                ->unique()
                ->constrained('vehicles')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('plate_number')->unique();
            $table->string('engine_number')->unique();
            $table->string('chassis_number')->unique();
            $table->integer('mileage');

            $table->enum('fuel_type', [
                'gasoline',
                'diesel',
                'electric'
            ]);

            $table->enum('transmission', [
                'manual',
                'automatic'
            ]);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_specs');
    }
};
