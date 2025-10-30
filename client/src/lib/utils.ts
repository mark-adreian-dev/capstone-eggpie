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
  console.log("Half-day mode:", half_day);

  const timeToSeconds = (t: string) => {
    const [h, m, s] = t.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
  };

  const opsStart = timeToSeconds(operationStartTime);
  let opsEnd = timeToSeconds(operationEndTime);

  // Handle half-day mode
  if (half_day) {
    const duration = opsEnd - opsStart;
    opsEnd = opsStart + duration / 2;
  }

  // Filling is now handled separately
  const prepTime = filling_prep_duration + mixing_duration;

  const ovenTimers = Array(oven_count).fill(opsStart);
  let currentTime = opsStart;
  let cycleNumber = 0;
  let traysCompleted = 0;

  const cyclesData: {
    cycleNumber: number;
    startTime: string;
    endTime: string;
    durationSeconds: number;
    durationFormatted: string;
  }[] = [];

  while (currentTime < opsEnd) {
    const prepStart = currentTime;
    const mixingStart = prepStart + filling_prep_duration;
    const fillingStart = mixingStart + filling_timestamp;
    const bakingStart = fillingStart + baking_timestamp;
    const cycleEnd = bakingStart + baking_duration;

    // Stop if beyond operation hours
    if (cycleEnd > opsEnd) break;

    // Allocate trays to ovens
    for (let i = 0; i < trays_per_cycle; i++) {
      const ovenIndex = ovenTimers.indexOf(Math.min(...ovenTimers));
      ovenTimers[ovenIndex] = Math.max(ovenTimers[ovenIndex], bakingStart) + baking_duration;
      traysCompleted++;
    }

    cycleNumber++;

    const cycleDuration = cycleEnd - prepStart;

    // ✅ Keep only the fields your interface defines
    cyclesData.push({
      cycleNumber,
      startTime: formatTime(mixingStart), // main process start
      endTime: formatTime(cycleEnd),      // final bake end
      durationSeconds: cycleDuration,
      durationFormatted: formatTime(cycleDuration),
    });

    // Move to next cycle start (after prep + mixing)
    currentTime = prepStart + prepTime;
  }

  const fullCycles = Math.floor(traysCompleted / trays_per_cycle);
  const eggPiesPerCycle = trays_per_cycle * egg_pies_per_tray;

  return {
    fullCycles,
    operationsStart: operationStartTime,
    operationsEnd: formatTime(opsEnd),
    totalEggPies: eggPiesPerCycle * fullCycles * oven_count,
    eggPiesPerCycle,
    totalMixingFillingDuration: formatTime(prepTime + filling_duration),
    singleCycleDuration: formatTime(prepTime + filling_duration + baking_duration),
    cyclesData,
  };
};





