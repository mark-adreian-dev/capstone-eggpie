/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext, useMemo, useEffect, useRef } from "react";
import Clock, { type Time } from "@/components/TimerPage/Clock";
import TextClock from "@/components/TimerPage/TextClock";
import { ProcessSettingsContext } from "@/context/ProcessSettingsContext";
import PushableButton from "@/components/global/PushableButton";
import {
  PlayCircle,
  PauseCircle,
  Recycle,
  Info,
  TriangleAlert,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { toSeconds } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";

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

/** same ClockStatus type you had */
export interface ClockStatus {
  mixingStatus: "Idle" | "In Progress" | "Completed";
  fillingStatus: "Idle" | "In Progress" | "Completed";
  bakingStatus: "Idle" | "In Progress" | "Completed";
  fillingTimestampStatus: "Idle" | "In Progress";
  bakingTimestampStatus: "Idle" | "In Progress";
}

export default function TimerPage() {
  const {
    filling_prep_duration,
    mixing_duration,
    filling_duration,
    baking_duration,
    current_baking_iteration,
    current_mixing_iteration,
    current_filling_iteration,
    cycles,
    updateSettings,
    baking_timestamp,
    filling_timestamp,
    isConfigLoaded
  } = useContext(ProcessSettingsContext);

  const deriveTime = (totalSeconds: number | undefined): Time => {
    const total = totalSeconds ?? 0;
    return {
      hours: Math.floor(total / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  };



  // Derived base durations (immutable references)
  const mixingTime = useMemo(
    () => deriveTime((filling_prep_duration ?? 0) + (mixing_duration ?? 0)),
    [filling_prep_duration, mixing_duration]
  );

  const [mixingIteration, setMixingIteration] = useState(current_mixing_iteration);
  const [fillingIteration, setFillingIteration] = useState(current_filling_iteration);
  const [bakingIteration, setBakingIteration] = useState(current_baking_iteration);

  const fillingTime = useMemo(() => deriveTime(filling_duration), [filling_duration]);
  const bakingTime = useMemo(() => deriveTime(baking_duration), [baking_duration]);
  const fillingTimeStampTime = useMemo(() => deriveTime(filling_timestamp), [filling_timestamp]);
  const bakingTimeStampTime = useMemo(() => deriveTime(baking_timestamp), [baking_timestamp]);

  // State
  const [isOperationRunning, setIsOperationRunning] = useState(false);
  const [mixingClock, setMixingClock] = useState<Time>(mixingTime);
  const [fillingClock, setFillingClock] = useState<Time>(fillingTime);
  const [bakingClock, setBakingClock] = useState<Time>(bakingTime);
  const [fillingTimestampClock, setFillingTimestampClock] = useState<Time>(fillingTimeStampTime);
  const [bakingTimestampClock, setBakingTimestampClock] = useState<Time>(bakingTimeStampTime);

  const [clockStates, setClockStates] = useState<ClockStatus>({
    mixingStatus: "Idle",
    fillingStatus: "Idle",
    bakingStatus: "Idle",
    fillingTimestampStatus: "Idle",
    bakingTimestampStatus: "Idle",
  });

  // Refs to prevent stale closures
  const clockStatesRef = useRef(clockStates);
  const intervalRef = useRef<number | null>(null);
  const bakingClockStartedRef = useRef(false);
  const fillingBatchIncrementedRef = useRef(false);
  const isFillingFirstRenderRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!isConfigLoaded || initializedRef.current) return;

    initializedRef.current = true; // prevent re-run on next refresh

    // Initialize local states from backend values
    setMixingIteration(current_mixing_iteration ?? 1);
    setFillingIteration(current_filling_iteration ?? 1);
    setBakingIteration(current_baking_iteration ?? 1);

    // Sync clocks (not reset them again later)
    setMixingClock(mixingTime);
    setFillingClock(fillingTime);
    setBakingClock(bakingTime);
    setFillingTimestampClock(fillingTimeStampTime);
    setBakingTimestampClock(bakingTimeStampTime);

  }, [isConfigLoaded]);





  // Tick function — advances clocks
  const tick = () => {
    const cs = clockStatesRef.current;

    // === MIXING CLOCK ===
    if (cs.mixingStatus === "In Progress") setMixingClock(prev => decrementTime(prev));

    // === FILLING TIMESTAMP CLOCK ===
    if (cs.fillingTimestampStatus === "In Progress") {
      setFillingTimestampClock(prev => {
        const next = decrementTime(prev);
        if (isZero(next)) {
          setClockStates(prev => ({
            ...prev,
            fillingTimestampStatus: "Idle",
            fillingStatus: "In Progress", // start filling clock now
            bakingTimestampStatus: "In Progress",
          }));
          setFillingClock(fillingTime); // start filling for first batch
          setBakingTimestampClock(bakingTimeStampTime);
        }
        return next;
      });
    }

    // === FILLING CLOCK ===
    if (cs.fillingStatus === "In Progress") setFillingClock(prev => decrementTime(prev));

    // === BAKING TIMESTAMP CLOCK ===
    if (cs.bakingTimestampStatus === "In Progress") {
      setBakingTimestampClock(prev => {
        const next = decrementTime(prev);
        if (isZero(next)) bakingClockStartedRef.current = true; // start bakingClock permanently
        return next;
      });
    }

    // === BAKING CLOCK ===
    if (bakingClockStartedRef.current) setBakingClock(prev => decrementTime(prev));
  };

  useEffect(() => { clockStatesRef.current = clockStates; }, [clockStates]);

  // Centralized timer interval
  useEffect(() => {
    if (!isOperationRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = window.setInterval(() => tick(), 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = null; };
  }, [isOperationRunning]);

  // Clock state transitions
  useEffect(() => {
    const mixLeft = toSeconds(mixingClock.hours, mixingClock.minutes, mixingClock.seconds);
    const fillLeft = toSeconds(fillingClock.hours, fillingClock.minutes, fillingClock.seconds);
    const bakeLeft = toSeconds(bakingClock.hours, bakingClock.minutes, bakingClock.seconds);
    const mixElapsed = toSeconds(mixingTime.hours, mixingTime.minutes, mixingTime.seconds) - mixLeft;
    const fillElapsed = toSeconds(fillingTime.hours, fillingTime.minutes, fillingTime.seconds) - fillLeft;

    setClockStates(prev => ({
      mixingStatus: !isOperationRunning
        ? "Idle"
        : mixingIteration === cycles && mixLeft <= 0
          ? "Completed"
          : "In Progress",

      fillingStatus: !isOperationRunning
        ? "Idle"
        : fillingIteration === cycles && fillLeft <= 0
          ? "Completed"
          : (mixingIteration === 1 && clockStatesRef.current.fillingTimestampStatus === "In Progress")
            ? "Idle" // first batch: wait for timestamp
            : "In Progress", // subsequent batches: run immediately


      bakingStatus: !isOperationRunning
        ? "Idle"
        : bakingIteration === cycles && bakeLeft <= 0
          ? "Completed"
          : bakingClockStartedRef.current
            ? "In Progress"
            : "Idle",

      fillingTimestampStatus: !isOperationRunning
        ? "Idle"
        : prev.mixingStatus === "In Progress" && mixElapsed < (filling_timestamp ?? 0) && mixingIteration <= cycles
          ? "In Progress"
          : "Idle",

      bakingTimestampStatus: !isOperationRunning
        ? "Idle"
        : prev.fillingStatus === "In Progress" && fillElapsed < (baking_timestamp ?? 0) && fillingIteration <= cycles
          ? "In Progress"
          : "Idle",
    }));

  }, [
    mixingClock,
    fillingClock,
    bakingClock,
    mixingIteration,
    fillingIteration,
    bakingIteration,
    cycles,
    mixingTime,
    fillingTime,
    filling_timestamp,
    baking_timestamp,
  ]);

  // Handle clock completions
  useEffect(() => {
    if (isZero(mixingClock) && mixingIteration < cycles) {
      const newMix = mixingIteration + 1;
      setMixingIteration(newMix);
      setMixingClock(mixingTime);
      setFillingTimestampClock(fillingTimeStampTime);
      updateSettings({ current_mixing_iteration: newMix }).catch(() => { });
    }
  }, [mixingClock]);

  //Handle Filling clock behaviour
  useEffect(() => {
    if (isFillingFirstRenderRef.current) {
      isFillingFirstRenderRef.current = false;
      return;
    }

    const totalSeconds = toSeconds(fillingClock.hours, fillingClock.minutes, fillingClock.seconds);
    const fullDuration = toSeconds(fillingTime.hours, fillingTime.minutes, fillingTime.seconds);

    // Reset increment flag when clock is ticking
    if (totalSeconds < fullDuration && totalSeconds > 0) {
      fillingBatchIncrementedRef.current = false;
    }

    // Increment batch every time clock resets to full duration
    if (totalSeconds === fullDuration && !fillingBatchIncrementedRef.current && isOperationRunning) {
     
      setFillingIteration(prev => {
        const newBatch = prev + 1;

        // Update context (deferred to avoid React render warnings)
        setTimeout(() => {
          updateSettings({ current_filling_iteration: newBatch }).catch(() => { });
        }, 0);

        fillingBatchIncrementedRef.current = true;
        return newBatch;
      });
    }
  }, [fillingClock, fillingTime]);

  //Handle Baking clock behaviour
  useEffect(() => {
    if (isZero(bakingClock) && bakingIteration < cycles) {
      const newBake = bakingIteration + 1;
      setBakingIteration(newBake);
      setBakingClock(bakingTime);
      updateSettings({ current_baking_iteration: newBake }).catch(() => { });
    }
  }, [bakingClock]);

  // Controls
  const startOperations = () => {
    console.log(cycles == mixingIteration, cycles, mixingIteration)
    if (cycles == mixingIteration && !isOperationRunning) {
      toast.error("Operation is already completed", { icon: <TriangleAlert /> });
      return
    }

    else if (isOperationRunning) {
      toast.error("Already running", { icon: <TriangleAlert /> });
      return;
    }
    setClockStates(prev => ({
      ...prev,
      mixingStatus: "In Progress",
      fillingTimestampStatus: "In Progress",
    }));
    setMixingClock(prev => decrementTime(prev));
    setFillingTimestampClock(prev => decrementTime(prev));
    setIsOperationRunning(true);
    toast.success("Operations started", { icon: <CheckCircle /> });
  };

  const pauseOperations = () => {
    setIsOperationRunning(false);
    toast.warning("Paused", { icon: <TriangleAlert /> });
  };

  const resetOperations = async () => {
    await updateSettings({ current_mixing_iteration: 1, current_filling_iteration: 1, current_baking_iteration: 1 });
    setIsOperationRunning(false);
    bakingClockStartedRef.current = false;
    fillingBatchIncrementedRef.current = true;
    isFillingFirstRenderRef.current = false
    setMixingIteration(1);
    setFillingIteration(1);
    setBakingIteration(1);
    setMixingClock(mixingTime);
    setFillingClock(fillingTime);
    setBakingClock(bakingTime);
    setFillingTimestampClock(fillingTimeStampTime);
    setBakingTimestampClock(bakingTimeStampTime);
    toast.info("Reset complete", { icon: <Info /> });
  };

  if (!isConfigLoaded) return <LoadingSpinner />

  return (
    <div className="w-full relative">
      <section className="w-full flex flex-col-reverse lg:flex-col">
        {/* Controls */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <PushableButton onClick={startOperations}>
            <PlayCircle /><p>Start</p>
          </PushableButton>
          <PushableButton onClick={pauseOperations}>
            <PauseCircle /><p>Pause</p>
          </PushableButton>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <PushableButton>
                <Recycle /><p>Reset</p>
              </PushableButton>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently reset timers current operation's progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                <AlertDialogAction className="cursor-pointer" onClick={resetOperations}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </section>
        <div>
          {/* Timestamps */}
          <section className="mb-5 w-full grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl">
            <TextClock
              label="Filling starts in:"
              status={clockStates}
              time={fillingTimestampClock}
              batch={mixingIteration}
              isOperationRunning={isOperationRunning}
              style={{
                borderColor: toSeconds(fillingTimestampClock.hours, fillingTimestampClock.minutes, fillingTimestampClock.seconds) === 0 ? "border-primary" : "border-red-700",
                backgroundColor: toSeconds(fillingTimestampClock.hours, fillingTimestampClock.minutes, fillingTimestampClock.seconds) === 0 ? "" : "bg-red-100",
                timerColor: toSeconds(fillingTimestampClock.hours, fillingTimestampClock.minutes, fillingTimestampClock.seconds) === 0 ? "text-primary" : "text-red-800",
                badgeColor: toSeconds(fillingTimestampClock.hours, fillingTimestampClock.minutes, fillingTimestampClock.seconds) === 0 ? "bg-primary" : "bg-red-500",
                labelColor: toSeconds(fillingTimestampClock.hours, fillingTimestampClock.minutes, fillingTimestampClock.seconds) === 0 ? "text-primary" : "text-red-800"
              }}
            />
            <TextClock
              label="Baking starts in:"
              status={clockStates}
              time={bakingTimestampClock}
              batch={fillingIteration}
              isOperationRunning={isOperationRunning}
              style={{
                borderColor: clockStates.fillingStatus !== "In Progress" && clockStates.fillingStatus !== "Completed" ? "border-yellow-300" : toSeconds(bakingTimestampClock.hours, bakingTimestampClock.minutes, bakingTimestampClock.seconds) === 0 ? "border-primary" : "border-red-700",
                backgroundColor: clockStates.fillingStatus !== "In Progress" && clockStates.fillingStatus !== "Completed" ? "bg-yellow-100/20" : toSeconds(bakingTimestampClock.hours, bakingTimestampClock.minutes, bakingTimestampClock.seconds) === 0 ? "" : "bg-red-100",
                timerColor: clockStates.fillingStatus !== "In Progress" && clockStates.fillingStatus !== "Completed" ? "text-yellow-600/20" : toSeconds(bakingTimestampClock.hours, bakingTimestampClock.minutes, bakingTimestampClock.seconds) === 0 ? "text-primary" : "text-red-800",
                badgeColor: clockStates.fillingStatus !== "In Progress" && clockStates.fillingStatus !== "Completed" ? "bg-yellow-600/20 text-yellow-600/20" : toSeconds(bakingTimestampClock.hours, bakingTimestampClock.minutes, bakingTimestampClock.seconds) === 0 ? "bg-primary" : "bg-red-500",
                labelColor: clockStates.fillingStatus != "In Progress" && clockStates.fillingStatus !== "Completed" ? "text-yellow-600/20" : toSeconds(bakingTimestampClock.hours, bakingTimestampClock.minutes, bakingTimestampClock.seconds) === 0 ? "text-primary" : "text-red-800"
              }}
            />
          </section>

          {/* Main Clocks */}
          <section className="w-full  grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Clock label="Mixing" time={mixingClock} initialTime={mixingTime} status={clockStates} batch={mixingIteration} />
            <Clock label="Filling" time={fillingClock} initialTime={fillingTime} status={clockStates} batch={fillingIteration} />
            <Clock label="Baking" time={bakingClock} initialTime={bakingTime} status={clockStates} batch={bakingIteration} />
          </section>
        </div>
        
      </section>
    </div>
  );
}

// helpers
function decrementTime(time: Time): Time {
  const total = toSeconds(time.hours, time.minutes, time.seconds);
  const newTotal = total > 0 ? total - 1 : 0;
  return { hours: Math.floor(newTotal / 3600), minutes: Math.floor((newTotal % 3600) / 60), seconds: newTotal % 60 };
}

function isZero(time: Time) {
  return time.hours === 0 && time.minutes === 0 && time.seconds === 0;
}
