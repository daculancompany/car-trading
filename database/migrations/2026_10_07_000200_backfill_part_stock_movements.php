<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('vehicle_parts')
            ->where('quantity', '>', 0)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('part_stock_movements')
                    ->whereColumn('part_stock_movements.vehicle_part_id', 'vehicle_parts.id');
            })
            ->orderBy('id')
            ->get()
            ->each(function ($part) use ($now) {
                DB::table('part_stock_movements')->insert([
                    'vehicle_part_id' => $part->id,
                    'type' => 'receiving',
                    'quantity' => $part->quantity,
                    'unit_cost' => $part->unit_price,
                    'amount' => round($part->unit_price * $part->quantity, 2),
                    'previous_quantity' => 0,
                    'new_quantity' => $part->quantity,
                    'remarks' => 'Beginning balance',
                    'moved_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            });
    }

    public function down(): void
    {
        DB::table('part_stock_movements')
            ->where('remarks', 'Beginning balance')
            ->delete();
    }
};
