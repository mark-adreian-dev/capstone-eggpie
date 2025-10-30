<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('batch_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_process_id')->constrained('batch_processes')->cascadeOnDelete();
            $table->time('unloading_start')->nullable();
            $table->time('unloading_end')->nullable();
            $table->time('filling_prep_start')->nullable();
            $table->time('filling_prep_end')->nullable();
            $table->time('mixing_start')->nullable();
            $table->time('mixing_end')->nullable();
            $table->time('filling_into_dough_start')->nullable();
            $table->time('filling_into_dough_end')->nullable();
            $table->time('loading_start')->nullable();
            $table->time('loading_end')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_activities');
    }
};
