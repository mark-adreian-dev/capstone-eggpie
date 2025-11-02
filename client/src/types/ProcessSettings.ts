export interface ProcessSetting {
  operations_start_time: string;
  operations_end_time: string;
  filling_prep_duration: number;
  mixing_duration: number;
  filling_duration: number;
  baking_duration: number;
  trays_per_cycle: number;
  egg_pies_per_tray: number;
  oven_count: number;
  current_baking_iteration: number
  current_mixing_iteration: number
  current_filling_iteration: number
  baking_timestamp: number,
  filling_timestamp: number,
  isConfigLoaded: boolean,
  cycles: number;
  half_day: boolean
}

export interface ProcessSettingsStateType extends ProcessSetting {
  isLoading: boolean;
  isError: boolean;
  successMessage: string;
  errorMessage: string;
}