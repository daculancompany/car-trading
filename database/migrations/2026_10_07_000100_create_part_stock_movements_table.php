<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('part_stock_movements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('vehicle_part_id')
                ->constrained('vehicle_parts')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->enum('type', ['receiving', 'stock_in', 'stock_out', 'damage']);

            $table->integer('quantity');
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->integer('previous_quantity');
            $table->integer('new_quantity');

            $table->string('reference_type')->nullable();
            $table->foreignId('job_order_id')
                ->nullable()
                ->constrained('job_orders')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->foreignId('parts_used_id')
                ->nullable()
                ->constrained('parts_useds')
                ->cascadeOnUpdate()
                ->nullOnDelete();
            $table->string('reference_no')->nullable();

            $table->text('remarks')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->cascadeOnUpdate()
                ->nullOnDelete();

            $table->dateTime('moved_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('part_stock_movements');
    }
};
