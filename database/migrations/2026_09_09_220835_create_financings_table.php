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
        Schema::create('financing_infos', function (Blueprint $table) {
            $table->id();

            // Reservation
            $table->foreignId('reservation_id')
                ->unique()
                ->constrained('reservations')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            // Financing Company Information
            $table->string('company_name');
            $table->string('contact_person');
            $table->string('contact_number');
            $table->string('email');
            $table->string('address');

            // Financing Details
            $table->string('financing_reference_no')
                ->nullable();
            $table->decimal('financed_amount', 15, 2);
            $table->decimal('monthly_payment', 15, 2)
                ->nullable();
            $table->integer('loan_term_months')
                ->nullable();

            // Verification
            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Status
            $table->enum('financing_status', [
                'pending',
                'approved',
                'rejected',
                'completed',
            ])->default('pending');

            // Remarks
            $table->text('remarks')
                ->nullable();

            // Archive
            $table->boolean('archived')
                ->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financing_infos');
    }
};
