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
        Schema::create('request_services', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_release_id')
                ->constrained('vehicle_releases')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('service_request_number')->unique();
            $table->text('request_detail');
            $table->string('request_proof');
            $table->date('request_date_pref');

            $table->enum('status', [
                'pending',
                'assigned',
                'in_progress',
                'completed',
                'cancelled'
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
        Schema::dropIfExists('request_services');
    }
};
