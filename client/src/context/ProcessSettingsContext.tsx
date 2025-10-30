import type { ProcessSetting } from "@/types/ProcessSettings";
import { createContext } from "react";

export interface ProcessSettingsContextInitialValueContext {
  operations_start_time: string
  operations_end_time: string
  filling_prep_duration: number
  mixing_duration: number
  filling_duration: number
  baking_duration: number
  trays_per_cycle: number
  egg_pies_per_tray: number
  current_mixing_iteration: number
  current_baking_iteration: number
  current_filling_iteration: number
  baking_timestamp: number,
  filling_timestamp: number,
  half_day: boolean
  oven_count: number
  cycles: number
  isLoading: boolean
  isError: boolean
  successMessage: string
  errorMessage: string
  loadSettings: () => Promise<void>
  updateSettings: (data: Partial<ProcessSetting>) => Promise<void>
}

export const processSettingsInitialValue: ProcessSettingsContextInitialValueContext = {
  operations_start_time: "00:00:00",
  operations_end_time: "00:00:00",
  filling_prep_duration: 0,
  mixing_duration: 0,
  filling_duration: 0,
  baking_duration: 0,
  trays_per_cycle: 0,
  egg_pies_per_tray: 0,
  oven_count: 0,
  half_day: false,
  current_mixing_iteration: 0,
  current_baking_iteration: 0,
  current_filling_iteration: 0,
  baking_timestamp: 0,
  filling_timestamp: 0,
  cycles: 0,
  isLoading: false,
  isError: false,
  successMessage: "",
  errorMessage: "",
  loadSettings: async () => { },
  updateSettings: async (data: Partial<ProcessSetting>) => {console.log(data)}
};

export const ProcessSettingsContext = createContext<ProcessSettingsContextInitialValueContext>(
  processSettingsInitialValue
);
