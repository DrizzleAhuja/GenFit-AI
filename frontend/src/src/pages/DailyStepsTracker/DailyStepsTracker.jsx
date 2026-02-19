import React, { useState, useEffect, useRef } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from "../../context/ThemeContext";
import { FaRunning, FaRoute, FaFire, FaClock, FaChartLine } from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const CHART_COLORS = ["#22D3EE", "#8B5CF6", "#FACC15", "#34D399"];

const DailyStepsTracker = () => {
  const { darkMode } = useTheme();
  const [isTracking, setIsTracking] = useState(false);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [activityType, setActivityType] = useState("walking"); // walking, running, cycling
  const [calories, setCalories] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0); // km/h
  const [dailyHistory, setDailyHistory] = useState([]);
  
  const startTimeRef = useRef(null);
  const lastPositionRef = useRef(null);
  const watchIdRef = useRef(null);
  const accelerometerDataRef = useRef([]);
  const stepCountRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const thresholdRef = useRef(0.5); // Dynamic threshold for step detection

  // Load today's data from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`steps_${today}`);
    if (saved) {
      const data = JSON.parse(saved);
      setSteps(data.steps || 0);
      setDistance(data.distance || 0);
      setDuration(data.duration || 0);
      setCalories(data.calories || 0);
      stepCountRef.current = data.steps || 0;
    }
    
    // Load weekly history
    loadWeeklyHistory();
  }, []);

  const loadWeeklyHistory = () => {
    const history = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const saved = localStorage.getItem(`steps_${dateStr}`);
      if (saved) {
        const data = JSON.parse(saved);
        history.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          steps: data.steps || 0,
          distance: data.distance || 0,
          calories: data.calories || 0,
        });
      } else {
        history.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          steps: 0,
          distance: 0,
          calories: 0,
        });
      }
    }
    setDailyHistory(history);
  };

  const saveToLocalStorage = () => {
    const today = new Date().toDateString();
    const data = {
      steps: stepCountRef.current,
      distance,
      duration,
      calories,
      activityType,
      timestamp: Date.now(),
    };
    localStorage.setItem(`steps_${today}`, JSON.stringify(data));
    loadWeeklyHistory();
  };

  // Step detection using accelerometer
  useEffect(() => {
    if (!isTracking) return;

    let lastAccel = { x: 0, y: 0, z: 0 };
    let peakCount = 0;
    let lastPeakTime = 0;

    const handleMotion = (event) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      // Store recent accelerations for threshold calculation
      accelerometerDataRef.current.push(magnitude);
      if (accelerometerDataRef.current.length > 20) {
        accelerometerDataRef.current.shift();
      }

      // Calculate dynamic threshold (average of recent values)
      if (accelerometerDataRef.current.length >= 10) {
        const avg = accelerometerDataRef.current.reduce((a, b) => a + b, 0) / accelerometerDataRef.current.length;
        thresholdRef.current = avg * 1.15; // 15% above average
      }

      // Detect peak (step)
      const now = Date.now();
      if (magnitude > thresholdRef.current && magnitude > lastAccel.x) {
        peakCount++;
        if (peakCount >= 2 && now - lastPeakTime > 200) { // Min 200ms between steps
          stepCountRef.current++;
          setSteps(stepCountRef.current);
          lastPeakTime = now;
          peakCount = 0;
          
          // Estimate distance: average step length ~0.7m for walking, ~1.2m for running
          const stepLength = activityType === "running" ? 1.2 : activityType === "cycling" ? 2.5 : 0.7;
          setDistance(prev => prev + stepLength);
          
          // Estimate calories (MET values: walking=3.5, running=8, cycling=6)
          const met = activityType === "running" ? 8 : activityType === "cycling" ? 6 : 3.5;
          const weight = 70; // Default 70kg, can be made user-configurable
          const caloriesPerStep = (met * weight * 0.0005) / (stepLength / 1000); // Approximate
          setCalories(prev => prev + caloriesPerStep);
        }
      }

      lastAccel = { x: magnitude, y: y, z: z };
    };

    // Request permission and start listening
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      DeviceMotionEvent.requestPermission()
        .then(permission => {
          if (permission === "granted") {
            window.addEventListener("devicemotion", handleMotion);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("devicemotion", handleMotion);
    }

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [isTracking, activityType]);

  // GPS tracking for distance and speed
  useEffect(() => {
    if (!isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const speed = position.coords.speed; // m/s

        if (speed !== null && !isNaN(speed)) {
          setCurrentSpeed(speed * 3.6); // Convert to km/h

          // Classify activity based on speed
          if (speed * 3.6 > 15) {
            setActivityType("cycling");
          } else if (speed * 3.6 > 6) {
            setActivityType("running");
          } else if (speed * 3.6 > 1) {
            setActivityType("walking");
          }
        }

        // Calculate distance from last position
        if (lastPositionRef.current) {
          const lat1 = lastPositionRef.current.latitude;
          const lon1 = lastPositionRef.current.longitude;
          const lat2 = latitude;
          const lon2 = longitude;

          const R = 6371e3; // Earth radius in meters
          const φ1 = lat1 * Math.PI / 180;
          const φ2 = lat2 * Math.PI / 180;
          const Δφ = (lat2 - lat1) * Math.PI / 180;
          const Δλ = (lon2 - lon1) * Math.PI / 180;

          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          const distanceDelta = R * c;
          setDistance(prev => prev + distanceDelta);
        }

        lastPositionRef.current = { latitude, longitude };
      },
      (error) => {
        console.error("GPS error:", error);
      },
      options
    );

    // Update duration every second
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      clearInterval(interval);
    };
  }, [isTracking]);

  // Auto-save every 10 seconds
  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => {
      saveToLocalStorage();
    }, 10000);
    return () => clearInterval(interval);
  }, [isTracking, steps, distance, calories]);

  const startTracking = () => {
    setIsTracking(true);
    stepCountRef.current = steps; // Resume from current count
    accelerometerDataRef.current = [];
    lastStepTimeRef.current = Date.now();
  };

  const stopTracking = () => {
    setIsTracking(false);
    saveToLocalStorage();
  };

  const resetToday = () => {
    if (window.confirm("Reset today's activity data?")) {
      setSteps(0);
      setDistance(0);
      setDuration(0);
      setCalories(0);
      stepCountRef.current = 0;
      const today = new Date().toDateString();
      localStorage.removeItem(`steps_${today}`);
      loadWeeklyHistory();
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const activityData = [
    { name: "Walking", value: activityType === "walking" ? 1 : 0, color: "#22D3EE" },
    { name: "Running", value: activityType === "running" ? 1 : 0, color: "#8B5CF6" },
    { name: "Cycling", value: activityType === "cycling" ? 1 : 0, color: "#FACC15" },
  ].filter(d => d.value > 0);

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-[#05010d] text-white" : "bg-[#020617] text-gray-100"}`}>
      <NavBar />
      <main className="flex-grow max-w-6xl mx-auto px-4 pt-6 pb-4 w-full">
        <section className="relative overflow-hidden py-6 sm:py-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10">
            <header className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                Daily Steps Tracker
              </h1>
              <p className="mt-2 text-sm md:text-base text-gray-300">
                Track your steps, distance, and calories burned using your phone's sensors. Perfect for PWA mobile app.
              </p>
            </header>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Steps</p>
                    <p className="text-2xl font-bold text-[#22D3EE] mt-1">{steps.toLocaleString()}</p>
                  </div>
                  <FaRunning className="w-8 h-8 text-[#22D3EE]" />
                </div>
              </div>

              <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Distance</p>
                    <p className="text-2xl font-bold text-[#8B5CF6] mt-1">
                      {(distance / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <HiOutlineLocationMarker className="w-8 h-8 text-[#8B5CF6]" />
                </div>
              </div>

              <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Calories</p>
                    <p className="text-2xl font-bold text-[#FACC15] mt-1">{Math.round(calories)}</p>
                  </div>
                  <FaFire className="w-8 h-8 text-[#FACC15]" />
                </div>
              </div>

              <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
                    <p className="text-2xl font-bold text-[#34D399] mt-1">{formatTime(duration)}</p>
                  </div>
                  <FaClock className="w-8 h-8 text-[#34D399]" />
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-6 mb-6">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <FaRoute className={`w-6 h-6 ${isTracking ? "text-green-400 animate-pulse" : "text-gray-400"}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-100">
                      {isTracking ? "Tracking Active" : "Ready to Track"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Activity: <span className="capitalize text-[#22D3EE]">{activityType}</span>
                      {currentSpeed > 0 && ` • ${currentSpeed.toFixed(1)} km/h`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  {!isTracking ? (
                    <button
                      onClick={startTracking}
                      className="px-6 py-2 bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Start Tracking
                    </button>
                  ) : (
                    <button
                      onClick={stopTracking}
                      className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      Stop Tracking
                    </button>
                  )}
                  <button
                    onClick={resetToday}
                    className="px-4 py-2 bg-[#1F2937] text-gray-300 rounded-lg font-semibold hover:bg-[#374151] transition"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Steps Chart */}
              <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                <h2 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
                  <FaChartLine className="w-4 h-4" /> Weekly Steps
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyHistory}>
                      <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                      <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#1F2937" : "#F9FAFB",
                          border: `1px solid ${darkMode ? "#374151" : "#D1D5DB"}`,
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="steps" fill="#22D3EE" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Activity Type Pie Chart */}
              {activityData.length > 0 && (
                <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
                  <h2 className="text-sm font-semibold text-gray-100 mb-3">Current Activity</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {activityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="mt-6 relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-4">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE] rounded-t-xl"></div>
              <h2 className="text-sm font-semibold text-gray-100 mb-2">How it works</h2>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Uses your phone's accelerometer to detect steps (no paid APIs)</li>
                <li>GPS tracks distance and speed for accurate activity classification</li>
                <li>Automatically saves your progress every 10 seconds</li>
                <li>Works best when installed as a PWA on your mobile device</li>
                <li>Grant location and motion permissions when prompted for best accuracy</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DailyStepsTracker;
