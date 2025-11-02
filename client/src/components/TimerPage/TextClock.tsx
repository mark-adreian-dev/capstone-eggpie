/* eslint-disable react-hooks/exhaustive-deps */
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "../ui/badge";
import type { ClockStatus } from "@/pages/TimerPage";

export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Style {
  borderColor: string;
  backgroundColor: string;
  timerColor: string;
  badgeColor: string;
  labelColor: string;
}

interface TextClockProps {
  status: ClockStatus;
  label: string;
  batch: number;
  isOperationRunning?: boolean;
  time: Time;
  style?: Style;
}

export default function TextClock({
  label,
  batch,
  time,
  style,
}: TextClockProps) {
  return (
    <Card
      className={`w-full h-full border ${style?.borderColor} ${style?.backgroundColor}`}
    >
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          <h1 className={`text-3xl font-black ${style?.labelColor}`}>{label}</h1>
        </CardTitle>
        <CardDescription>
          <Badge className={`px-4 text-lg ${style?.badgeColor}`}>
            Batch {batch}
          </Badge>
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <div className={`text-5xl lg:text-9xl ${style?.timerColor}`}>
          {time.hours.toString().padStart(2, "0")}:
          {time.minutes.toString().padStart(2, "0")}:
          {time.seconds.toString().padStart(2, "0")}
        </div>
      </CardContent>
    </Card>
  );
}
