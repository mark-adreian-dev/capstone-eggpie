<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operation extends Model
{
    protected $fillable = [
        'operation_date',
        'is_halfday',
        'current_cycle',
    ];

    public function batches()
    {
        return $this->hasMany(BatchProcess::class);
    }
}
