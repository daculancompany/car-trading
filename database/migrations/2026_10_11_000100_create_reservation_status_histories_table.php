<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->string('action', 40)->default('status_changed');
            $table->text('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $rows = [];
        foreach (DB::table('reservations')->orderBy('id')->get() as $reservation) {
            $rows[] = [
                'reservation_id' => $reservation->id,
                'from_status' => null,
                'to_status' => 'pending_reservation',
                'action' => 'created',
                'note' => null,
                'user_id' => $reservation->reserved_by_id,
                'created_at' => $reservation->created_at,
                'updated_at' => $reservation->created_at,
            ];

            if ($reservation->reservation_status !== 'pending_reservation') {
                $rows[] = [
                    'reservation_id' => $reservation->id,
                    'from_status' => 'pending_reservation',
                    'to_status' => $reservation->reservation_status,
                    'action' => 'status_changed',
                    'note' => null,
                    'user_id' => null,
                    'created_at' => $reservation->updated_at,
                    'updated_at' => $reservation->updated_at,
                ];
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('reservation_status_histories')->insert($chunk);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_status_histories');
    }
};
