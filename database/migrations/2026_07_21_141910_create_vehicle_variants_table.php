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
        Schema::create('vehicle_variants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('model_id')
                ->constrained('vehicle_models')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('variant');
            $table->boolean('is_active')->default(true);

            $table->unique(['model_id', 'variant']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_variants');
    }
};
