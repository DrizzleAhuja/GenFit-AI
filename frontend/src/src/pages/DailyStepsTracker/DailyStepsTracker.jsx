import React, { useState, useEffect, useRef } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from "../../context/ThemeContext";
import { Footprints, Flame, MapPin, Activity, Play, Square, Sparkles } from "lucide-react";

const DAILY_STEPS_KEY = "dailySteps_v2";

const ActivityTracker = () => {
  const { darkMode } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState(() => {
    try {
      const raw = localStorage.getItem(DAILY_STEPS_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      const todayKey = new Date().toISOString().slice(0, 10);
      if (parsed?.date === todayKey && typeof parsed.steps === "number") {
        return parsed.steps;
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [activity, setActivity] = useState("Idle");
  const lastAccel = useRef(0);
  const stepCountRef = useRef(steps);
  const motionHandlerRef = useRef(null);

  const STEP_LENGTH = 0.78;
  const CALORIES_PER_STEP = 0.04;

  useEffect(() => {
    stepCountRef.current = steps;
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      localStorage.setItem(
        DAILY_STEPS_KEY,
        JSON.stringify({ date: todayKey, steps })
      );
    } catch {
      // ignore storage errors (private mode, etc.)
    }
    const distKm = (steps * STEP_LENGTH) / 1000;
    setDistance(Number(distKm.toFixed(2)));
    setCalories(Number((steps * CALORIES_PER_STEP).toFixed(1)));
  }, [steps]);

  const detectActivity = (accelMagnitude) => {
    if (accelMagnitude > 18) return "Running";
    if (accelMagnitude > 12) return "Walking";
    return "Idle";
  };

  const startTracking = async () => {
    if (typeof DeviceMotionEvent === "undefined") {
      alert("Motion sensors not supported on this device.");
      return;
    }
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission !== "granted") {
          alert("Motion permission denied");
          return;
        }
      } catch (error) {
        console.error("Permission error:", error);
      }
    }

    setIsTracking(true);
    motionHandlerRef.current = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const magnitude = Math.sqrt(
        acc.x * acc.x + acc.y * acc.y + acc.z * acc.z
      );

      const diff = Math.abs(magnitude - lastAccel.current);
      lastAccel.current = magnitude;

      if (diff > 6) {
        setSteps((prev) => prev + 1);
      }
      setActivity(detectActivity(magnitude));
    };

    window.addEventListener("devicemotion", motionHandlerRef.current);
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (motionHandlerRef.current) {
      window.removeEventListener("devicemotion", motionHandlerRef.current);
    }
    setActivity("Idle");
  };

  const resetSteps = () => {
    setSteps(0);
    try {
      localStorage.removeItem(DAILY_STEPS_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-[#05010d] text-white" : "bg-[#020617] text-gray-100"}`}>
      <NavBar />

      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Header - Features style */}
            <header className="text-center mb-6 sm:mb-8 lg:mb-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  PWA Mobile Optimized
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  Daily Steps
                </span>{" "}
                Tracker
              </h1>
              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">
                Track your steps using your phone&apos;s motion sensors. Best accuracy when installed as a{" "}
                <span className="font-semibold text-[#22D3EE]">PWA</span> on mobile.
              </p>
            </header>

            {/* Control Buttons */}
            <div className="flex justify-center gap-3 flex-wrap mb-6 sm:mb-8">
              <button
                onClick={startTracking}
                disabled={isTracking}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#22D3EE] via-[#0EA5E9] to-[#8B5CF6] text-white font-semibold hover:opacity-95 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-[#22D3EE]/40"
              >
                <Play size={18} /> Start Tracking
              </button>

              <button
                onClick={stopTracking}
                disabled={!isTracking}
                className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-red-500/90 hover:bg-red-500 text-white font-semibold disabled:opacity-50 transition border border-white/10"
              >
                <Square size={18} /> Stop Tracking
              </button>

              <button
                onClick={resetSteps}
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/5 text-gray-200 font-semibold hover:bg-white/10 transition border border-white/10"
              >
                Reset
              </button>
            </div>

            {/* Stats Cards - Features style */}
            <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10 sm:mb-12">
              <Card
                icon={<Footprints size={24} />}
                title="Steps Today"
                value={steps}
                color="text-[#22D3EE]"
              />
              <Card
                icon={<Flame size={24} />}
                title="Calories Burned"
                value={`${calories} kcal`}
                color="text-[#FACC15]"
              />
              <Card
                icon={<MapPin size={24} />}
                title="Distance"
                value={`${distance} km`}
                color="text-[#8B5CF6]"
              />
              <Card
                icon={<Activity size={24} />}
                title="Activity Status"
                value={activity}
                color="text-[#34D399]"
              />
            </div>

            {isTracking && (
              <div className="relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-5 sm:p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 mb-6">
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]"></div>
                <p className="text-emerald-400 font-semibold animate-pulse text-sm sm:text-base">
                  Tracking your movement in real-time...
                </p>
              </div>
            )}

            {/* How it works - Features style */}
            <div className="relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300">
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]"></div>
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">How it works</h2>
              <ul className="text-sm sm:text-base text-gray-300 space-y-2 list-disc list-inside">
                <li>Uses your phone&apos;s accelerometer to detect steps (no paid APIs)</li>
                <li>Works best when installed as a PWA on your mobile device</li>
                <li>Grant motion permission when prompted for best accuracy</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const Card = ({ icon, title, value, color }) => (
  <article className="relative h-full rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-5 sm:p-6 flex flex-col shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-transform duration-300 hover:-translate-y-1.5">
    <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]"></div>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#020617] border border-[#1F2937]">
          <div className={`${color || "text-[#22D3EE]"}`}>{icon}</div>
        </div>
        <span className="text-xs uppercase tracking-[0.18em] text-gray-400">{title}</span>
      </div>
    </div>
    <p className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
      {value}
    </p>
  </article>
);

export default ActivityTracker;
