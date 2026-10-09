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
        Schema::create('vehicle_releases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')
                ->unique()
                ->constrained('sales')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->string('release_number')->unique();
            $table->date('release_date')->nullable();

            $table->enum('status', [
                'pending',
                'released',
                'cancelled',
            ])->default('pending');

            $table->boolean('archived')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_releases');
    }
};
