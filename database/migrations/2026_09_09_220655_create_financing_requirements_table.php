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
        Schema::create('financing_requirements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('group_id')
                ->constrained('financing_requirement_groups')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->string('requirement_name')->unique();

            $table->text('description')->nullable();

            $table->unsignedInteger('required_quantity')->default(1);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financing_requirements');
    }
};
