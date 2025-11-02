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
    dispatch({ type: "SET_CONFIG_LOAD_STATE", payload: false });
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
      dispatch({ type: "SET_CONFIG_LOAD_STATE", payload: true });
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
      const responseData: ProcessSetting = response.data
      console.log(responseData.current_filling_iteration)
      dispatch({ type: "UPDATE_SETTINGS", payload: responseData })
    } catch (error) {
      console.log(error)
      toast.error("Failed to load process settings");
      dispatch({ type: "ERROR", payload: "Failed to load process settings" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }

  const resetIterations = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      // 1️⃣ Define the reset payload
      const resetPayload: Partial<ProcessSetting> = {
        current_baking_iteration: 1,
        current_filling_iteration: 1,
        // current_mixing_iteration: 1
      };

      // 2️⃣ Update backend
      const response = await api.put("/api/process-settings/1", resetPayload);
      const responseData: ProcessSetting = response.data;

      // 3️⃣ Update global context state via reducer
      dispatch({ type: "RESET_ITERATION", payload: responseData });

      // 4️⃣ Success feedback
      toast.success("All operations successfully reset.");
      console.log("✅ Backend + context reset successfully:", responseData);
    } catch (error) {
      console.error("❌ Failed to reset operations:", error);
      toast.error("Failed to reset operations.");
      dispatch({ type: "ERROR", payload: "Failed to reset operations" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Auto-load settings when component mounts
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <ProcessSettingsContext.Provider
      value={{
        ...state,
        loadSettings,
        updateSettings,
        resetIterations
      }}
    >
      {children}
    </ProcessSettingsContext.Provider>
  );
};

export default ProcessSettingsState;
