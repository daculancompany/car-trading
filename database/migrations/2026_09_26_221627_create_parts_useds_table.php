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
        Schema::create('parts_useds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('job_order_id')
                ->constrained('job_orders')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('vehicle_part_id')
                ->constrained('vehicle_parts')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->integer('quantity');
            $table->dateTime('used_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parts_useds');
    }
};
