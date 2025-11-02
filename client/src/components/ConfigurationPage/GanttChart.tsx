import React from "react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Cell,
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

// ✅ Convert seconds → "hh:mm am/pm"
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

  // ✅ Build chart data for each cycle
  const chartData = data.map((cycle) => {
    const start = timeToSeconds(cycle.startTime)
    const end = timeToSeconds(cycle.endTime)
    return {
      cycle: `Cycle ${cycle.cycleNumber}`,
      offset: (start - startSeconds) / 3600, // spacer before start
      duration: (end - start) / 3600, // duration in hours
      label: `${cycle.startTime} → ${cycle.endTime}`,
      isExcess: false,
    }
  })

  // ✅ Check for overflow (actual end > operations end)
  const actualEndSeconds = Math.max(...data.map((c) => timeToSeconds(c.endTime)))
  const excessSeconds = Math.max(0, actualEndSeconds - endSeconds)

  // ✅ Add a red overflow bar if there's excess time
  if (excessSeconds > 0) {
    chartData.push({
      cycle: "Excess Time",
      offset: (endSeconds - startSeconds) / 3600, // starts right after operationsEnd
      duration: excessSeconds / 3600,
      label: `+${excessSeconds}s overflow`,
      isExcess: true,
    })
  }

  // ✅ Extend chart domain if overflow exists
  const totalHours = Math.max(
    (endSeconds - startSeconds) / 3600,
    (actualEndSeconds - startSeconds) / 3600
  )

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
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

          {/* Invisible offset for spacing */}
          <Bar dataKey="offset" stackId="a" fill="transparent" />

          {/* Visible duration bar */}
          <Bar dataKey="duration" stackId="a" radius={[8, 8, 8, 8]}>
            <LabelList dataKey="label" position="inside" fill="#fff" />
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isExcess ? "#ef4444" : "var(--primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GanttChart
