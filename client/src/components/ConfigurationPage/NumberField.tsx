import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { type LucideIcon } from "lucide-react"

interface NumberFieldProps<T extends object> {
  label?: string
  name: keyof T
  Icon?: LucideIcon
  value: string | number
  className? : string 
  onChange: (field: keyof T, value: string | number) => void
}

export default function NumberField<T extends object>({
  label,
  Icon,
  name,
  value,
  onChange,
  className
}: NumberFieldProps<T>) {

  return (
    <div className={`${className ? className : "w-full flex flex-col gap-3 "}`}>
      <Label htmlFor={String(name)} className="px-1">
        {Icon && <Icon />}
        <p>{label}</p>
      </Label>
      <Input
        type="number"
        id={String(name)}
        value={value}
        onChange={(e) => onChange(name, Number(e.target.value))}
        className="bg-background p-7 border-2 border-primary text-2xl! [&::-webkit-calendar-picker-indicator]:hidden"
      />
    </div>
  )
}
