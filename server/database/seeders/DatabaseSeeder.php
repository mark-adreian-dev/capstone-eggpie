<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            ProcessSettingSeeder::class,
            OperationSeeder::class,
            OvenSeeder::class,
            BatchProcessSeeder::class,
        ]);
    }
}
