<?php

namespace App\Http\Controllers;

use App\Models\BatchProcess;
use Illuminate\Http\Request;

class BatchProcessController extends Controller
{
    public function index()
    {
        return BatchProcess::with(['operation', 'oven', 'activity'])->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'operation_id' => 'required|exists:operations,id',
            'oven_id' => 'required|exists:ovens,id',
            'cycle_number' => 'required|integer|min:1',
            'batch_number' => 'required|integer|min:1',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'status' => 'in:pending,running,completed',
        ]);

        $batch = BatchProcess::create($data);
        return response()->json($batch->load(['operation', 'oven']), 201);
    }

    public function show(BatchProcess $batch)
    {
        return $batch->load(['operation', 'oven', 'activity']);
    }

    public function update(Request $request, BatchProcess $batch)
    {
        $batch->update($request->all());
        return response()->json($batch->load(['operation', 'oven', 'activity']), 200);
    }

    public function destroy(BatchProcess $batch)
    {
        $batch->delete();
        return response()->noContent();
    }
}
