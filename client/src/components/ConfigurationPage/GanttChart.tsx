import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,

} from "recharts"

interface CycleData {
  cycleNumber: number
  startTime: string
  endTime: string
  durationSeconds: number
  durationFormatted: string
}

interface GanttChartProps {
  data: CycleData[]
  operationsStart: string
  operationsEnd: string
}

const timeToSeconds = (time: string) => {
  const [h, m, s] = time.split(":").map(Number)
  return h * 3600 + m * 60 + s
}

// ✅ Helper: convert seconds → "hh:mm am/pm"
const secondsToTimeLabel = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const period = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return m > 0 ? `${hour12}:${m.toString().padStart(2, "0")} ${period}` : `${hour12} ${period}`
}

const GanttChart: React.FC<GanttChartProps> = ({ data, operationsStart, operationsEnd }) => {
  const startSeconds = timeToSeconds(operationsStart)
  const endSeconds = timeToSeconds(operationsEnd)

  // ✅ Compute start offset and duration in hours
  const chartData = data.map((cycle) => {
    const start = timeToSeconds(cycle.startTime)
    const end = timeToSeconds(cycle.endTime)
    return {
      cycle: `Cycle ${cycle.cycleNumber}`,
      offset: (start - startSeconds) / 3600, // spacer before start
      duration: (end - start) / 3600, // duration in hours
      label: `${cycle.startTime} → ${cycle.endTime}`,
    }
  })

  const totalHours = (endSeconds - startSeconds) / 3600

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* ✅ X-axis showing actual time labels */}
          <XAxis
            type="number"
            domain={[0, totalHours]}
            tickFormatter={(hourOffset) =>
              secondsToTimeLabel(startSeconds + hourOffset * 3600)
            }
            label={{
              value: "Time of Day",
              position: "insideBottom",
              offset: -5,
            }}
          />

          <YAxis dataKey="cycle" type="category" />

          {/* Invisible offset to shift bar */}
          <Bar dataKey="offset" stackId="a" fill="transparent" />

          {/* Visible bar */}
          <Bar dataKey="duration" stackId="a" fill="var(--primary)" radius={[8, 8, 8, 8]}>
            <LabelList dataKey="label" position="inside" fill="#fff" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GanttChart
