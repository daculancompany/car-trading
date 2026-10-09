<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->enum('estimate_status', ['none', 'pending', 'approved', 'declined'])->default('none')->after('estimated_labor_cost');
            $table->decimal('estimate_amount', 15, 2)->nullable()->after('estimate_status');
            $table->text('estimate_note')->nullable()->after('estimate_amount');
            $table->dateTime('estimate_sent_at')->nullable()->after('estimate_note');
            $table->dateTime('estimate_responded_at')->nullable()->after('estimate_sent_at');
            $table->text('estimate_response_note')->nullable()->after('estimate_responded_at');
            $table->foreignId('estimate_responded_by')->nullable()->after('estimate_response_note')->constrained('users')->nullOnDelete();
            $table->string('invoice_no')->nullable()->unique()->after('job_order_no');
            $table->dateTime('invoiced_at')->nullable()->after('invoice_no');
            $table->unsignedSmallInteger('warranty_days')->nullable()->after('personal_items');
            $table->unsignedInteger('warranty_km')->nullable()->after('warranty_days');
            $table->unsignedTinyInteger('rating')->nullable()->after('progress');
            $table->text('feedback')->nullable()->after('rating');
            $table->dateTime('rated_at')->nullable()->after('feedback');
        });

        Schema::create('job_order_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_order_id')->constrained('job_orders')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('method', ['cash', 'gcash', 'bank_transfer', 'card', 'other'])->default('cash');
            $table->string('reference_no')->nullable();
            $table->dateTime('paid_at');
            $table->text('note')->nullable();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('job_order_inspections', function (Blueprint $table) {
            $table->dateTime('reminder_sent_at')->nullable()->after('next_service_date');
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 20);
            $table->string('subject_type', 60);
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label')->nullable();
            $table->json('changes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['subject_type', 'subject_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');

        Schema::table('job_order_inspections', function (Blueprint $table) {
            $table->dropColumn('reminder_sent_at');
        });

        Schema::dropIfExists('job_order_payments');

        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('estimate_responded_by');
            $table->dropUnique(['invoice_no']);
            $table->dropColumn([
                'estimate_status', 'estimate_amount', 'estimate_note', 'estimate_sent_at', 'estimate_responded_at',
                'estimate_response_note', 'invoice_no', 'invoiced_at', 'warranty_days', 'warranty_km', 'rating', 'feedback', 'rated_at',
            ]);
        });
    }
};
