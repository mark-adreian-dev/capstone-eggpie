<?php

namespace App\Http\Controllers;

use App\Models\Oven;
use Illuminate\Http\Request;

class OvenController extends Controller
{
    public function index()
    {
        return Oven::with('batches')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $oven = Oven::create($data);
        return response()->json($oven, 201);
    }

    public function show(Oven $oven)
    {
        return $oven->load('batches');
    }

    public function update(Request $request, Oven $oven)
    {
        $oven->update($request->all());
        return response()->json($oven, 200);
    }

    public function destroy(Oven $oven)
    {
        $oven->delete();
        return response()->noContent();
    }
}
