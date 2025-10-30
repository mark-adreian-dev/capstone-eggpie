/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../ui/badge";
import type { ClockStatus } from "@/pages/TimerPage";

export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Style{
  borderColor: string
  backgroundColor: string
  timerColor: string
  badgeColor: string
  labelColor:string
}

interface TextClock {
  status: ClockStatus;
  label: string;
  clockType: "FILLING" | "BAKING";
  batch: number;
  initialTime: Time;
  isOperationRunning: boolean;
  setClock: React.Dispatch<React.SetStateAction<Time>>;
  time: Time;
  onIterationComplete?: () => void;
  style?: Style
}

export default function TextClock({
  label,
  status,
  clockType,
  batch,
  initialTime,
  isOperationRunning,
  onIterationComplete,
  style
}: TextClock) {
  const [displayTime, setDisplayTime] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);
  const prevBatchRef = useRef(batch);
  // Reset displayTime when batch changes
  useEffect(() => {
    if (prevBatchRef.current !== batch) {
      setDisplayTime(initialTime);
      prevBatchRef.current = batch;
    }
   
  }, [batch, clockType, initialTime]);

  useEffect(() => {
    const isActive =
      (clockType === "FILLING" && status.fillingTimestampStatus === "In Progress") ||
      (clockType === "BAKING" && status.bakingTimestampStatus === "In Progress");

    // Stop the timer when not active or operation paused
    if (!isActive || !isOperationRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Prevent multiple intervals
    if (intervalRef.current) return;

    intervalRef.current = window.setInterval(() => {
      setDisplayTime(prev => {
        let { hours, minutes, seconds } = prev;

        if (hours === 0 && minutes === 0 && seconds === 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          onIterationComplete?.();
          return { hours: 0, minutes: 0, seconds: 0 };
        }

        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else {
            minutes = 59;
            if (hours > 0) hours--;
          }
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    // Cleanup when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isOperationRunning,
    clockType === "FILLING"
      ? status.fillingTimestampStatus
      : status.bakingTimestampStatus,
    onIterationComplete,
  ]);
  return (
    <Card className={`w-full h-full border ${style?.borderColor} ${style?.backgroundColor}`}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          <h1 className={`text-3xl font-black ${style?.labelColor}`}>{label}</h1>
        </CardTitle>
        <CardDescription>
          <Badge className={`px-4 text-lg ${style?.badgeColor}`}>Batch {batch}</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <div className={`text-9xl ${style?.timerColor}`}>
          {displayTime.hours.toString().padStart(2, "0")}:
          {displayTime.minutes.toString().padStart(2, "0")}:
          {displayTime.seconds.toString().padStart(2, "0")}
        </div>
      </CardContent>
    </Card>
  );
}
