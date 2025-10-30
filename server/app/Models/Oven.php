<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Oven extends Model
{
    protected $fillable = [
        'name',
        'capacity',
        'is_active',
    ];

    public function batches()
    {
        return $this->hasMany(BatchProcess::class);
    }
}
