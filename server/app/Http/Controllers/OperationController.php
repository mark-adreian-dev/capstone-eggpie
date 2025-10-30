<?php

namespace App\Http\Controllers;

use App\Models\Operation;
use Illuminate\Http\Request;

class OperationController extends Controller
{
    public function index()
    {
        return Operation::with('batches.oven')->orderByDesc('id')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'operation_date' => 'required|date',
            'is_halfday' => 'boolean',
            'current_cycle' => 'integer',
        ]);

        $operation = Operation::create($data);
        return response()->json($operation, 201);
    }

    public function show(Operation $operation)
    {
        return $operation->load('batches.oven');
    }

    public function update(Request $request, Operation $operation)
    {
        $operation->update($request->all());
        return response()->json($operation, 200);
    }

    public function destroy(Operation $operation)
    {
        $operation->delete();
        return response()->noContent();
    }
}
