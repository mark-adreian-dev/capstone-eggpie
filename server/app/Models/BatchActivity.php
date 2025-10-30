<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchActivity extends Model
{
    protected $fillable = [
        'batch_process_id',
        'unloading_start',
        'unloading_end',
        'filling_prep_start',
        'filling_prep_end',
        'mixing_start',
        'mixing_end',
        'filling_into_dough_start',
        'filling_into_dough_end',
        'loading_start',
        'loading_end',
    ];

    public function batch()
    {
        return $this->belongsTo(BatchProcess::class, 'batch_process_id');
    }
}
