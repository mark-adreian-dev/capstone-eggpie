<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ProcessSetting;

class ProcessSettingSeeder extends Seeder
{
    public function run(): void
    {
        ProcessSetting::create([
            'operations_start_time' => '05:00:00',
            'operations_end_time' => '17:00:00',
            'filling_prep_duration' => 120,
            'mixing_duration' => 5400,
            'filling_duration' => 1800,
            'baking_duration' => 7200,
            'trays_per_cycle' => 24,
            'baking_timestamp' => 0,
            'filling_timestamp' => 0,
            'egg_pies_per_tray' => 5,
            'oven_count' => 2,
            'current_baking_iteration' => 1,
            'current_mixing_iteration' => 1,
            'current_filling_iteration' => 1,
            'cycles' => 5,
        ]);
    }
}
