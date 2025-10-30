<?php

namespace App\Http\Controllers;

use App\Models\ProcessSetting;
use Illuminate\Http\Request;

class ProcessSettingController extends Controller
{
    public function index()
    {
        return ProcessSetting::first();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s',
            'filling_prep_duration' => 'required|integer|min:1',
            'mixing_duration' => 'required|integer|min:1',
            'filing_duration' => 'required|integer|min:1',
            'baking_duration' => 'required|integer|min:1',
            'cycles' => 'required|integer|min:1',
        ]);

        $setting = ProcessSetting::create($data);
        return response()->json($setting, 201);
    }

    public function update(Request $request, ProcessSetting $processSetting)
    {
        \Log::info('Updating settings', $request->all());
        $processSetting->update($request->all());
        return response()->json($processSetting, 200);
    }

    public function destroy(ProcessSetting $processSetting)
    {
        $processSetting->delete();
        return response()->noContent();
    }
}
