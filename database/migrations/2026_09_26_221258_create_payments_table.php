<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('sale_id')->constrained('sales')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('financing_info_id')->nullable()->constrained('financing_infos')->cascadeOnUpdate()->restrictOnDelete();
            $table->foreignId('payment_account_id')->nullable()->constrained('payment_accounts')->nullOnDelete();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('payer_type', ['customer', 'financing_company']);
            $table->enum('payment_type', ['reservation_fee', 'partial_payment', 'full_payment', 'financing_release']);
            $table->enum('payment_method', ['cash', 'gcash', 'bank_transfer']);
            $table->decimal('amount', 15, 2);
            $table->string('reference_number')->unique()->nullable();
            $table->string('payment_proof')->nullable();
            $table->dateTime('payment_date');
            $table->enum('payment_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->dateTime('verified_at')->nullable();
            $table->text('remarks')->nullable();
            $table->boolean('archived')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
