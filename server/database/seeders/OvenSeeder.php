<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Oven;

class OvenSeeder extends Seeder
{
    public function run(): void
    {
        Oven::insert([
            [
                'name' => 'Oven 1',
                'capacity' => 120,
            ],
            [
                'name' => 'Oven 2',
                'capacity' => 120,
            ],
        ]);
    }
}
