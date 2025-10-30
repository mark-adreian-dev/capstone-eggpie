<?php

namespace App\Http\Controllers;

use App\Models\BatchActivity;
use Illuminate\Http\Request;

class BatchActivityController extends Controller
{
    public function index()
    {
        return BatchActivity::with('batch.oven')->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'batch_process_id' => 'required|exists:batch_processes,id',
            'unloading_start' => 'nullable|date_format:H:i:s',
            'unloading_end' => 'nullable|date_format:H:i:s',
            'filling_prep_start' => 'nullable|date_format:H:i:s',
            'filling_prep_end' => 'nullable|date_format:H:i:s',
            'mixing_start' => 'nullable|date_format:H:i:s',
            'mixing_end' => 'nullable|date_format:H:i:s',
            'filling_into_dough_start' => 'nullable|date_format:H:i:s',
            'filling_into_dough_end' => 'nullable|date_format:H:i:s',
            'loading_start' => 'nullable|date_format:H:i:s',
            'loading_end' => 'nullable|date_format:H:i:s',
        ]);

        $activity = BatchActivity::create($data);
        return response()->json($activity->load('batch.oven'), 201);
    }

    public function show(BatchActivity $activity)
    {
        return $activity->load('batch.oven');
    }

    public function update(Request $request, BatchActivity $activity)
    {
        $activity->update($request->all());
        return response()->json($activity->load('batch.oven'), 200);
    }

    public function destroy(BatchActivity $activity)
    {
        $activity->delete();
        return response()->noContent();
    }
}
