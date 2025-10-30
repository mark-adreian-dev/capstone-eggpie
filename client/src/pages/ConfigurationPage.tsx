import DurationField from "@/components/ConfigurationPage/DurationField"
import TimeField from "@/components/ConfigurationPage/TimeField"
import PushableButton from "@/components/global/PushableButton"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ArrowLeftRightIcon, CakeSlice, CircleCheck, InfoIcon, LucideWashingMachine, RectangleHorizontal, WashingMachineIcon } from "lucide-react"
import { useContext, useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"
import { calculateCycles, formatTimeVerbose, formatTo12Hour, secondsToTime, timeToSeconds } from "@/lib/utils"
import NumberField from "@/components/ConfigurationPage/NumberField"
import SummaryCard from "@/components/ConfigurationPage/SummaryCard"
import { Badge } from "@/components/ui/badge"
import GanttChart from "@/components/ConfigurationPage/GanttChart"
import { ProcessSettingsContext } from "@/context/ProcessSettingsContext"
import LoadingSpinner from "./LoadingSpinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"

interface Configuration {
  operations_start_time: string
  operations_end_time: string
  filling_prep_duration: number
  mixing_duration: number
  filling_duration: number
  baking_duration: number
  trays_per_cycle: number
  egg_pies_per_tray: number
  oven_count: number
  half_day: boolean
  cycles: number
  baking_timestamp: number,
  filling_timestamp: number,
}

interface CycleData {
  cycleNumber: number
  startTime: string
  endTime: string
  durationSeconds: number
  durationFormatted: string
  

}

interface SummaryDataFormat {
  operationsStart: string
  operationsEnd: string
  totalEggPies: number
  eggPiesPerCycle: number
  totalMixingFillingDuration: string
  singleCycleDuration: string
  cyclesData: CycleData[]

}

const ConfigurationPage = () => {
  const location = useLocation()
  const {
    isLoading,
    operations_start_time,
    operations_end_time,
    filling_prep_duration,
    mixing_duration,
    filling_duration,
    baking_duration,
    trays_per_cycle,
    egg_pies_per_tray,
    baking_timestamp,
    filling_timestamp, 
    half_day,
    oven_count,
    cycles,

    updateSettings
  } = useContext(ProcessSettingsContext)


  const [configuration, setConfiguration] = useState<Configuration>({
    operations_start_time: operations_start_time ?? "00:00:00",
    operations_end_time: operations_end_time ?? "00:00:00",
    filling_prep_duration: filling_prep_duration ?? 0,
    mixing_duration: mixing_duration ?? 0,
    filling_duration: filling_duration ?? 0,
    baking_duration: baking_duration ?? 0,
    baking_timestamp: baking_timestamp ?? 0,
    filling_timestamp: filling_timestamp ?? 0,
    trays_per_cycle: trays_per_cycle ?? 0,
    egg_pies_per_tray: egg_pies_per_tray ?? 0,
    oven_count: oven_count ?? 0,
    half_day: half_day ?? false,
    cycles: cycles ?? 0
  })

  const [summaryData, setSummaryData] = useState<SummaryDataFormat>({
    operationsStart: secondsToTime(timeToSeconds(configuration.operations_start_time)),
    operationsEnd: secondsToTime(timeToSeconds(configuration.operations_end_time)),
    totalEggPies: 0,
    eggPiesPerCycle: 0,
    totalMixingFillingDuration: secondsToTime(configuration.filling_prep_duration + configuration.mixing_duration + configuration.filling_duration),
    singleCycleDuration: "",
    cyclesData: []
  })

  useEffect(() => {
    setConfiguration({
      operations_start_time,
      operations_end_time,
      filling_prep_duration,
      mixing_duration,
      filling_duration,
      baking_duration,
      trays_per_cycle,
      egg_pies_per_tray,
      oven_count,
      half_day,
      cycles,
      baking_timestamp,
      filling_timestamp, 
    })
  }, [
    operations_start_time,
    operations_end_time,
    filling_prep_duration,
    mixing_duration,
    filling_duration,
    baking_duration,
    trays_per_cycle,
    half_day,
    egg_pies_per_tray,
    oven_count,
    cycles,
    baking_timestamp,
    filling_timestamp, 
  ])

  useEffect(() => {
    sessionStorage.setItem("current_url", location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const cycleData = calculateCycles(
      configuration.operations_start_time,
      configuration.operations_end_time,
      configuration.filling_prep_duration,
      configuration.mixing_duration,
      configuration.filling_duration,
      configuration.baking_duration,
      configuration.trays_per_cycle,
      configuration.egg_pies_per_tray,
      configuration.oven_count,
      configuration.half_day,
      configuration.baking_timestamp,
      configuration.filling_timestamp, 
    )

    setConfiguration(prev => {
      return {
        ...prev,
        cycles: cycleData.fullCycles 
      }
    })

    setSummaryData(cycleData)
  }, [
    configuration.operations_start_time,
    configuration.operations_end_time,
    configuration.filling_prep_duration,
    configuration.mixing_duration,
    configuration.filling_duration,
    configuration.baking_duration,
    configuration.trays_per_cycle,
    configuration.egg_pies_per_tray,
    configuration.oven_count,
    configuration.half_day,
    configuration.baking_timestamp,
    configuration.filling_timestamp, 
  ])

  const handleChange = (field: keyof Configuration, value: string | number) => {
    setConfiguration((prev) => ({ ...prev, [field]: value }))
  }

  const saveConfigurations = async () => {
    await updateSettings(configuration)
    toast.success("Saved", {
      className: "!text-3xl !border-2 !border-primary !f1lex !items-center !gap-10",
      icon: <CircleCheck className="w-10! h-10!"/>, // adjust size/color here
    })
  }

  if(isLoading) return <LoadingSpinner />

  return (
    <section className="">
     
      <div className="flex gap-5">
        <section className="flex flex-col gap-5 w-[60%] border border-primary rounded-2xl p-7">
          <section className="flex items-center justify-between mb-12">
            <h1 className="text-5xl font-black">Configuration</h1>
          </section>
          <section className="w-full">
            {/* Operation Time */}
            <section className="mb-20">
              <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Label htmlFor="operation-time" className="text-3xl font-bold">
                    Operation's Duration
                  </Label>

                  <Tooltip>
                    <TooltipTrigger asChild className="w-fit cursor-pointer">
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Set operation start and end times as the basis for cycles.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
               

                <div className="flex items-center space-x-2">
                  <Label htmlFor="half-day">Half Day</Label>
                  <Switch
                    id="half-day"
                    className="w-20 h-10 border border-primary/20 [&>span]:w-10 [&>span]:h-10 [&>span]:border [&>span]:border-primary/20 cursor-pointer"
                    checked={configuration.half_day}
                    onCheckedChange={async (val: boolean) => {
                      console.log(val)
                      await updateSettings({ half_day: val });
                      setConfiguration(prevState => {
                        return {
                          ...prevState,
                          half_day: val
                        }
                      })
                    }}
                  />
                </div>
              </div>
              <div id="operation-time" className="flex flex-col gap-5">
                <div className="flex w-full gap-5">
                  <TimeField
                    label="Start Time"
                    name="operations_start_time"
                    value={configuration.operations_start_time}
                    onChange={handleChange}
                  />
                  <TimeField
                    label="End Time"
                    name="operations_end_time"
                    value={configuration.operations_end_time}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex w-full gap-5">
                  <NumberField
                    Icon={WashingMachineIcon}
                    label="Oven Count"
                    name="oven_count"
                    value={configuration.oven_count}
                    onChange={handleChange}
                  />
                  <NumberField
                    Icon={RectangleHorizontal}
                    label="Oven Tray Capacity"
                    name="trays_per_cycle"
                    value={configuration.trays_per_cycle}
                    onChange={handleChange}
                  />
                  <NumberField
                    Icon={CakeSlice}
                    label="Egg pies per tray"
                    name="egg_pies_per_tray"
                    value={configuration.egg_pies_per_tray}
                    onChange={handleChange}
                  />
             
                </div>
              </div>
            </section>
           
            {/* Mixing*/}
            <section className="mb-10">
              <div className="mt-8">
                <div className="mb-6 flex items-center gap-4">
                  <Label htmlFor="mixing-filling-time" className="text-3xl font-bold">
                    Mixing
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild className="w-fit cursor-pointer">
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Set durations for mixing, filling, and preparation steps.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div id="mixing-filling-time" className="flex flex-col gap-5">
                  <DurationField
                    label="Preparation"
                    value={configuration.filling_prep_duration}
                    name="filling_prep_duration"
                    onChange={handleChange}
                  />
                  <DurationField
                    label="Duration"
                    value={configuration.mixing_duration}
                    name="mixing_duration"
                    onChange={handleChange}
                  />       
                </div>
              </div>
            </section>

            {/* Filling*/}
            <section className="mb-10">
              <div className="mt-8">
                <div className="mb-6 flex items-center gap-4">
                  <Label htmlFor="mixing-filling-time" className="text-3xl font-bold">
                    Filling
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild className="w-fit cursor-pointer">
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Set durations for mixing, filling, and preparation steps.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div id="mixing-filling-time" className="flex flex-col gap-5">
                  <DurationField
                    label="Duration"
                    value={configuration.filling_duration}
                    name="filling_duration"
                    onChange={handleChange}
                  />
                  <DurationField
                    label="Filling Timestamp"
                    value={configuration.filling_timestamp}
                    name="filling_timestamp"
                    onChange={handleChange}
                  />
                </div>


                
              </div>
            </section>

            {/* Baking */}
            <section className="mb-20">
              <div className="mt-8">
                <div className="mb-6 flex items-center gap-4">
                  <Label htmlFor="baking-time" className="text-3xl font-bold">
                    Eggpie Baking Duration
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild className="w-fit cursor-pointer">
                      <InfoIcon />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Set duration for baking cycles.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div id="baking-time" className="flex flex-col gap-5">
                  <DurationField
                    value={configuration.baking_duration}
                    name="baking_duration"
                    label="Duration"
                    onChange={handleChange}
                  />
                  <DurationField
                    value={configuration.baking_timestamp}
                    label="Baking Timestamp"
                    name="baking_timestamp"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </section>

            
            <AlertDialog>
              <AlertDialogTrigger className="w-full">
                <PushableButton className="w-full">Save</PushableButton>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Updating your configuration may change how your operations work. Are you sure you want to adjust your configurations?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="cursor-pointer" onClick={saveConfigurations}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </section>
        <section className="w-full h-fit border border-primary rounded-2xl p-7">
          <h1 className="text-5xl font-black mb-10">Summary</h1>
          
          <section>
            <section className="grid grid-cols-2 gap-5 mb-8">
              <SummaryCard
                className="col-span-2"
                label={"Expected Eggpies Output"}
                Icon={CakeSlice}
                value={summaryData.totalEggPies}
              />
              <SummaryCard
                className="col-span-2"
                label={"Expected Eggpies per cycle"}
                Icon={CakeSlice}
                value={summaryData.eggPiesPerCycle}
              />
              <SummaryCard
                label={"Cycles"}
                Icon={ArrowLeftRightIcon}
                value={configuration.cycles}
              />
              <SummaryCard
                label={"Oven Count"}
                Icon={LucideWashingMachine}
                value={configuration.oven_count}
              />
              <SummaryCard
                label={"Oven Tray Capacity"}
                Icon={RectangleHorizontal}
                value={configuration.trays_per_cycle}
              />
              <SummaryCard
                label={"Eggpies Per Tray"}
                Icon={CakeSlice}
                value={configuration.egg_pies_per_tray}
              />

            </section>
            <section className="mb-8">
              <h1 className="text-2xl font-black mb-10">Expected Timeline:</h1>
              <GanttChart
                data={summaryData.cyclesData}
                operationsStart={summaryData.operationsStart}
                operationsEnd={summaryData.operationsEnd} />
            </section>
            <section className="flex flex-col gap-2 mb-8">
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Operation Start:</p>
                <Badge className="text-xl px-4">{formatTo12Hour(summaryData.operationsStart)}</Badge>
              </div>
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Operation End:</p>
                <Badge className="text-xl px-4">{formatTo12Hour(summaryData.operationsEnd)}</Badge>
              </div>
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Total Operation hrs:</p>
                <Badge className="text-xl px-4">{
                  formatTimeVerbose(secondsToTime(timeToSeconds(configuration.operations_end_time) - timeToSeconds(configuration.operations_start_time)))}
                </Badge>
              </div>
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Mixing & Filling Duration:</p>
                <Badge className="text-xl px-4">{
                  formatTimeVerbose(summaryData.totalMixingFillingDuration)}
                </Badge>
              </div>
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Baking Duration:</p>
                <Badge className="text-xl px-4">{
                  formatTimeVerbose(secondsToTime(configuration.baking_duration))}
                </Badge>
              </div>
              <div className="w-full flex items-center justify-between">
                <p className="text-xl font-semibold">Cycle Duration:</p>
                <Badge className="text-xl px-4">{
                  formatTimeVerbose(summaryData.singleCycleDuration)}
                </Badge>
              </div>
            </section>
          </section>    
        </section>
      </div>
      {/* Debug */}
      <pre className="mt-10 text-sm bg-muted p-4 rounded-lg">
        {JSON.stringify({ ...configuration }, null, 2)}
      </pre>
    </section>
  )
}

export default ConfigurationPage
