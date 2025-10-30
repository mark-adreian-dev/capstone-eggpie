<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcessSetting extends Model
{
    use HasFactory;

    protected $casts = [
        'half_day' => 'boolean',
    ];
    protected $fillable = [
        'operations_start_time',
        'operations_end_time',
        'filling_prep_duration',
        'mixing_duration',
        'filling_duration',
        'baking_duration',
        'trays_per_cycle',
        'egg_pies_per_tray',
        'oven_count',
        'cycles',
        'current_baking_iteration',
        'current_mixing_iteration',
        'current_filling_iteration',
        'baking_timestamp',
        'filling_timestamp',
        'half_day'
    ];
}
