import DurationField from "@/components/ConfigurationPage/DurationField"
import TimeField from "@/components/ConfigurationPage/TimeField"
import PushableButton from "@/components/global/PushableButton"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeftRightIcon,
  CakeSlice,
  CircleCheck,
  InfoIcon,
  LucideWashingMachine,
  RectangleHorizontal,
  WashingMachineIcon,
} from "lucide-react"
import { useContext, useEffect, useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { toast } from "sonner"
import {
  calculateCycles,
  formatTimeVerbose,
  formatTo12Hour,
  secondsToTime,
  timeToSeconds,
} from "@/lib/utils"
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
import { useDeferredValue } from "react"
import LadyWithBox from "@/assets/lady-with-box.svg"


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
  isChartVisible: boolean
  baking_timestamp: number
  maxChartBarVisible: number
  filling_timestamp: number
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
    updateSettings,
    resetIterations
  } = useContext(ProcessSettingsContext)

  // 🔹 Local configuration state
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
    isChartVisible: true,
    maxChartBarVisible: 15,
    cycles: cycles ?? 0,
  })

  // 🔹 Sync context changes into local state (only when context changes)
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
      isChartVisible: configuration.isChartVisible,
      maxChartBarVisible: configuration.maxChartBarVisible,
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
    egg_pies_per_tray,
    oven_count,
    half_day,
    cycles,
    configuration.isChartVisible,
    configuration.maxChartBarVisible,
    baking_timestamp,
    filling_timestamp,
  ])

  // 🔹 Store URL for navigation restore
  useEffect(() => {
    sessionStorage.setItem("current_url", location.pathname)
  }, [location.pathname])

  // ✅ Use deferred configuration to smooth out UI lag
  const deferredConfig = useDeferredValue(configuration)

  // ✅ Skip heavy calculations if durations are all zero
  const summaryData = useMemo(() => {
    const {
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
      baking_timestamp,
      filling_timestamp,
    } = deferredConfig

    const allZero =
      filling_prep_duration === 0 &&
      mixing_duration === 0 &&
      filling_duration === 0 &&
      baking_duration === 0

    if (allZero) {
      return {
        totalEggPies: 0,
        eggPiesPerCycle: 0,
        fullCycles: 0,
        singleCycleDuration: 0,
        operationsStart: operations_start_time,
        operationsEnd: operations_end_time,
        cyclesData: [],
      }
    }

    return calculateCycles(
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
      baking_timestamp,
      filling_timestamp
    )
  }, [deferredConfig])


  // 🔹 Derived values (memoized for render performance)
  const totalOperationSeconds = useMemo(() => {
    return (
      timeToSeconds(configuration.operations_end_time) -
      timeToSeconds(configuration.operations_start_time)
    )
  }, [configuration.operations_start_time, configuration.operations_end_time])

  // 🔹 Field handler
  const handleChange = (field: keyof Configuration, value: string | number) => {
    setConfiguration((prev) => {
      // Step 1: Update base configuration
      const updated = { ...prev, [field]: value }

      // Step 3: Recalculate cycles based on the *newly updated* config
      const recalculated = calculateCycles(
        updated.operations_start_time,
        updated.operations_end_time,
        updated.filling_prep_duration,
        updated.mixing_duration,
        updated.filling_duration,
        updated.baking_duration,
        updated.trays_per_cycle,
        updated.egg_pies_per_tray,
        updated.oven_count,
        updated.half_day,
        updated.baking_timestamp,
        updated.filling_timestamp
      )

      updated.cycles = recalculated.fullCycles
      return updated
    })
  }



  // 🔹 Save handler (only triggers context + toast)
  const saveConfigurations = async () => {
    const recalculated = calculateCycles(
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
      configuration.filling_timestamp
    )

    const finalConfig = { ...configuration, cycles: recalculated.fullCycles }
    console.log( finalConfig)
    await updateSettings(finalConfig)
    await resetIterations()
    toast.success("Saved", {
      className:
        "!text-3xl !border-2 !border-primary !flex !items-center !gap-10",
      icon: <CircleCheck className="w-10 h-10" />,
    })
  }


  if (isLoading) return <LoadingSpinner />


  return (
    <section>
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left Section - Configuration */}
        <section className="flex flex-col gap-5 w-full lg:w-[60%] border border-primary rounded-2xl p-7">
          <section className="flex items-center justify-between mb-12">
            <h1 className="text-5xl font-black">Configuration</h1>
          </section>

          {/* Operation Time */}
          <section className="mb-20">
            <div className="mb-6 flex justify-between items-center">
              <div className="flex flex-col items-start lg:flex-row lg:items-center gap-4">
                <Label htmlFor="operation-time" className="text-3xl font-bold">
                  Operation's Duration
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild className="w-fit cursor-pointer">
                    <InfoIcon />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px]">
                    <p>
                      Set operation start and end times as the basis for cycles.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="half-day">Half Day</Label>
                <Switch
                  id="half-day"
                  className="w-20 h-10 border border-primary/20 [&>span]:w-10 [&>span]:h-10 [&>span]:border [&>span]:border-primary/20 cursor-pointer"
                  checked={configuration.half_day}
                  onCheckedChange={(val: boolean) =>
                    setConfiguration((prev) => ({ ...prev, half_day: val }))
                  }
                />
              </div>
            </div>

            <div id="operation-time" className="flex flex-col gap-5">
              <div className="flex flex-col lg:flex-row w-full gap-5">
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

          {/* Mixing */}
          <section className="mb-10">
            <Label className="text-3xl font-bold mb-6">Mixing</Label>
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
          </section>

          {/* Filling */}
          <section className="mb-10">
            <Label className="text-3xl font-bold mb-6">Filling</Label>
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
          </section>

          {/* Baking */}
          <section className="mb-20">
            <Label className="text-3xl font-bold mb-6">
              Eggpie Baking Duration
            </Label>
            <DurationField
              label="Duration"
              value={configuration.baking_duration}
              name="baking_duration"
              onChange={handleChange}
            />
            <DurationField
              label="Baking Timestamp"
              value={configuration.baking_timestamp}
              name="baking_timestamp"
              onChange={handleChange}
            />
          </section>

          {/* Save */}
          <AlertDialog>
            <AlertDialogTrigger className="w-full">
              <PushableButton className="w-full">Save</PushableButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  Updating your configuration may change how your operations
                  work. Are you sure you want to adjust your configurations?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="cursor-pointer"
                  onClick={saveConfigurations}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>

        {/* Right Section - Summary */}
        <section className="w-full h-fit border border-primary rounded-2xl p-7">
          <div className="flex flex-col gap-10 md:flex-row items-start justify-between mb-10">
            <h1 className="text-5xl font-black ">Summary</h1>
            <div className="flex flex-col items-end gap-5 w-fit">
              <div className="flex items-center gap-5">
                <Label>Max Barchart</Label>
                <NumberField
                  className="w-[150px]"
                  name="maxChartBarVisible"
                  value={configuration.maxChartBarVisible}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-5 w-full">
                <Label htmlFor="chart-visible">Chart Visible</Label>
                <Switch
                  id="chart-visible"
                  className="w-20 h-10 border border-primary/20 [&>span]:w-10 [&>span]:h-10 [&>span]:border [&>span]:border-primary/20 cursor-pointer"
                  checked={configuration.isChartVisible}
                  onCheckedChange={(val: boolean) =>
                    setConfiguration((prev) => ({ ...prev, isChartVisible: val }))
                  }
                />
              </div>
              
            </div>
          </div>
            
          <section className="grid grid-cols-2 gap-5 mb-8">
            <SummaryCard
              className="col-span-2"
              label="Expected Eggpies Output"
              Icon={CakeSlice}
              value={summaryData.totalEggPies}
            />
            <SummaryCard
              className="col-span-2"
              label="Expected Eggpies per cycle"
              Icon={CakeSlice}
              value={summaryData.eggPiesPerCycle}
            />
            <SummaryCard
              label="Cycles"
              Icon={ArrowLeftRightIcon}
              value={summaryData.fullCycles}
            />
            <SummaryCard
              label="Oven Count"
              Icon={LucideWashingMachine}
              value={configuration.oven_count}
            />
            <SummaryCard
              label="Oven Tray Capacity"
              Icon={RectangleHorizontal}
              value={configuration.trays_per_cycle}
            />
            <SummaryCard
              label="Eggpies Per Tray"
              Icon={CakeSlice}
              value={configuration.egg_pies_per_tray}
            />
          </section>

          <section className="mb-8">
            {configuration.isChartVisible &&
              <div>
                {
                  summaryData.cyclesData.length > configuration.maxChartBarVisible ?
                    <div className="w-full flex flex-col justify-center items-center py-10">
                      <img src={LadyWithBox} alt="lady-with-box" className="h-[300px] mb-4" />
                      <p className="text-2xl max-w-[350px] text-center">Due to excessive cycle count, chart is cannot be  displayed</p>
                    </div> :
                    <div>
                      <h1 className="text-2xl font-black mb-10">Expected Timeline:</h1>
                      <GanttChart
                        data={summaryData.cyclesData}
                        operationsStart={summaryData.operationsStart}
                        operationsEnd={summaryData.operationsEnd}
                      />
                    </div>
                }
     
              </div>
            }
            
            
          </section>

          <section className="flex flex-col gap-2 mb-8">
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Operation Start:</p>
              <Badge className="text-xl px-4">
                {formatTo12Hour(summaryData.operationsStart)}
              </Badge>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Operation End:</p>
              <Badge className="text-xl px-4">
                {formatTo12Hour(summaryData.operationsEnd)}
              </Badge>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Total Operation hrs:</p>
              <Badge className="text-xl px-4">
                {formatTimeVerbose(secondsToTime(totalOperationSeconds))}
              </Badge>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Mixing & Filling Duration:</p>
              <Badge className="text-xl px-4">
                {formatTimeVerbose(
                  secondsToTime(
                    configuration.filling_prep_duration +
                    configuration.mixing_duration +
                    configuration.filling_duration
                  )
                )}
              </Badge>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Baking Duration:</p>
              <Badge className="text-xl px-4">
                {formatTimeVerbose(
                  secondsToTime(configuration.baking_duration)
                )}
              </Badge>
            </div>
            <div className="w-full flex items-center justify-between">
              <p className="text-xl font-semibold">Cycle Duration:</p>
              <Badge className="text-xl px-4">
                {formatTimeVerbose(summaryData.singleCycleDuration.toString())}
              </Badge>
            </div>
          </section>
        </section>
      </div>

      {/* Debug (only during development) */}

      <pre className="mt-10 text-sm bg-muted p-4 rounded-lg">
        {JSON.stringify(configuration, null, 2)}
      </pre>

    </section>
  )
}

export default ConfigurationPage
