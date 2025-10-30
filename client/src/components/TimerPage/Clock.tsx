import { useEffect, useMemo, useState, useRef } from "react";
import {
  Label,
  RadialBar,
  RadialBarChart,
  PolarRadiusAxis,
  type LabelProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { cssColorToRGB, getCssColor, toSeconds } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { ArrowLeftRight, PauseCircleIcon, PlayCircle } from "lucide-react";
import { Button } from "../ui/button";
import type { ClockStatus } from "@/pages/TimerPage";

export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ClockProps {
  status: ClockStatus;
  label: string;
  time: Time;
  setTime: React.Dispatch<React.SetStateAction<Time>>;
  initialTime: Time;
  batch: number;
  isOperationRunning: boolean;
  onIterationComplete?: () => void;
}

export default function Clock({
  label,
  status,
  time,
  setTime,
  initialTime,
  batch,
  isOperationRunning,
  onIterationComplete,
}: ClockProps) {
  const chartConfig = {
    value: { label, color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const totalSeconds = useMemo(() => {
    const t = toSeconds(initialTime.hours, initialTime.minutes) + initialTime.seconds;
    return isNaN(t) || t <= 0 ? 1 : t; // ✅ prevent division by 0
  }, [initialTime]);

  const [displayTime, setDisplayTime] = useState(time);
  const intervalRef = useRef<number | null>(null);

  // ✅ Sync displayTime when parent resets
  useEffect(() => {
    setDisplayTime(time);
  }, [time]);

  const elapsedSeconds = useMemo(() => {
    const t =
      totalSeconds -
      (toSeconds(displayTime.hours, displayTime.minutes) + displayTime.seconds);
    return isNaN(t) || t < 0 ? 0 : t;
  }, [displayTime, totalSeconds]);

  const progress = useMemo(() => {
    const p = (elapsedSeconds / totalSeconds) * 100;
    return isNaN(p) || !isFinite(p) ? 0 : Math.min(100, Math.max(0, p)); // ✅ safe value
  }, [elapsedSeconds, totalSeconds]);

  const primary = useMemo(() => cssColorToRGB(getCssColor("--primary")), []);
  const secondary = useMemo(() => cssColorToRGB(getCssColor("--border")), []);

  const chartData = useMemo(
    () => [{ name: label, track: 100, value: progress }],
    [label, progress]
  );

 
  // ⏱ Timer logic
  useEffect(() => {
    const active =
      (label === "Mixing" && status.mixingStatus === "In Progress") ||
      (label === "Filling" && status.fillingStatus === "In Progress") ||
      (label === "Baking" && status.bakingStatus === "In Progress");

    if (!active || !isOperationRunning) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayTime((prev) => {
        const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;

        if (total <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setTimeout(() => onIterationComplete?.(), 0);
          return prev;
        }

        const newTotal = total - 1;
        return {
          hours: Math.floor(newTotal / 3600),
          minutes: Math.floor((newTotal % 3600) / 60),
          seconds: newTotal % 60,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isOperationRunning, label, status, onIterationComplete]);

  // ✅ Sync back to parent only *after* displayTime changes
  useEffect(() => {
    setTime(displayTime);
  }, [displayTime, setTime]);


  const resetClock = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setTime(initialTime);
    setDisplayTime(initialTime);
  };

  const pauseClock = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const continueClock = () => {
    if (!intervalRef.current && isOperationRunning) {
      // restart countdown from current time
      intervalRef.current = window.setInterval(() => {
        setDisplayTime((prev) => {
          const total = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;
          if (total <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            setTimeout(() => onIterationComplete?.(), 0);
            return prev;
          }
          const newTotal = total - 1;
          const newTime: Time = {
            hours: Math.floor(newTotal / 3600),
            minutes: Math.floor((newTotal % 3600) / 60),
            seconds: newTotal % 60,
          };
          setTime(newTime);
          return newTime;
        });
      }, 1000);
    }
  };

  const renderLabel = useMemo(() => {
    return ({ viewBox }: LabelProps) => {
      if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
      return (
        <text
          x={viewBox.cx}
          y={viewBox.cy}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          <tspan
            x={viewBox.cx}
            y={viewBox.cy}
            className="fill-primary text-4xl font-bold"
          >
            {displayTime.hours.toString().padStart(2, "0")}:
            {displayTime.minutes.toString().padStart(2, "0")}:
            {displayTime.seconds.toString().padStart(2, "0")}
          </tspan>
        </text>
      );
    };
  }, [displayTime]);



  return (
    <Card className="w-full h-full border border-primary">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          <h1 className="text-3xl font-black">{label}</h1>
          <Badge>
            {label === "Baking" && status.bakingStatus}
            {label === "Mixing" && status.mixingStatus}
            {label === "Filling" && status.fillingStatus}
          </Badge>
        </CardTitle>
        <CardDescription>
          <Badge className="px-4 text-lg">Batch {batch}</Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer config={chartConfig}>
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={123}
            outerRadius={190}
          >
            {/* Foreground progress */}
            <RadialBar
              dataKey="value"
              fill={primary}
              isAnimationActive
              animationDuration={100}
              stackId="a"
            />
            {/* Background track */}
            <RadialBar
              dataKey={() => 100 - progress}
              fill={secondary}
              isAnimationActive
              animationDuration={0}
              stackId="a"
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false}>
              <Label
                content={renderLabel}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={continueClock}
          className="text-primary bg-transparent hover:bg-primary/10"
        >
          <PlayCircle className="w-5 h-5 mr-2" />
          Continue
        </Button>
        <Button
          onClick={pauseClock}
          className="text-primary bg-transparent hover:bg-primary/10"
        >
          <PauseCircleIcon className="w-5 h-5 mr-2" />
          Pause
        </Button>
        <Button
          onClick={resetClock}
          className="text-primary bg-transparent hover:bg-primary/10"
        >
          <ArrowLeftRight className="w-5 h-5 mr-2" />
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}


