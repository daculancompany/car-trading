<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('vehicle_id')->constrained('vehicles')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('reserved_by_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('reservation_source', ['online', 'walk_in']);
            $table->string('valid_id_type');

            $table->string('valid_id_front');
            $table->string('valid_id_front_status')->default('pending');
            $table->text('valid_id_front_remarks')->nullable();

            $table->string('valid_id_back');
            $table->string('valid_id_back_status')->default('pending');
            $table->text('valid_id_back_remarks')->nullable();

            $table->enum('purchase_option', ['cash', 'financing']);

            $table->dateTime('reserved_at');
            $table->dateTime('expires_at');

            $table->enum('reservation_status', [
                'pending_reservation',
                'pending_documents',
                'pending_financing',
                'pending_payment',
                'reserved',
                'cancelled',
                'expired',
                'completed'
            ])->default('pending_reservation');

            $table->text('remarks')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
