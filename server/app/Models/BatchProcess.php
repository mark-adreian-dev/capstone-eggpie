<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchProcess extends Model
{
    protected $fillable = [
        'operation_id',
        'oven_id',
        'cycle_number',
        'batch_number',
        'start_time',
        'end_time',
        'status',
    ];

    public function operation()
    {
        return $this->belongsTo(Operation::class);
    }

    public function oven()
    {
        return $this->belongsTo(Oven::class);
    }

    public function activity()
    {
        return $this->hasOne(BatchActivity::class);
    }
}
