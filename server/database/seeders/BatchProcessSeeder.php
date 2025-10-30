<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BatchProcess;

class BatchProcessSeeder extends Seeder
{
    public function run(): void
    {
        BatchProcess::insert([
            [
                'batch_number' => 1,
                'cycle_number' => 1,
                'oven_id' => 1,
                'operation_id' => 1,
                'start_time' => '2025-10-24 05:00:00',
                'end_time' => '2025-10-24 07:00:00',
                'status' => 'completed',
            ],
            [
                'batch_number' => 2,
                'cycle_number' => 1,
                'oven_id' => 2,
                'operation_id' => 1,
                'start_time' => '2025-10-24 07:00:00',
                'end_time' => '2025-10-24 09:00:00',
                'status' => 'pending',
            ],
        ]);
    }
}
