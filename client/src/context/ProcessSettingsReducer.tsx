import type { ProcessSetting, ProcessSettingsStateType } from "@/types/ProcessSettings";

export type ProcessSettingsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ALL"; payload: ProcessSetting }
  | { type: "UPDATE_SETTINGS"; payload: Partial<ProcessSetting> }
  | { type: "ERROR"; payload: string }
  | { type: "SUCCESS"; payload: string };

const ProcessSettingsReducer = (
  state: ProcessSettingsStateType,
  action: ProcessSettingsAction
): ProcessSettingsStateType => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_ALL":
      return {
        ...state,
        ...action.payload, // safe, full object
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        ...action.payload, // Partial<ProcessSetting>, merges only provided fields
      };

    case "ERROR":
      return { ...state, isError: true, errorMessage: action.payload };

    case "SUCCESS":
      return { ...state, isError: false, successMessage: action.payload };

    default:
      return state;
  }
};

export default ProcessSettingsReducer;
