import { Clock } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";

interface DurationFieldProps<T extends object> {
  label?: string
  value: number; 
  name: keyof T;
  onChange: (field: keyof T, value: string | number) => void;
  maxHours?: number;
}

interface DurationFormat {
  hours: string;
  minutes: string;
  seconds: string;
}

export default function DurationField<T extends object>({
  value,
  name,
  label,
  onChange,
  maxHours = 12,
}: DurationFieldProps<T>) {
  const maxSeconds = maxHours * 3600;

  const [duration, setDuration] = useState<DurationFormat>({
    hours: "0",
    minutes: "0",
    seconds: "0",
  });

  useEffect(() => {
    const h = Math.floor(value / 3600);
    const m = Math.floor((value % 3600) / 60);
    const s = value % 60;

    setDuration({
      hours: h.toString(),
      minutes: m.toString(),
      seconds: s.toString(),
    });
  }, [value]);

  const handleChange = (key: keyof DurationFormat, val: string) => {
    const newDuration = { ...duration, [key]: val };

    // Convert to total seconds
    let totalSeconds =
      Number(newDuration.hours) * 3600 +
      Number(newDuration.minutes) * 60 +
      Number(newDuration.seconds);

    // If exceeds maxSeconds, adjust the changed field
    if (totalSeconds > maxSeconds) {
      switch (key) {
        case "hours":
          newDuration.hours = String(Math.floor(maxSeconds / 3600))
          totalSeconds = maxSeconds;
          break;
        case "minutes": {
          const remainingSecondsAfterHours = maxSeconds - Number(newDuration.hours) * 3600;
          newDuration.minutes = String(Math.floor(remainingSecondsAfterHours / 60))
          totalSeconds = Number(newDuration.hours) * 3600 + Number(newDuration.minutes) * 60;
          break;
        }
        case "seconds": {
          const remainingSecondsAfterHM = maxSeconds - Number(newDuration.hours) * 3600 - Number(newDuration.minutes) * 60;
          newDuration.seconds = String(remainingSecondsAfterHM)
          totalSeconds = maxSeconds;
          break;
        }  
      }
    }

    setDuration(newDuration);
    onChange(name, totalSeconds);
  };

  return (
    <section className="flex flex-col gap-2 w-full mb-4">
      {label && <Badge className="mb-2">
        <Label className="px-1 flex items-center text-lg font-bold gap-3">
          <span>{label}</span>
        </Label>
      </Badge>}
      
      <div className="flex gap-4 w-full">
        {Object.entries(duration).map(([key, val]) => (
          <div className="flex flex-col gap-1 w-full" key={key}>
            <Label className="flex items-center gap-2 font-semibold mb-2">
              <Clock size={16} />
              <span>{key[0].toLocaleUpperCase() + key.slice(1, key.length-1)}/s</span>
            </Label>
            <Input
              type="number"
              min={0}
              value={val}
              onChange={(e) =>
                handleChange(key as keyof DurationFormat, e.target.value)
              }
              className="bg-background p-7 text-2xl! border-2 border-primary"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
