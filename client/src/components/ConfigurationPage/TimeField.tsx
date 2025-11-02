import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Clock } from "lucide-react"
import { timeToSeconds } from "@/lib/utils"

interface TimeFieldProps<T extends object> {
  label: string
  name: keyof T
  value: string | number
  valueFormatToSeconds?: boolean, 
  onChange: (field: keyof T, value: string | number) => void // ✅ allow number too
}

export default function TimeField<T extends object>({
  label,
  name,
  value,
  valueFormatToSeconds,
  onChange,
}: TimeFieldProps<T>) {


  return (
    <div className="flex flex-col gap-3 w-full">
      <Label htmlFor={String(name)} className="px-1">
        <Clock />
        <p>{label}</p>
      </Label>
      <Input
        type="time"
        id={String(name)}
        step="1"
        lang="en-GB"
        value={value}
        onChange={(e) => onChange(name, valueFormatToSeconds ? timeToSeconds(e.target.value) : e.target.value)}
        className="bg-background p-7 border-2 border-primary text-2xl! [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </div>
  )
}
