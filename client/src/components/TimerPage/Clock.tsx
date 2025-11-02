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
import type { ClockStatus } from "@/pages/TimerPage";

export interface Time {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ClockProps {
  label: string;
  time: Time;
  initialTime: Time;
  status: ClockStatus;
  batch: number;
}

export default function Clock({
  label,
  time,
  initialTime,
  status,
  batch,
}: ClockProps) {
  const total = toSeconds(initialTime.hours, initialTime.minutes, initialTime.seconds);
  const remaining = toSeconds(time.hours, time.minutes, time.seconds);
  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0;

  const chartConfig = {
    value: { label, color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  const primary = cssColorToRGB(getCssColor("--primary"));
  const secondary = cssColorToRGB(getCssColor("--border"));

  const chartData = [{ name: label, value: progress }];

  const renderLabel = ({ viewBox }: LabelProps) => {
    if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
    return (
      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
        <tspan
          x={viewBox.cx}
          y={viewBox.cy}
          className="fill-primary text-4xl md:text-[18px] lg:text-4xl font-bold"
        >
          {time.hours.toString().padStart(2, "0")}:
          {time.minutes.toString().padStart(2, "0")}:
          {time.seconds.toString().padStart(2, "0")}
        </tspan>
      </text>
    );
  };

  const getStatus = () => {
    if (label === "Mixing") return status.mixingStatus;
    if (label === "Filling") return status.fillingStatus;
    if (label === "Baking") return status.bakingStatus;
  };

  return (
    <Card className="w-full lg:h-full border border-primary">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>
          <h1 className="text-3xl font-black">{label}</h1>
          <Badge>{getStatus()}</Badge>
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
            innerRadius="90%"   // 👈 use percentages instead of fixed px
            outerRadius="150%"  // 👈 fills the container proportionally
          >
            <RadialBar dataKey="value" fill={primary} stackId="a" isAnimationActive={false} />
            <RadialBar dataKey={() => 100 - progress} fill={secondary} stackId="a" />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false}>
              <Label content={renderLabel} />
            </PolarRadiusAxis>
          </RadialBarChart>    
        </ChartContainer>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
