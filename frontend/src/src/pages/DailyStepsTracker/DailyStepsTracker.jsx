import React, { useState, useEffect, useRef } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { Footprints, Flame, Activity, MapPin, Play, Square } from "lucide-react";

const ActivityTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState(
    Number(localStorage.getItem("dailySteps")) || 0
  );
  const [calories, setCalories] = useState(0);
  const [distance, setDistance] = useState(0);
  const [activity, setActivity] = useState("Idle");
  const lastAccel = useRef(0);
  const stepCountRef = useRef(steps);
  const motionHandlerRef = useRef(null);

  // Constants (fitness science based estimates)
  const STEP_LENGTH = 0.78; // meters avg
  const CALORIES_PER_STEP = 0.04;

  useEffect(() => {
    stepCountRef.current = steps;
    localStorage.setItem("dailySteps", steps);
    
    const distKm = (steps * STEP_LENGTH) / 1000;
    setDistance(distKm.toFixed(2));
    setCalories((steps * CALORIES_PER_STEP).toFixed(1));
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

    // iOS permission fix
    if (
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
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

      // Step detection threshold (optimized)
      if (diff > 6) {
        setSteps((prev) => prev + 1);
      }

      setActivity(detectActivity(magnitude));
    };

    window.addEventListener(
      "devicemotion",
      motionHandlerRef.current
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (motionHandlerRef.current) {
      window.removeEventListener(
        "devicemotion",
        motionHandlerRef.current
      );
    }
    setActivity("Idle");
  };

  const resetSteps = () => {
    setSteps(0);
    localStorage.removeItem("dailySteps");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-white">
      <NavBar />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 w-full">
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Real-Time Activity Tracker
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Best accuracy on Mobile PWA devices (uses real motion sensors)
        </p>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={startTracking}
            disabled={isTracking}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-semibold disabled:opacity-50"
          >
            <Play size={18} /> Start Tracking
          </button>

          <button
            onClick={stopTracking}
            disabled={!isTracking}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-black font-semibold disabled:opacity-50"
          >
            <Square size={18} /> Stop Tracking
          </button>

          <button
            onClick={resetSteps}
            className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
          >
            Reset
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card
            icon={<Footprints size={28} />}
            title="Steps Today"
            value={steps}
          />
          <Card
            icon={<Flame size={28} />}
            title="Calories Burned"
            value={`${calories} kcal`}
          />
          <Card
            icon={<MapPin size={28} />}
            title="Distance"
            value={`${distance} km`}
          />
          <Card
            icon={<Activity size={28} />}
            title="Activity Status"
            value={activity}
          />
        </div>

        {isTracking && (
          <div className="text-center mt-8 text-green-400 font-semibold animate-pulse">
            Tracking your movement in real-time...
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const Card = ({ icon, title, value }) => {
  return (
    <div className="bg-[#020617]/80 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-gray-300 text-sm">{title}</h2>
        <div className="text-purple-400">{icon}</div>
      </div>
      <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
        {value}
      </p>
    </div>
  );
};

export default ActivityTracker;
