// src/context/processSettings/ProcessSettingsState.tsx
import React, { useReducer, useEffect, type ReactNode } from "react";
import ProcessSettingsReducer from "./ProcessSettingsReducer";
import { ProcessSettingsContext, processSettingsInitialValue } from "./ProcessSettingsContext";
import api from "@/utils/api";
import { toast } from "sonner";
import type { ProcessSetting } from "@/types/ProcessSettings";

interface Props {
  children: ReactNode;
}

const ProcessSettingsState: React.FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(ProcessSettingsReducer, processSettingsInitialValue);

  const loadSettings = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await api.get("/api/process-settings");
      dispatch({ type: "SET_ALL", payload: response.data });
      dispatch({ type: "SUCCESS", payload: "Process settings loaded successfully" });
    } catch (error) {
      console.log(error)
      toast.error("Failed to load process settings");
      dispatch({ type: "ERROR", payload: "Failed to load process settings" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const updateSettings = async (data: Partial<ProcessSetting>) => {
    Object.entries(data).map(([key]) => {
      if (!(Object.entries(data).length === 1 && key === "half_day")) {
        dispatch({ type: "SET_LOADING", payload: true });
      }
    });
   
    try {
      const response = await api.put("/api/process-settings/1", data);
      dispatch({ type: "UPDATE_SETTINGS", payload: response.data })
    } catch (error) {
      console.log(error)
      toast.error("Failed to load process settings");
      dispatch({ type: "ERROR", payload: "Failed to load process settings" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
    

   
  }

  // Auto-load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <ProcessSettingsContext.Provider
      value={{
        ...state,
        loadSettings,
        updateSettings
      }}
    >
      {children}
    </ProcessSettingsContext.Provider>
  );
};

export default ProcessSettingsState;
