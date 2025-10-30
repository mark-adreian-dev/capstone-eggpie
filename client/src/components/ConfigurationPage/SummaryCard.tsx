import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Label } from "../ui/label"

interface SummaryCardProps {
  label: string
  Icon: LucideIcon
  value: number
  valueLabel?: string
  className?: string
}

export default function SummaryCard({ label, Icon, value, valueLabel, className }: SummaryCardProps) {
  return (
    <Card className={`border border-primary ${className}`}>
      <CardContent className="flex flex-col justify-center items-center ">
        <p className="text-4xl font-black">{value}{valueLabel}</p>
        <Label>
          <Icon />
          <p className="text-lg">{label}</p>
        </Label>
        
      </CardContent>
    </Card>
  )
}
