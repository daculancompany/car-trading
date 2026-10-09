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
        Schema::create('financing_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('financing_requirement_id')
                ->constrained('financing_requirements')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreignId('financing_info_id')
                ->constrained('financing_infos')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('file_name');
            $table->string('file_path');
            $table->dateTime('uploaded_at');

            $table->enum('verification_status', [
                'pending',
                'verified',
                'rejected'
            ])->default('pending');

            $table->dateTime('verified_at')->nullable();
            $table->text('remarks')->nullable();

            $table->boolean('archived')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financing_documents');
    }
};
