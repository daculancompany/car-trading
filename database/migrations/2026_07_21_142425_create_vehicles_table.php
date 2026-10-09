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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            $table->foreignId('created_by_user_id')
                ->constrained('users')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('brand_id')
                ->constrained('vehicle_brands')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('model_id')
                ->constrained('vehicle_models')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('variant_id')
                ->constrained('vehicle_variants')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('stock_no')->unique();
            $table->integer('year_model');
            $table->string('color');
            $table->text('description')->nullable();
            $table->text('features')->nullable();

            $table->decimal('selling_price', 15, 2);
            // $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('reservation_price', 15, 2);

            $table->enum('status', [
                'available',
                'unavailable',
                'reserved',
                'sold',
                'maintenance',
            ])->default('available');

            $table->boolean('archived')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
