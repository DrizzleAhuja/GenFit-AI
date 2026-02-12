import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { FiRefreshCw, FiSave, FiHeart, FiCopy } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUtensils, FaChartLine, FaExclamationTriangle } from "react-icons/fa";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from '../../context/ThemeContext';
import { Sparkles } from 'lucide-react';

export default function DietChartGenerator() {
  const { darkMode } = useTheme();
  const [bmiData, setBmiData] = useState(null);
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState(null);
  const [dietChart, setDietChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedDietChart, setSavedDietChart] = useState(null);
  const [bmiResult, setBmiResult] = useState(null);

  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch BMI data
  useEffect(() => {
    const fetchBMIData = async () => {
      if (user?.email) {
        try {
          const res = await axios.get(
            `${API_BASE_URL}${API_ENDPOINTS.BMI}/history`,
            { params: { email: user.email } }
          );
          if (res.data.length > 0) {
            const latestBmi = res.data[0];
            setBmiData(latestBmi);
            setBmiResult({ bmi: latestBmi.bmi, category: latestBmi.category });
          }
        } catch (error) {
          console.error("Error fetching BMI data:", error);
        }
      }
    };

    if (location.state?.bmiData && location.state?.bmiResult) {
      setBmiData(location.state.bmiData);
      setBmiResult(location.state.bmiResult);
      toast.success("BMI data loaded for personalized plan generation!");
    } else if (user?.email) {
      fetchBMIData();
    }
  }, [user, location.state]);

  // Fetch active workout plan
  useEffect(() => {
    const fetchActiveWorkoutPlan = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH}/workout-plan/active/${user._id}`
          );
          if (response.data.success) {
            setActiveWorkoutPlan(response.data.plan);
          } else {
            setActiveWorkoutPlan(null);
          }
        } catch (error) {
          console.error("Error fetching active workout plan:", error);
          setActiveWorkoutPlan(null);
        }
      }
    };
    fetchActiveWorkoutPlan();
  }, [user]);

  // Clear savedDietChart when activeWorkoutPlan changes
  useEffect(() => {
    setSavedDietChart(null);
  }, [activeWorkoutPlan]);

  // Check for existing diet chart
  useEffect(() => {
    const checkExistingDietChart = async () => {
      console.log("🔍 [FRONTEND] Checking existing diet chart...", {
        hasUser: !!user,
        userId: user?._id,
        hasActiveWorkoutPlan: !!activeWorkoutPlan,
        workoutPlanId: activeWorkoutPlan?._id,
      });

      if (user && user._id && activeWorkoutPlan && activeWorkoutPlan._id) {
        try {
          console.log(
            "🔍 [FRONTEND] Making API call to check existing diet chart..."
          );
          const response = await axios.get(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH}/diet-chart/${user._id}/${activeWorkoutPlan._id}`
          );
          console.log("🔍 [FRONTEND] API response received:", {
            success: response.data.success,
            hasDietChart: !!response.data.dietChart,
            dietChartLength: response.data.dietChart?.dietChart?.length || 0,
          });

          if (response.data.success && response.data.dietChart) {
            console.log("✅ [FRONTEND] Setting saved diet chart");
            setSavedDietChart(response.data.dietChart.dietChart);
          }
        } catch (error) {
          console.error(
            "❌ [FRONTEND] Error checking existing diet chart:",
            error
          );
        }
      } else {
        console.log(
          "⚠️ [FRONTEND] Missing required data for checking existing diet chart"
        );
      }
    };
    checkExistingDietChart();
  }, [user, activeWorkoutPlan]);

  const calculateDurationWeeks = (currentWeight, targetWeight, goal, age) => {
    if (!currentWeight || !targetWeight || !goal || !age) return 12;

    const weightDifference = Math.abs(targetWeight - currentWeight);
    let weeksPerKg = 0.5;

    if (goal === "lose_weight") {
      if (age < 25) weeksPerKg = 0.6;
      else if (age < 35) weeksPerKg = 0.5;
      else if (age < 45) weeksPerKg = 0.4;
      else weeksPerKg = 0.3;
    } else if (goal === "gain_weight") {
      if (age < 25) weeksPerKg = 0.4;
      else if (age < 35) weeksPerKg = 0.3;
      else if (age < 45) weeksPerKg = 0.25;
      else weeksPerKg = 0.2;
    } else {
      weeksPerKg = 0.3;
    }

    const calculatedWeeks = Math.ceil(weightDifference / weeksPerKg);
    return Math.max(4, Math.min(calculatedWeeks, 24));
  };

  const generateDietChart = async () => {
    console.log("🤖 [FRONTEND] Starting diet chart generation...");

    if (!user || !bmiData) {
      console.log("❌ [FRONTEND] Missing user or BMI data:", {
        hasUser: !!user,
        hasBmiData: !!bmiData,
      });
      toast.error(
        "Please ensure your BMI data is available to generate a diet chart."
      );
      return;
    }

    if (!activeWorkoutPlan) {
      console.log("❌ [FRONTEND] No active workout plan found");
      toast.error(
        "No active workout plan found. Please create and activate a workout plan first."
      );
      return;
    }

    console.log(
      "✅ [FRONTEND] All required data available, starting generation..."
    );
    setLoading(true);
    try {
      let fitnessGoal = activeWorkoutPlan?.generatedParams?.fitnessGoal;
      if (!fitnessGoal && activeWorkoutPlan?.name) {
        if (activeWorkoutPlan.name.toLowerCase().includes("lose weight")) {
          fitnessGoal = "lose_weight";
        } else if (
          activeWorkoutPlan.name.toLowerCase().includes("gain weight")
        ) {
          fitnessGoal = "gain_weight";
        } else if (
          activeWorkoutPlan.name.toLowerCase().includes("build muscles")
        ) {
          fitnessGoal = "build_muscles";
        }
      }

      const targetWeight =
        activeWorkoutPlan?.generatedParams?.targetWeight ||
        bmiData.targetWeight;

      const durationWeeks = activeWorkoutPlan.durationWeeks;

      const requestData = {
        userId: user._id,
        durationWeeks: durationWeeks,
        fitnessGoal: fitnessGoal,
        currentWeight:
          activeWorkoutPlan.generatedParams.currentWeight || bmiData.weight,
        targetWeight: targetWeight,
        diseases: user.diseases || [],
        allergies: user.allergies || [],
        activeWorkoutPlan: activeWorkoutPlan,
      };

      console.log("🤖 [FRONTEND] Request data prepared:", {
        userId: requestData.userId,
        durationWeeks: requestData.durationWeeks,
        fitnessGoal: requestData.fitnessGoal,
        currentWeight: requestData.currentWeight,
        targetWeight: requestData.targetWeight,
        diseasesCount: requestData.diseases.length,
        allergiesCount: requestData.allergies.length,
        hasActiveWorkoutPlan: !!requestData.activeWorkoutPlan,
      });

      console.log("🤖 [FRONTEND] Making API call to generate diet chart...");
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/generate-diet-chart`,
        requestData
      );

      console.log("🤖 [FRONTEND] API response received:", {
        success: response.data.success,
        hasDietChart: !!response.data.dietChart,
        dietChartLength: response.data.dietChart?.dietChart?.length || 0,
      });

      if (response.data.success) {
        console.log(
          "✅ [FRONTEND] Diet chart generated successfully, setting state..."
        );
        setSavedDietChart(null);
        setDietChart(response.data.dietChart.dietChart);
        toast.success("Diet chart generated successfully!");
      } else {
        console.error(
          "❌ [FRONTEND] Diet chart generation failed:",
          response.data
        );
        toast.error(response.data.error || "Failed to generate diet chart.");
      }
    } catch (error) {
      console.error("Error generating diet chart:", error);
      toast.error("Failed to generate diet chart. Please try again.");
    }
    setLoading(false);
  };

  const formatDietChartContent = (content) => {
    if (!content) return "";

    return content
      .replace(/\*+/g, "")
      .replace(/^[\s\-\*]+/gm, "")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/^\s+|\s+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .replace(/\n\s+/g, "\n")
      .trim();
  };

  const normalizeHeading = (text) => {
    if (!text) return "";
    return text
      .replace(/[:\-]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const parseDietChartContent = (content) => {
    if (!content) return [];

    const cleaned = formatDietChartContent(content);
    const lines = cleaned.split("\n").map((line) => line.trim()).filter(Boolean);

    const dayHeadingRegex =
      /^(day\s*\d+|week\s*\d+|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i;
    const mealHeadingRegex =
      /^(early\s*morning|breakfast|mid\s*morning|brunch|snack|pre\s*workout|post\s*workout|lunch|evening\s*snack|dinner|dessert|hydration|supplements|bed\s*time|night\s*snack)/i;

    const sections = [];
    let currentSection = null;
    let currentMeal = null;

    const pushSection = () => {
      if (currentSection) {
        currentSection.meals = currentSection.meals.filter(
          (meal) => meal.items.length > 0
        );
        sections.push(currentSection);
      }
    };

    lines.forEach((line) => {
      const normalizedLine = line.replace(/^[-•\d.]+\s*/, "").trim();
      if (!normalizedLine) return;

      if (dayHeadingRegex.test(normalizedLine)) {
        pushSection();
        currentSection = {
          title: normalizeHeading(normalizedLine),
          meals: [],
          notes: [],
        };
        currentMeal = null;
      } else if (mealHeadingRegex.test(normalizedLine)) {
        if (!currentSection) {
          currentSection = {
            title: "General Plan",
            meals: [],
            notes: [],
          };
        }
        const meal = {
          title: normalizeHeading(normalizedLine),
          items: [],
        };
        currentSection.meals.push(meal);
        currentMeal = meal;
      } else {
        if (!currentSection) {
          currentSection = {
            title: "General Guidelines",
            meals: [],
            notes: [],
          };
        }
        if (currentMeal) {
          currentMeal.items.push(normalizedLine);
        } else {
          currentSection.notes.push(normalizedLine);
        }
      }
    });

    pushSection();

    return sections.filter(
      (section) => section.notes.length > 0 || section.meals.length > 0
    );
  };

  const resolvedSavedDietChart = useMemo(() => {
    if (!savedDietChart) return null;
    return typeof savedDietChart === "string"
      ? savedDietChart
      : savedDietChart?.dietChart || null;
  }, [savedDietChart]);

  const displayDietChart = dietChart || resolvedSavedDietChart;

  const structuredDietChart = useMemo(
    () => parseDietChartContent(displayDietChart),
    [displayDietChart]
  );

  const saveDietChart = async () => {
    console.log("💾 [FRONTEND] Starting diet chart save...");

    if (!user || !dietChart || !activeWorkoutPlan) {
      console.log("❌ [FRONTEND] Missing required data for save:", {
        hasUser: !!user,
        hasDietChart: !!dietChart,
        hasActiveWorkoutPlan: !!activeWorkoutPlan,
      });
      toast.error("No diet chart to save.");
      return;
    }

    console.log("✅ [FRONTEND] All required data available for save");
    setLoading(true);
    try {
      const saveData = {
        userId: user._id,
        workoutPlanId: activeWorkoutPlan._id,
        dietChart: dietChart,
        durationWeeks: activeWorkoutPlan.durationWeeks,
        activeWorkoutPlan: activeWorkoutPlan,
      };

      console.log("💾 [FRONTEND] Save data prepared:", {
        userId: saveData.userId,
        workoutPlanId: saveData.workoutPlanId,
        dietChartLength: saveData.dietChart?.length || 0,
        durationWeeks: saveData.durationWeeks,
        hasActiveWorkoutPlan: !!saveData.activeWorkoutPlan,
      });

      console.log("💾 [FRONTEND] Making API call to save diet chart...");
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/diet-chart/save`,
        saveData
      );

      console.log("💾 [FRONTEND] Save API response received:", {
        success: response.data.success,
        hasDietChart: !!response.data.dietChart,
        message: response.data.message,
      });

      if (response.data.success) {
        console.log(
          "✅ [FRONTEND] Diet chart saved successfully, updating state..."
        );
        setSavedDietChart(response.data.dietChart);
        toast.success("Diet chart saved successfully!");
      } else {
        console.error("❌ [FRONTEND] Diet chart save failed:", response.data);
        toast.error("Failed to save diet chart.");
      }
    } catch (error) {
      console.error("Error saving diet chart:", error);
      toast.error("Failed to save diet chart. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex flex-col ${
      darkMode ? 'bg-[#05010d] text-white' : 'bg-[#020617] text-gray-100'
    }`}>
      <NavBar />
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mb-6 sm:mb-8 lg:mb-10">
            {/* Header */}
            <header className="text-center">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  Nutrition Planning
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                Diet{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  Chart Generator
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-sm sm:text-base lg:text-lg text-gray-300">
                Generate personalized meal plans based on your BMI, goals, and workout schedule.
              </p>
            </header>
          </div>

          <div className="relative z-10 container mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Information Cards */}
          <div className="xl:col-span-4 2xl:col-span-3 space-y-5 sm:space-y-6 order-2 xl:order-1">
            {/* BMI Data Card - Enhanced */}
            {bmiData ? (
              <div className="group relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] overflow-hidden transition-all duration-500 hover:border-[#22D3EE]/60 hover:-translate-y-1 animate-slide-in-left">
                <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-red-600 p-5 sm:p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <FiHeart className="text-2xl text-white drop-shadow-lg" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Your Health Profile
                    </h2>
                  </div>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "BMI", value: bmiData.bmi, color: "text-orange-400" },
                      { label: "Category", value: bmiResult.category, color: "text-pink-400" },
                      { label: "Weight", value: `${bmiData.weight}kg`, color: "text-blue-400" },
                      { label: "Height", value: `${bmiData.heightFeet}'${bmiData.heightInches}"`, color: "text-purple-400" },
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#020617]/60 backdrop-blur-sm p-4 rounded-xl border border-[#1F2937] hover:border-[#22D3EE]/40 transition-all duration-300 hover:scale-105"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className={`font-bold text-lg ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                    {bmiData.age && (
                      <div className="bg-[#020617]/60 backdrop-blur-sm p-4 rounded-xl border border-[#1F2937] hover:border-[#22D3EE]/40 transition-all duration-300 hover:scale-105">
                        <p className="text-xs text-gray-400 mb-1">Age</p>
                        <p className="font-bold text-lg text-green-400">{bmiData.age} years</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-slate-700/50">
                    <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 p-4 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                        Diseases
                      </p>
                      <p className="font-semibold text-sm text-gray-200 break-words">
                        {user?.diseases && user.diseases.length > 0
                          ? user.diseases.join(", ")
                          : "None"}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
                      <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        Allergies
                      </p>
                      <p className="font-semibold text-sm text-gray-200 break-words">
                        {user?.allergies && user.allergies.length > 0
                          ? user.allergies.join(", ")
                          : "None"}
                      </p>
                    </div>
                    {bmiData.targetWeight && (
                      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
                        <p className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          Target Weight
                        </p>
                        <p className="font-bold text-lg text-green-400">{bmiData.targetWeight}kg</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="group bg-gradient-to-br from-red-950/40 to-red-900/30 backdrop-blur-xl rounded-2xl border-2 border-red-500/50 p-6 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:-translate-y-1 animate-slide-in-left">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl animate-bounce-slow">
                    <FaExclamationTriangle className="text-2xl text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-300 mb-2">
                      BMI Data Required
                    </h3>
                    <p className="text-sm text-red-200 leading-relaxed">
                      Please calculate your BMI first to generate a personalized diet chart.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/CurrentBMI")}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Go to BMI Calculator</span>
                  <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}

            {/* Active Workout Plan Card - Enhanced */}
            {activeWorkoutPlan ? (
              <div className="group relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] overflow-hidden transition-all duration-500 hover:border-[#22D3EE]/60 hover:-translate-y-1 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
                <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-5 sm:p-6 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <FaChartLine className="text-2xl text-white drop-shadow-lg" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      Active Workout Plan
                    </h2>
                  </div>
                </div>
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-xl border border-green-500/30">
                    <p className="text-xs text-gray-400 mb-2">Plan Name</p>
                    <p className="font-bold text-white text-base">{activeWorkoutPlan.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { 
                        label: "Goal", 
                        value: activeWorkoutPlan?.generatedParams?.fitnessGoal
                          ?.replace(/_/g, " ")
                          .split(" ")
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ") || "N/A",
                        color: "text-green-400"
                      },
                      { label: "Duration", value: `${activeWorkoutPlan.durationWeeks} weeks`, color: "text-blue-400" },
                      { label: "Progress", value: `Week ${activeWorkoutPlan.currentWeek}/${activeWorkoutPlan.durationWeeks}`, color: "text-purple-400" },
                      { label: "Days/Week", value: activeWorkoutPlan?.generatedParams?.daysPerWeek || "N/A", color: "text-orange-400" },
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#020617]/60 backdrop-blur-sm p-3 rounded-xl border border-[#1F2937] hover:border-[#22D3EE]/40 transition-all duration-300 hover:scale-105"
                      >
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className={`font-bold text-sm ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="group bg-gradient-to-br from-yellow-950/40 to-yellow-900/30 backdrop-blur-xl rounded-2xl border-2 border-yellow-500/50 p-6 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:-translate-y-1 animate-slide-in-left" style={{ animationDelay: '200ms' }}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl animate-bounce-slow">
                    <FaExclamationTriangle className="text-2xl text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-300 mb-2">
                      No Active Workout Plan
                    </h3>
                    <p className="text-sm text-yellow-200 leading-relaxed">
                      Diet charts work in accordance with your active workout plan. Please create one first.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/Workout")}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50 active:scale-95 flex items-center justify-center gap-2 group"
                >
                  <span>Go to Workout Generator</span>
                  <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            )}

            {/* Action Buttons Card - Enhanced */}
            <div className="group relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] overflow-hidden transition-all duration-500 hover:border-[#22D3EE]/60 hover:-translate-y-1 animate-slide-in-left" style={{ animationDelay: '400ms' }}>
              <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-5 sm:p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-3">
                  <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <FaUtensils className="text-2xl text-white drop-shadow-lg" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Generate Diet Chart
                  </h2>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                {savedDietChart && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-500/30 rounded-lg">
                          <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-green-200 text-sm leading-relaxed flex-1">
                        You already have a saved diet chart for this workout plan
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={generateDietChart}
                    disabled={loading || !user || !bmiData || !activeWorkoutPlan}
                    className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:from-orange-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 active:scale-95 min-h-[56px] group"
                  >
                    {loading ? (
                      <>
                        <FiRefreshCw className="animate-spin text-xl" />
                        <span>Generating Diet Chart...</span>
                      </>
                    ) : (
                      <>
                        <FaUtensils className="text-xl group-hover:rotate-12 transition-transform" />
                        <span>Generate Diet Chart</span>
                      </>
                    )}
                  </button>

                  {dietChart && !savedDietChart && (
                    <button
                      onClick={saveDietChart}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 active:scale-95 min-h-[56px] group animate-slide-in-up"
                    >
                      {loading ? (
                        <>
                          <FiRefreshCw className="animate-spin text-xl" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave className="text-xl group-hover:scale-110 transition-transform" />
                          <span>Save Diet Chart</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <p className="text-gray-300 text-xs leading-relaxed flex items-start gap-2">
                    <span className="text-blue-400 text-sm mt-0.5">💡</span>
                    <span>The diet chart will be personalized based on your BMI data, health conditions, and active workout plan.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Diet Chart Display - Full Height */}
          <div className="xl:col-span-8 2xl:col-span-9 order-1 xl:order-2">
            <div className="relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] overflow-hidden transition-all duration-500 hover:border-[#22D3EE]/60 animate-slide-in-right h-full flex flex-col">
              <div className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-5 sm:p-6 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 bg-[#020617]/20"></div>
                <div className="absolute -right-20 -top-20 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
                        <FaUtensils className="text-2xl text-white drop-shadow-lg" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Your Personalized Diet Chart
                      </h2>
                    </div>
                    {activeWorkoutPlan && (
                      <div className="flex flex-wrap gap-2">
                        {[
                          activeWorkoutPlan.generatedParams?.fitnessGoal?.replace(/_/g, " ").toUpperCase() || "FITNESS GOAL",
                          `${activeWorkoutPlan.generatedParams?.daysPerWeek || 0} days/week`,
                          `${activeWorkoutPlan.generatedParams?.timeCommitment || 0} min sessions`
                        ].map((badge, idx) => (
                          <span 
                            key={idx}
                            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300 hover:scale-105"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {displayDietChart && (
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={saveDietChart}
                        disabled={loading}
                        className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-white/30 border border-white/20 hover:scale-110 active:scale-95 min-w-[52px] min-h-[52px] flex items-center justify-center group"
                        title="Save diet chart"
                      >
                        <FiSave className="text-xl group-hover:rotate-12 transition-transform" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(displayDietChart);
                          toast.success("Diet chart copied to clipboard!");
                        }}
                        className="p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-white/30 border border-white/20 hover:scale-110 active:scale-95 min-w-[52px] min-h-[52px] flex items-center justify-center group"
                        title="Copy to clipboard"
                      >
                        <FiCopy className="text-xl group-hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Scrollable content area - takes remaining height */}
              <div className="flex-1 p-5 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                {displayDietChart ? (
                  structuredDietChart.length > 0 ? (
                    <div className="space-y-5 sm:space-y-6">
                      {structuredDietChart.map((section, sectionIndex) => (
                        <div
                          key={`${section.title}-${sectionIndex}`}
                          className="group relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl p-5 sm:p-6 shadow-[0_18px_45px_rgba(15,23,42,0.8)] transition-all duration-500 hover:scale-[1.01] hover:border-[#22D3EE]/60 animate-fade-in-up"
                          style={{ animationDelay: `${sectionIndex * 100}ms` }}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-12 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                              <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                {section.title}
                              </h3>
                            </div>
                            <span className="text-xs uppercase tracking-widest font-bold px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-full border border-orange-500/30 shadow-lg">
                              {sectionIndex + 1 < 10 ? `Day ${sectionIndex + 1}` : "Plan Detail"}
                            </span>
                          </div>

                          {section.notes.length > 0 && (
                            <div className="mb-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 p-4 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300">
                              <ul className="list-none space-y-2 text-sm text-gray-200 leading-relaxed">
                                {section.notes.map((note, noteIndex) => (
                                  <li key={noteIndex} className="flex items-start gap-2 hover:text-white transition-colors">
                                    <span className="text-blue-400 mt-1">•</span>
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {section.meals.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {section.meals.map((meal, mealIndex) => (
                                <div
                                  key={`${meal.title}-${mealIndex}`}
                                  className="group/meal p-4 bg-[#020617]/60 backdrop-blur-sm border border-[#1F2937] rounded-xl transition-all duration-300 hover:scale-[1.03] hover:border-[#22D3EE]/50 hover:shadow-lg"
                                >
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                                    <h4 className="font-bold text-base sm:text-lg text-orange-300 group-hover/meal:text-orange-200 transition-colors">
                                      {meal.title}
                                    </h4>
                                  </div>
                                  <ul className="list-none space-y-2 text-sm text-gray-200 leading-relaxed">
                                    {meal.items.map((item, itemIndex) => (
                                      <li key={itemIndex} className="flex items-start gap-2 hover:text-white transition-colors">
                                        <span className="text-orange-400 mt-1 flex-shrink-0">→</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-full max-w-4xl">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed text-sm sm:text-base p-6 bg-[#020617]/60 backdrop-blur-sm rounded-2xl border border-[#1F2937]">
                          {formatDietChartContent(displayDietChart)}
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full min-h-[500px]">
                    <div className="relative mb-8 animate-float">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 blur-3xl opacity-20 rounded-full"></div>
                      <FaUtensils className="relative text-7xl sm:text-8xl text-gray-600" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-4 animate-fade-in">
                      No Diet Chart Generated
                    </h3>
                    <p className="text-base sm:text-lg text-gray-500 max-w-md px-4 leading-relaxed animate-fade-in-delay">
                      {!bmiData
                        ? "Please calculate your BMI first to generate a personalized diet chart."
                        : !activeWorkoutPlan
                        ? "Please create and activate a workout plan first."
                        : "Click 'Generate Diet Chart' to create your personalized meal plan."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        @keyframes pulse-slower {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-delay {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 4s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in-delay 0.6s ease-out 0.2s both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.6s ease-out;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.4s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316, #ef4444);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c, #dc2626);
        }
      `}</style>
    </div>
  );
}