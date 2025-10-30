<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('process_settings', function (Blueprint $table) {
            $table->id();
            $table->time('operations_start_time')->nullable();
            $table->time('operations_end_time')->nullable();
            $table->integer('filling_prep_duration')->default(0); // seconds
            $table->integer('mixing_duration')->default(0);       // seconds
            $table->integer('filling_duration')->default(0);      // seconds
            $table->integer('baking_duration')->default(0);       // seconds
            $table->integer('trays_per_cycle')->default(0);
            $table->integer('egg_pies_per_tray')->default(0);
            $table->integer('oven_count')->default(0);
            $table->integer('current_baking_iteration')->default(0);
            $table->integer('current_mixing_iteration')->default(0);
            $table->integer('current_filling_iteration')->default(0);

            $table->integer('baking_timestamp')->default(0);
            $table->integer('filling_timestamp')->default(0);

            $table->integer('cycles')->default(0);
            $table->boolean('half_day')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('process_settings');
    }
};
