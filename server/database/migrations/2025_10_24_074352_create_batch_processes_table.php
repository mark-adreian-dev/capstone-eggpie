<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('batch_processes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operation_id')->constrained('operations')->cascadeOnDelete();
            $table->foreignId('oven_id')->constrained('ovens')->cascadeOnDelete();
            $table->unsignedInteger('cycle_number');
            $table->unsignedInteger('batch_number');
            $table->timestamp('start_time')->nullable();
            $table->timestamp('end_time')->nullable();
            $table->enum('status', ['pending', 'running', 'completed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_processes');
    }
};
