import type { ProcessSetting, ProcessSettingsStateType } from "@/types/ProcessSettings";

export type ProcessSettingsAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ALL"; payload: ProcessSetting }
  | { type: "UPDATE_SETTINGS"; payload: Partial<ProcessSetting> }
  | { type: "SET_CONFIG_LOAD_STATE"; payload: boolean }
  | { type: "ERROR"; payload: string }
  | { type: "SUCCESS"; payload: string }
  | { type: "RESET_ITERATION";  payload: Partial<ProcessSetting> };

const ProcessSettingsReducer = (
  state: ProcessSettingsStateType,
  action: ProcessSettingsAction
): ProcessSettingsStateType => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload};

    case "SET_ALL":
      return {
        ...state,
        ...action.payload,
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        ...action.payload, 
      };
  
    case "RESET_ITERATION":
      return {
        ...state,
        ...action.payload,
      };
    
    case "SET_CONFIG_LOAD_STATE": {
      return { ...state, isConfigLoaded: action.payload };
    }
 
    case "ERROR":
      return { ...state, isError: true, errorMessage: action.payload };

    case "SUCCESS":
      return { ...state, isError: false, successMessage: action.payload };

    default:
      return state;
  }
};

export default ProcessSettingsReducer;
