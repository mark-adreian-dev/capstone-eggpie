<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Operation;

class OperationSeeder extends Seeder
{
    public function run(): void
    {
        Operation::create([
            'date' => now()->toDateString(),
            'current_cycle' => 1,
        ]);
    }
}
