import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSeconds(hours: number, minutes: number, seconds?: number) {
  return (hours * 3600) + (minutes * 60) + (seconds ?? 0);
}

export const getCssColor = (name: string) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
}

export function cssColorToRGB(color: string): string {
  try {
    // Chrome, Safari, and modern browsers
    // @ts-expect-error – CSSColorValue is still experimental
    const parsed = new CSSColorValue(color)
    // Convert OKLCH to sRGB if supported
    const srgb = parsed.to("srgb")
    return srgb.toString()
  } catch {
    // Fallback for browsers without CSSColorValue
    const el = document.createElement("div")
    el.style.color = color
    document.body.appendChild(el)
    const computed = getComputedStyle(el).color
    el.remove()
    return computed
  }
}

export function timeToSeconds(time: string): number {
  const [hours, minutes, seconds] = time.split(":").map(Number)
  return hours * 3600 + minutes * 60 + (seconds || 0)
}

export function secondsToTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const formatTimeVerbose = (time: string): string => {
  const [h, m, s] = time.split(":").map(Number);

  const parts: string[] = [];

  if (h > 0) parts.push(`${h}hr${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m}min${m > 1 ? "s" : ""}`);
  if (s > 0) parts.push(`${s}sec${s > 1 ? "s" : ""}`);

  return parts.join(" ");
};

export const formatTo12Hour = (time: string): string => {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const period = hour >= 12 ? "pm" : "am";
  hour = hour % 12 || 12; // convert 0–23 → 12-hour clock

  // Format:
  // - Hide ":00" if minutes = 0
  // - Include ":mm" if minutes > 0
  return minute > 0 ? `${hour}:${minute.toString().padStart(2, "0")} ${period}` : `${hour} ${period}`;
};

export const calculateCycles = (
  operationStartTime: string,
  operationEndTime: string,
  filling_prep_duration: number,
  mixing_duration: number,
  filling_duration: number,
  baking_duration: number,
  trays_per_cycle: number,
  egg_pies_per_tray: number,
  oven_count: number,
  half_day: boolean,
  baking_timestamp: number,
  filling_timestamp: number
) => {
  const timeToSeconds = (t: string) => {
    const [h, m, s] = t.split(":").map(Number)
    return h * 3600 + m * 60 + s
  }

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":")
  }

  const opsStart = timeToSeconds(operationStartTime)
  let opsEnd = timeToSeconds(operationEndTime)

  if (half_day) {
    const duration = opsEnd - opsStart
    opsEnd = opsStart + duration / 2
  }

  const cyclesData: {
    cycleNumber: number
    startTime: string
    endTime: string
    durationSeconds: number
    durationFormatted: string
    phases: {
      mixing: { start: string; end: string }
      filling: { start: string; end: string }
      baking: { start: string; end: string }
    }
  }[] = []

  const ovenTimers = Array(oven_count).fill(opsStart)
  let mixingStart = opsStart
  let cycleNumber = 0
  let traysCompleted = 0

  while (true) {
    cycleNumber++

    // 🧪 Mixing phase
    const mixingEnd = mixingStart + filling_prep_duration + mixing_duration

    // 🕒 Filling starts after `filling_timestamp` from mixing start
    const fillingStart = mixingStart + filling_timestamp
    const fillingEnd = fillingStart + filling_duration

    // 🔥 Baking starts after `baking_timestamp` from filling start
    const bakingStart = fillingStart + baking_timestamp
    const bakingEnd = bakingStart + baking_duration

    // 🏁 Cycle end (for reporting)
    const cycleEnd = bakingEnd

    // Stop if bakingEnd exceeds operation hours
    if (bakingEnd > opsEnd) break

    // 🔹 Allocate trays to ovens (simulate multiple ovens)
    for (let i = 0; i < trays_per_cycle; i++) {
      const ovenIndex = ovenTimers.indexOf(Math.min(...ovenTimers))
      ovenTimers[ovenIndex] =
        Math.max(ovenTimers[ovenIndex], bakingStart) + baking_duration
      traysCompleted++
    }

    // 🔹 Record cycle info with all overlapping phases
    cyclesData.push({
      cycleNumber,
      startTime: formatTime(mixingStart),
      endTime: formatTime(cycleEnd),
      durationSeconds: cycleEnd - mixingStart,
      durationFormatted: formatTime(cycleEnd - mixingStart),
      phases: {
        mixing: { start: formatTime(mixingStart), end: formatTime(mixingEnd) },
        filling: { start: formatTime(fillingStart), end: formatTime(fillingEnd) },
        baking: { start: formatTime(bakingStart), end: formatTime(bakingEnd) },
      },
    })

    // 🔄 Here’s the **key**:
    // Next cycle starts mixing *immediately after previous mixing ends*,
    // not after baking. → Overlapping behavior!
    mixingStart = mixingEnd

    if (mixingStart >= opsEnd) break
  }

  const fullCycles = Math.floor(traysCompleted / trays_per_cycle)
  const eggPiesPerCycle = trays_per_cycle * egg_pies_per_tray
  const totalEggPies = eggPiesPerCycle * oven_count * fullCycles
  
  return {
    fullCycles,
    operationsStart: operationStartTime,
    operationsEnd: formatTime(opsEnd),
    totalEggPies,
    eggPiesPerCycle,
    singleCycleDuration: formatTime(
      filling_prep_duration +
      mixing_duration +
      filling_duration +
      baking_duration
    ),
    cyclesData,
  }
}








