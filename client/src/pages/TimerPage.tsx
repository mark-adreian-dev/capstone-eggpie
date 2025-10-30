import { useState, useContext, useMemo, useEffect } from "react";
import Clock, { type Time } from "@/components/TimerPage/Clock";
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
import TextClock from "@/components/TimerPage/TextClock";

export interface ClockStatus {
  mixingStatus: "Idle" | "In Progress" | "Completed";
  bakingStatus: "Idle" | "In Progress" | "Completed";
  fillingStatus: "Idle" | "In Progress" | "Completed";
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
  } = useContext(ProcessSettingsContext);

  const deriveTime = (totalSeconds: number | undefined): Time => {
    const total = totalSeconds ?? 0;
    return {
      hours: Math.floor(total / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    };
  };

  // Derived times
  const mixingTime = useMemo(() => deriveTime((filling_prep_duration ?? 0) + (mixing_duration ?? 0)), [filling_prep_duration, mixing_duration]);
  const bakingTime = useMemo(() => deriveTime(baking_duration), [baking_duration]);
  const fillingTime = useMemo(() => deriveTime(filling_duration), [filling_duration]);
  const fillingTimeStampTime = useMemo(() => deriveTime(filling_timestamp), [filling_timestamp]);
  const bakingTimeStampTime = useMemo(() => deriveTime(baking_timestamp), [baking_timestamp]);

  // States
  const [isOperationRunning, setIsOperationRunning] = useState(false);
  const [mixingIteration, setMixingIteration] = useState(current_mixing_iteration);
  const [bakingIteration, setBakingIteration] = useState(current_baking_iteration);
  const [fillingIteration, setFillingIteration] = useState(current_filling_iteration);

  const [mixingClock, setMixingClock] = useState<Time>(mixingTime);
  const [bakingClock, setBakingClock] = useState<Time>(bakingTime);
  const [fillingClock, setFillingClock] = useState<Time>(fillingTime);
  const [fillingTimestampClock, setFillingTimestampClock] = useState<Time>(fillingTimeStampTime);
  const [bakingTimestampClock, setBakingTimestampClock] = useState<Time>(bakingTimeStampTime);

  const [clockStates, setClockStates] = useState<ClockStatus>({
    mixingStatus: "Idle",
    bakingStatus: "Idle",
    fillingStatus: "Idle",
    fillingTimestampStatus: "Idle",
    bakingTimestampStatus: "Idle",
  });

  
  const [, setCycleNotifications] = useState({
    mixing: false,
    filling: false,
    baking: false,
  });

  const [pendingIteration, setPendingIteration] = useState<{ type: "MIXING" | "FILLING" | "BAKING"; next: number } | null>(null);

  // Update only when its own duration changes
  useEffect(() => setMixingClock(mixingTime), [mixingTime]);
  useEffect(() => setFillingClock(fillingTime), [fillingTime]);
  useEffect(() => setBakingClock(bakingTime), [bakingTime]);

  // Sync iterations with context
  useEffect(() => setMixingIteration(current_mixing_iteration), [current_mixing_iteration]);
  useEffect(() => setFillingIteration(current_filling_iteration), [current_filling_iteration]);
  useEffect(() => setBakingIteration(current_baking_iteration), [current_baking_iteration]);


  //Clock State Manager
  useEffect(() => {
    const mixingLeft = toSeconds(mixingClock.hours, mixingClock.minutes, mixingClock.seconds);
    const fillingLeft = toSeconds(fillingClock.hours, fillingClock.minutes, fillingClock.seconds);
    const bakingLeft = toSeconds(bakingClock.hours, bakingClock.minutes, bakingClock.seconds);

    const mixingElapsed = toSeconds(mixingTime.hours, mixingTime.minutes, mixingTime.seconds) - mixingLeft;
    const fillingElapsed = toSeconds(fillingTime.hours, fillingTime.minutes, fillingTime.seconds) - fillingLeft;

    setClockStates(prevState => {
      return {
        // 🧁 MIXING — always runs when started
        mixingStatus:
          !isOperationRunning
            ? "Idle"
            : mixingIteration === cycles && mixingLeft <= 0
              ? "Completed"
              : "In Progress",

        // 🍥 FILLING — starts after mixing timestamp reaches 0
        fillingStatus:
          !isOperationRunning
            ? "Idle"
            : fillingIteration === cycles && fillingLeft <= 0
              ? "Completed"
              : (mixingElapsed >= (filling_timestamp ?? 0) || mixingIteration > 1)
                ? "In Progress"
                : "Idle",

        // 🍞 BAKING — starts ONLY when fillingClock is active and its timestamp reaches 0
        bakingStatus:
          !isOperationRunning
            ? "Idle"
            : bakingIteration === cycles && bakingLeft <= 0
              ? "Completed"
              : (
                // Filling must already be running
                (prevState.fillingStatus === "In Progress" &&
                  fillingElapsed >= (baking_timestamp ?? 0)) ||
                fillingIteration > 1 // allow parallel after first
              )
                ? "In Progress"
                : "Idle",

        // 🕒 FILLING TIMESTAMP — runs during mixing only
        fillingTimestampStatus:
          !isOperationRunning
            ? "Idle"
            : mixingElapsed < (filling_timestamp ?? 0) &&
              mixingIteration <= cycles
              ? "In Progress"
              : "Idle",

        // 🕒 BAKING TIMESTAMP — runs during filling only (✅ fixed)
        bakingTimestampStatus:
          !isOperationRunning
            ? "Idle"
            : prevState.fillingStatus === "In Progress" &&
              fillingElapsed < (baking_timestamp ?? 0) &&
              fillingIteration <= cycles
              ? "In Progress"
              : "Idle",
      }
    });
  }, [
    isOperationRunning,
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
    clockStates.fillingStatus, // important dependency
  ]);




  // Handle pending iteration
  useEffect(() => {
    if (!pendingIteration) return;
    const { type, next } = pendingIteration;

    if (type === "MIXING") setMixingIteration(next);
    if (type === "FILLING") setFillingIteration(next);
    if (type === "BAKING") setBakingIteration(next);

    updateSettings({
      current_mixing_iteration: type === "MIXING" ? next : undefined,
      current_filling_iteration: type === "FILLING" ? next : undefined,
      current_baking_iteration: type === "BAKING" ? next : undefined,
    });

    setPendingIteration(null);
  }, [pendingIteration, updateSettings]);

  // Controls
  const startOperations = () => {
    if (mixingIteration === cycles && bakingIteration === cycles && fillingIteration === cycles) {
      toast.error("All operations completed", { icon: <Info /> });
      return;
    }
    if (isOperationRunning) {
      toast.error("Operations already running", { icon: <CheckCircle /> });
      return;
    }
    setIsOperationRunning(true);
    toast.success("Clocks started", { icon: <CheckCircle /> });
  };

  const pauseOperations = () => {
    setIsOperationRunning(false);
    toast.warning("Clocks paused", { icon: <TriangleAlert /> });
  };

  const resetOperations = async () => {
    setIsOperationRunning(false);
    setMixingIteration(1);
    setFillingIteration(1);
    setBakingIteration(1);
    setCycleNotifications({ mixing: false, filling: false, baking: false });
    setMixingClock(mixingTime);
    setBakingClock(bakingTime);
    setFillingClock(fillingTime);
    setFillingTimestampClock(fillingTimeStampTime);
    setBakingTimestampClock(bakingTimeStampTime);
    await updateSettings({ current_mixing_iteration: 1, current_baking_iteration: 1, current_filling_iteration: 1 });
    toast.info("Clocks reset", { icon: <Info /> });
  };

  const handleIterationComplete = (type: "MIXING" | "FILLING" | "BAKING") => {
    if (type === "MIXING") {
      // Only reset Mixing & prepare next process (Filling timestamp)
      setMixingClock(mixingTime);
      setFillingTimestampClock(fillingTimeStampTime);
      setClockStates(prev => ({ ...prev, fillingTimestampStatus: "In Progress" }));
      setPendingIteration({ type, next: mixingIteration + 1 });
    }

    if (type === "FILLING") {
      // Only reset Filling & prepare next process (Baking timestamp)
      setFillingClock(fillingTime);
      setBakingTimestampClock(bakingTimeStampTime);
      setClockStates(prev => ({ ...prev, bakingTimestampStatus: "In Progress" }));
      setPendingIteration({ type, next: fillingIteration + 1 });
    }

    if (type === "BAKING") {
      // Only reset Baking clock
      setBakingClock(bakingTime);
      setPendingIteration({ type, next: bakingIteration + 1 });
    }
  };


  return (
    <div className="w-full relative">
      <section className="w-full">
        <section className="w-full grid grid-cols-3 gap-4 mb-4">
          <PushableButton onClick={startOperations}>
            <PlayCircle />
            <p>Start</p>
          </PushableButton>
          <PushableButton onClick={pauseOperations}>
            <PauseCircle />
            <p>Pause</p>
          </PushableButton>
          <PushableButton onClick={resetOperations}>
            <Recycle />
            <p>Reset</p>
          </PushableButton>
        </section>
        <section className="mb-5 w-full grid grid-cols-2 gap-4 rounded-xl">
          <TextClock
            setClock={setFillingTimestampClock}
            status={clockStates}
            label="Filling starts in:"
            clockType="FILLING"
            time={fillingTimestampClock}
            initialTime={fillingTimeStampTime}
            batch={mixingIteration}
            isOperationRunning={isOperationRunning}
            style={{
              borderColor: clockStates.fillingTimestampStatus === "In Progress" ? "border-red-500" : "border-primary",
              backgroundColor: clockStates.fillingTimestampStatus === "In Progress" ? "bg-red-100" : "",
              badgeColor: clockStates.fillingTimestampStatus === "In Progress" ? "bg-red-700" : "",
              timerColor: clockStates.fillingTimestampStatus === "In Progress" ? "text-red-800" : "",
              labelColor: clockStates.fillingTimestampStatus === "In Progress" ? "text-red-800" : "",
            }}
          />
          <TextClock
            setClock={setBakingTimestampClock}
            status={clockStates}
            label="Baking starts in:"
            clockType="BAKING"
            time={bakingTimestampClock}
            initialTime={bakingTimeStampTime}
            batch={fillingIteration}
            isOperationRunning={isOperationRunning}
            style={{
              borderColor: clockStates.bakingTimestampStatus === "In Progress" ? "border-red-500" : "border-primary",
              backgroundColor: clockStates.bakingTimestampStatus === "In Progress" ? "bg-red-100" : "",
              badgeColor: clockStates.bakingTimestampStatus === "In Progress" ? "bg-red-700" : "",
              timerColor: clockStates.bakingTimestampStatus === "In Progress" ? "text-red-800" : "",
              labelColor: clockStates.bakingTimestampStatus === "In Progress" ? "text-red-800" : "",
            }}
          />
        </section>
        <section className="w-full flex gap-4 mb-4">
          {["Mixing", "Filling", "Baking"].map((label, idx) => {
            const clocks = [mixingClock, fillingClock, bakingClock];
            const initialTimes = [mixingTime, fillingTime, bakingTime];
            const iterations = [mixingIteration, fillingIteration, bakingIteration];
            const onComplete = ["MIXING", "FILLING", "BAKING"] as const;
            return (
              <Clock
                key={label}
                label={label}
                time={clocks[idx]}
                initialTime={initialTimes[idx]}
                setTime={[setMixingClock, setFillingClock, setBakingClock][idx]}
                batch={iterations[idx]}
                isOperationRunning={isOperationRunning}
                status={clockStates}
                onIterationComplete={() => {
                  if (iterations[idx] < (cycles ?? 1)) handleIterationComplete(onComplete[idx]);
                }}
              />
            );
          })}
        </section>
      </section>
    </div>
  );
}
