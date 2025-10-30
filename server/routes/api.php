<?php

use App\Http\Controllers\{
  OperationController,
  ProcessSettingController,
  OvenController,
  BatchProcessController,
  BatchActivityController
};

Route::apiResource('operations', OperationController::class);
Route::apiResource('process-settings', ProcessSettingController::class);
Route::apiResource('ovens', OvenController::class);
Route::apiResource('batches', BatchProcessController::class);
Route::apiResource('activities', BatchActivityController::class);
