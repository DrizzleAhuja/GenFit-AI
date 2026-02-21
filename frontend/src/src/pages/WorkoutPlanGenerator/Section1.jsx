// WorkoutPlanGenerator.js - Enhanced with unique professional styling and mobile responsiveness
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { FiCopy, FiRefreshCw, FiClock, FiCalendar, FiSave, FiCheckCircle, FiTarget, FiTrendingUp } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaDumbbell,
  FaHeartbeat,
  FaChartLine,
  FaTrophy,
  FaFire,
  FaBolt,
} from "react-icons/fa";
import { GiWeightLiftingUp, GiRunningShoe, GiMuscleUp } from "react-icons/gi";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

const WorkoutPlanGenerator = () => {
  const [formData, setFormData] = useState({
    timeCommitment: "",
    workoutType: "",
    intensity: "",
    equipment: "",
    daysPerWeek: 0,
    goal: "",
    currentWeight: "",
    targetWeight: "",
  });
  const user = useSelector(selectUser);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("generate");
  const [bmiData, setBmiData] = useState(null);
  const [bmiResult, setBmiResult] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // If user already has an active plan, go directly to My Plan instead of Generate Plan
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;
    const checkActivePlan = async () => {
      try {
        const activeRes = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.ACTIVE_WORKOUT_PLAN}/${user._id}`
        );
        if (!cancelled && activeRes.data?.plan) {
          navigate("/my-workout-plan", { replace: true });
        }
      } catch {
        // No active plan or error – stay on generate plan
      }
    };
    checkActivePlan();
    return () => { cancelled = true; };
  }, [user?._id, navigate]);

  useEffect(() => {
    if (location.state?.bmiData && location.state?.bmiResult) {
      setBmiData(location.state.bmiData);
      setBmiResult(location.state.bmiResult);
      setFormData(prev => ({ ...prev, currentWeight: location.state.bmiData.weight }));
      toast.success("BMI data loaded for personalized plan generation!");
    } else if (user?.email) {
      fetchBMIData();
    }
  }, [user, location.state]);

  const fetchBMIData = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.BMI}/history`,
        { params: { email: user.email } }
      );
      if (res.data.length > 0) {
        const latestBmi = res.data[0];
        setBmiData(latestBmi);
        setBmiResult({ bmi: latestBmi.bmi, category: latestBmi.category });
        setFormData(prev => ({ ...prev, currentWeight: latestBmi.weight }));
      }
    } catch (error) {
      console.error("Error fetching BMI data", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const cleanPlanContent = (content) => {
    if (!content) return "";
    return content
      .replace(/#{1,6}\s*/g, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/\*{1,2}/g, "")
      .replace(/#/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.timeCommitment ||
      !formData.workoutType ||
      !formData.intensity ||
      !formData.equipment ||
      formData.daysPerWeek === 0 ||
      !formData.goal ||
      !formData.currentWeight ||
      ((formData.goal === "lose_weight" || formData.goal === "gain_weight") && !formData.targetWeight)
    ) {
      toast.error("Please fill all required details for your plan.");
      return;
    }

    if (!bmiData) {
      toast.error("Please calculate your BMI first to get personalized workout plans");
      return;
    }

    setLoading(true);
    try {
      const calculatedDurationWeeks = calculateDurationWeeks(
        formData.currentWeight,
        formData.targetWeight,
        formData.goal,
        bmiData.age
      );

      const requestData = {
        email: user.email,
        fitnessGoal: formData.goal,
        gender: user.gender || "Not specified",
        trainingMethod: `${formData.workoutType} Training`,
        workoutType: formData.equipment,
        strengthLevel: formData.intensity,
        timeCommitment: formData.timeCommitment,
        daysPerWeek: formData.daysPerWeek,
        bmiData: bmiData,
        durationWeeks: calculatedDurationWeeks,
        targetWeight: formData.targetWeight,
        currentWeight: formData.currentWeight,
        diseases: user.diseases || [],
        allergies: user.allergies || [],
      };

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/generate-plan`,
        requestData
      );

      setPlan(response.data.plan);
      toast.success("Workout plan generated successfully!");
    } catch (error) {
      console.error("Failed to generate plan:", error);
      let errorMessage = "Failed to generate plan.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const savePlan = async () => {
    if (!user || !plan) {
      toast.error("Please generate a plan first.");
      return;
    }

    setLoading(true);
    try {
      const planName = prompt("Give your workout plan a name:", `My ${formData.goal.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Plan`);
      if (!planName) {
        setLoading(false);
        return;
      }

      const calculatedDurationWeeks = calculateDurationWeeks(
        formData.currentWeight,
        formData.targetWeight,
        formData.goal,
        bmiData.age
      );

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/workout-plan/save`,
        {
          userId: user._id,
          name: planName,
          description: `Personalized ${formData.goal.replace(/_/g, ' ')} plan for ${formData.intensity} level, targeting ${formData.targetWeight ? `${formData.targetWeight}kg` : 'maintenance'} over ${calculatedDurationWeeks} weeks.`,
          planContent: plan,
          generatedParams: { ...formData, bmiData, durationWeeks: calculatedDurationWeeks },
          durationWeeks: calculatedDurationWeeks,
        }
      );

      if (response.data.success) {
        toast.success("Workout plan saved successfully!");
        navigate("/my-workout-plan");
      } else {
        toast.error("Failed to save workout plan.");
      }
    } catch (error) {
      console.error("Error saving workout plan:", error);
      let errorMessage = "Failed to save workout plan.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (plan) {
      const planString = plan.map(day => {
        const exercises = day.exercises.map(ex => 
          `- ${ex.name}: ${ex.sets} sets of ${ex.reps} (${ex.weight}, ${ex.rest} rest)`
        ).join('\n');
        return `Day: ${day.day}${day.focus ? ` (${day.focus})` : ''}\nWarmup: ${day.warmup || 'N/A'}\n${exercises}\nCooldown: ${day.cooldown || 'N/A'}\n`;
      }).join('\n---\n');
      navigator.clipboard.writeText(planString);
      toast.success("Plan copied to clipboard!");
    } else {
      toast.error("No plan to copy.");
    }
  };

  const regeneratePlan = async () => {
    if (!formData.timeCommitment || !formData.workoutType || !formData.intensity || !formData.equipment || formData.daysPerWeek === 0 || !formData.goal || !formData.currentWeight || ((formData.goal === "lose_weight" || formData.goal === "gain_weight") && !formData.targetWeight)) {
        toast.error("Please fill all required fields to regenerate the plan.");
        return;
    }
    if (!bmiData) {
        toast.error("Please calculate your BMI first to get personalized workout plans.");
        return;
    }
    setLoading(true);
    try {
      const calculatedDurationWeeks = calculateDurationWeeks(
        formData.currentWeight,
        formData.targetWeight,
        formData.goal,
        bmiData.age
      );

      const requestData = {
        email: user.email,
        fitnessGoal: formData.goal,
        gender: user.gender || "Not specified",
        trainingMethod: `${formData.workoutType} Training`,
        workoutType: formData.equipment,
        strengthLevel: formData.intensity,
        timeCommitment: formData.timeCommitment,
        daysPerWeek: formData.daysPerWeek,
        bmiData: bmiData,
        durationWeeks: calculatedDurationWeeks,
        targetWeight: formData.targetWeight,
        currentWeight: formData.currentWeight,
        diseases: user.diseases || [],
        allergies: user.allergies || [],
      };

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/generate-plan`,
        requestData
      );
      setPlan(response.data.plan);
      toast.success("New plan generated!");
    } catch (error) {
      console.error("Failed to regenerate plan:", error);
      let errorMessage = "Failed to regenerate plan.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div className="workout-plan-container">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 40px rgba(34, 211, 238, 0.5);
          }
        }

        .workout-plan-container {
          min-height: 100vh;
          background: #020617;
          position: relative;
          overflow-x: hidden;
        }

        .workout-plan-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 50%);
          pointer-events: none;
        }

        .main-content {
          position: relative;
          z-index: 10;
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .main-content {
            padding: 2rem 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .main-content {
            padding: 2rem;
          }
        }

        .header-section {
          text-align: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out;
        }

        @media (min-width: 640px) {
          .header-section {
            margin-bottom: 3rem;
          }
        }

        .main-title {
          font-size: 1.875rem;
          font-weight: 900;
          background: linear-gradient(135deg, #22D3EE 0%, #8B5CF6 50%, #A855F7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
          line-height: 1.2;
          padding: 0 0.5rem;
        }

        @media (min-width: 640px) {
          .main-title {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
        }

        @media (min-width: 768px) {
          .main-title {
            font-size: 3rem;
          }
        }

        @media (min-width: 1024px) {
          .main-title {
            font-size: 3.75rem;
          }
        }

        .subtitle {
          color: #9CA3AF;
          font-size: 0.875rem;
          max-width: 48rem;
          margin: 0 auto;
          padding: 0 1rem;
          line-height: 1.5;
        }

        @media (min-width: 640px) {
          .subtitle {
            font-size: 1rem;
          }
        }

        @media (min-width: 768px) {
          .subtitle {
            font-size: 1.125rem;
          }
        }

        @media (min-width: 1024px) {
          .subtitle {
            font-size: 1.25rem;
          }
        }

        .tab-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .tab-container::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 640px) {
          .tab-container {
            gap: 1rem;
            margin-bottom: 2rem;
            justify-content: center;
          }
        }

        .tab-button {
          position: relative;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          border-radius: 0.75rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid #1F2937;
          color: #D1D5DB;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          font-size: 0.875rem;
          min-height: 44px;
        }

        @media (min-width: 640px) {
          .tab-button {
            font-size: 1rem;
            padding: 0.75rem 2rem;
          }
        }

        .tab-button.active {
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #22D3EE 100%);
          border-color: rgba(34, 211, 238, 0.5);
          color: white;
          box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
        }

        .tab-button:not(.active):hover {
          background: rgba(2, 6, 23, 0.95);
          border-color: rgba(34, 211, 238, 0.5);
          transform: translateY(-2px);
        }

        .tab-button:not(.active):active {
          transform: translateY(0);
        }

        .grid-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .grid-container {
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
          }
        }

        .form-card {
          position: relative;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid #1F2937;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out 0.2s backwards;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .form-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(90deg, #8B5CF6, #A855F7, #22D3EE);
          z-index: 1;
        }

        .form-header {
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #22D3EE 100%);
          padding: 1.25rem;
          color: white;
        }

        @media (min-width: 640px) {
          .form-header {
            padding: 1.5rem;
          }
        }

        .form-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 700;
        }

        @media (min-width: 640px) {
          .form-header h2 {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .form-header h2 {
            font-size: 1.5rem;
          }
        }

        .bmi-display {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #1F2937;
          border-radius: 1rem;
          padding: 1rem;
          margin: 1rem;
          animation: fadeInUp 0.6s ease-out 0.3s backwards;
        }

        @media (min-width: 640px) {
          .bmi-display {
            padding: 1.5rem;
            margin: 1.5rem;
          }
        }

        .bmi-warning {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 1rem;
          padding: 1rem;
          margin: 1rem;
          animation: pulse 2s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .bmi-warning {
            padding: 1.5rem;
            margin: 1.5rem;
          }
        }

        .form-content {
          padding: 1rem;
        }

        @media (min-width: 640px) {
          .form-content {
            padding: 1.5rem;
          }
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #D1D5DB;
          margin-bottom: 0.75rem;
        }

        @media (min-width: 640px) {
          .form-label {
            font-size: 0.9375rem;
          }
        }

        .button-grid {
          display: grid;
          gap: 0.75rem;
        }

        .button-grid.cols-1 {
          grid-template-columns: 1fr;
        }

        .button-grid.cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .button-grid.cols-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .button-grid.cols-4 {
          grid-template-columns: repeat(4, 1fr);
        }

        @media (max-width: 639px) {
          .button-grid.cols-3 {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
          
          .button-grid.cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .option-button {
          position: relative;
          padding: 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid #1F2937;
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          color: #E5E7EB;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          overflow: hidden;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        @media (min-width: 640px) {
          .option-button {
            font-size: 0.9375rem;
            padding: 1rem;
          }
        }

        .option-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s;
        }

        .option-button:hover::before {
          left: 100%;
        }

        .option-button:hover {
          transform: translateY(-2px);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 10px 30px -10px rgba(34, 211, 238, 0.3);
        }

        .option-button:active {
          transform: translateY(0);
        }

        .option-button.selected {
          border-color: rgba(34, 211, 238, 0.6);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(34, 211, 238, 0.2) 100%);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.35);
          animation: glow 2s ease-in-out infinite;
        }

        .option-button.cardio.selected {
          border-color: rgba(239, 68, 68, 0.6);
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        }

        .option-button.strength.selected {
          border-color: rgba(59, 130, 246, 0.6);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
        }

        .option-button.mixed.selected {
          border-color: rgba(168, 85, 247, 0.6);
          background: linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
          box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
        }

        .option-button.flexibility.selected {
          border-color: rgba(251, 191, 36, 0.6);
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.3) 100%);
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
        }

        .workout-icon {
          font-size: 1.25rem;
          margin-bottom: 0.25rem;
        }

        @media (min-width: 640px) {
          .workout-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
        }

        .weight-input-section {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #1F2937;
          border-radius: 1rem;
          padding: 1rem;
          margin-top: 1rem;
          animation: fadeInUp 0.6s ease-out;
        }

        @media (min-width: 640px) {
          .weight-input-section {
            padding: 1.5rem;
          }
        }

        .weight-input {
          width: 100%;
          padding: 0.875rem;
          background: rgba(2, 6, 23, 0.6);
          border: 1px solid #1F2937;
          border-radius: 0.75rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
          min-height: 48px;
        }

        @media (min-width: 640px) {
          .weight-input {
            padding: 1rem;
          }
        }

        .weight-input:focus {
          outline: none;
          border-color: rgba(34, 211, 238, 0.6);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .weight-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .duration-display {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #1F2937;
          border-radius: 1rem;
          padding: 1rem;
          animation: fadeInUp 0.6s ease-out;
        }

        @media (min-width: 640px) {
          .duration-display {
            padding: 1.5rem;
          }
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #22D3EE 100%);
          color: white;
          font-weight: 700;
          font-size: 0.9375rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          margin-top: 1.5rem;
          min-height: 48px;
        }

        @media (min-width: 640px) {
          .submit-button {
            font-size: 1rem;
            margin-top: 2rem;
          }
        }

        .submit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.5s;
        }

        .submit-button:hover::before {
          left: 100%;
        }

        .submit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -15px rgba(139, 92, 246, 0.5);
        }

        .submit-button:active {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .plan-card {
          position: relative;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid #1F2937;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out 0.4s backwards;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        .plan-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 1.5rem 1.5rem 0 0;
          background: linear-gradient(90deg, #8B5CF6, #A855F7, #22D3EE);
          z-index: 1;
        }

        .plan-header {
          background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #22D3EE 100%);
          padding: 1.25rem;
          color: white;
        }

        @media (min-width: 640px) {
          .plan-header {
            padding: 1.5rem;
          }
        }

        .plan-header-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .plan-header-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .plan-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.125rem;
          font-weight: 700;
        }

        @media (min-width: 640px) {
          .plan-title {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .plan-title {
            font-size: 1.5rem;
          }
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (min-width: 640px) {
          .action-buttons {
            gap: 0.75rem;
          }
        }

        .action-button {
          padding: 0.625rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.75rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .action-button:active {
          transform: translateY(0);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .plan-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
          font-size: 0.75rem;
        }

        @media (min-width: 640px) {
          .plan-tags {
            gap: 0.75rem;
            font-size: 0.875rem;
          }
        }

        .plan-tag {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 0.5rem 0.75rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .start-plan-section {
          padding: 1rem;
          border-bottom: 1px solid #1F2937;
        }

        @media (min-width: 640px) {
          .start-plan-section {
            padding: 1.5rem;
          }
        }

        .start-plan-button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          color: white;
          font-weight: 700;
          font-size: 0.9375rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 48px;
        }

        @media (min-width: 640px) {
          .start-plan-button {
            font-size: 1rem;
          }
        }

        .start-plan-button:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -15px rgba(139, 92, 246, 0.5);
        }

        .start-plan-button:active {
          transform: translateY(0);
        }

        .start-plan-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .plan-content {
          padding: 1rem;
          max-height: 70vh;
          overflow-y: auto;
        }

        @media (min-width: 640px) {
          .plan-content {
            padding: 1.5rem;
            max-height: none;
          }
        }

        .plan-content::-webkit-scrollbar {
          width: 8px;
        }

        .plan-content::-webkit-scrollbar-track {
          background: rgba(2, 6, 23, 0.5);
          border-radius: 10px;
        }

        .plan-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          border-radius: 10px;
        }

        .day-card {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #1F2937;
          border-radius: 1rem;
          padding: 1rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.5s ease-out;
          transition: all 0.3s ease;
        }

        @media (min-width: 640px) {
          .day-card {
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
        }

        .day-card:hover {
          transform: translateX(5px);
          border-color: rgba(34, 211, 238, 0.5);
          box-shadow: 0 10px 30px -10px rgba(139, 92, 246, 0.3);
        }

        .day-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        @media (min-width: 640px) {
          .day-title {
            font-size: 1.125rem;
            gap: 0.75rem;
          }
        }

        @media (min-width: 1024px) {
          .day-title {
            font-size: 1.25rem;
          }
        }

        .exercise-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        @media (min-width: 640px) {
          .exercise-list {
            gap: 1rem;
          }
        }

        .exercise-item {
          background: rgba(2, 6, 23, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid #1F2937;
          border-radius: 0.75rem;
          padding: 0.875rem;
          transition: all 0.3s ease;
        }

        @media (min-width: 640px) {
          .exercise-item {
            padding: 1rem;
          }
        }

        .exercise-item:hover {
          background: rgba(2, 6, 23, 0.9);
          border-color: rgba(34, 211, 238, 0.5);
          transform: translateX(5px);
        }

        .exercise-name {
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
          font-size: 0.9375rem;
        }

        @media (min-width: 640px) {
          .exercise-name {
            font-size: 1rem;
          }
        }

        .exercise-details {
          color: #D1D5DB;
          font-size: 0.8125rem;
          line-height: 1.5;
        }

        @media (min-width: 640px) {
          .exercise-details {
            font-size: 0.875rem;
          }
        }

        .empty-state {
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          border: 1px solid #1F2937;
          padding: 2rem;
          text-align: center;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: fadeInUp 0.6s ease-out 0.4s backwards;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.8);
        }

        @media (min-width: 640px) {
          .empty-state {
            padding: 3rem;
            min-height: 500px;
          }
        }

        .empty-icon {
          font-size: 3rem;
          color: #8B5CF6;
          margin-bottom: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        @media (min-width: 640px) {
          .empty-icon {
            font-size: 4rem;
            margin-bottom: 2rem;
          }
        }

        .empty-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #9CA3AF;
          margin-bottom: 0.75rem;
        }

        @media (min-width: 640px) {
          .empty-title {
            font-size: 1.25rem;
          }
        }

        @media (min-width: 1024px) {
          .empty-title {
            font-size: 1.5rem;
          }
        }

        .empty-description {
          color: #6B7280;
          max-width: 28rem;
          font-size: 0.875rem;
          line-height: 1.5;
          padding: 0 1rem;
        }

        @media (min-width: 640px) {
          .empty-description {
            font-size: 1rem;
          }
        }

        .cta-button {
          margin-top: 1.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%);
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          min-height: 44px;
        }

        @media (min-width: 640px) {
          .cta-button {
            font-size: 1rem;
            padding: 1rem 2rem;
          }
        }

        .cta-button:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%);
          transform: translateY(-2px);
          box-shadow: 0 20px 40px -15px rgba(139, 92, 246, 0.5);
        }

        .cta-button:active {
          transform: translateY(0);
        }

        /* Loading spinner animation */
        .spinner {
          animation: rotate 1s linear infinite;
        }

        /* Floating animations for decorative elements */
        @media (min-width: 1024px) {
          .floating-element {
            animation: float 6s ease-in-out infinite;
          }

          .floating-element:nth-child(2) {
            animation-delay: 1s;
          }

          .floating-element:nth-child(3) {
            animation-delay: 2s;
          }
        }

        /* Touch-friendly button states for mobile */
        @media (hover: none) and (pointer: coarse) {
          .option-button:hover {
            transform: none;
          }
          
          .option-button:active {
            transform: scale(0.95);
          }
          
          .submit-button:hover {
            transform: none;
          }
          
          .submit-button:active {
            transform: scale(0.98);
          }
        }
      `}</style>

      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="dark" 
      />

      <div className="main-content">
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Header */}
          {/* <div className="header-section">
            <h1 className="main-title">
              AI Workout Plan Generator
            </h1>
            <p className="subtitle">
              Get personalized workout plans tailored to your goals, fitness level, and preferences
            </p>
          </div> */}

          {/* Tabs */}
          <div className="tab-container">
            <button
              onClick={() => setActiveTab("generate")}
              className={`tab-button ${activeTab === "generate" ? "active" : ""}`}
            >
              <FaDumbbell />
              <span>Generate Plan</span>
            </button>
            <button
              onClick={() => navigate("/my-workout-plan")}
              className="tab-button"
            >
              <FiClock />
              <span>My Plans</span>
            </button>
          </div>

          {activeTab === "generate" ? (
            <div className="grid-container">
              {/* Form Column */}
              <div>
                <div className="form-card">
                  <div className="form-header">
                    <h2>
                      <FaChartLine />
                      <span>Workout Preferences</span>
                    </h2>
                  </div>

                  {/* BMI Data Display */}
                  {bmiData ? (
                    <div className="bmi-display">
                      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                         Your BMI Data
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>BMI:</span>
                          <span style={{ fontWeight: '700', color: 'white' }}>{bmiData.bmi}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>Category:</span>
                          <span style={{ fontWeight: '700', color: 'white' }}>{bmiData.category}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>Weight:</span>
                          <span style={{ fontWeight: '700', color: 'white' }}>{bmiData.weight}kg</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>Height:</span>
                          <span style={{ fontWeight: '700', color: 'white' }}>{bmiData.heightFeet}'{bmiData.heightInches}"</span>
                        </div>
                        {bmiData.age && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#9CA3AF' }}>Age:</span>
                            <span style={{ fontWeight: '700', color: 'white' }}>{bmiData.age} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bmi-warning">
                      <p style={{ color: '#FCA5A5', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <FaHeartbeat />
                        <span>Please go to BMI Calculator to input your data first.</span>
                      </p>
                      <button
                        onClick={() => navigate("/CurrentBMI")}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          minHeight: '44px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Go to BMI Calculator
                      </button>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="form-content">
                    {/* Goal Selection */}
                    <div className="form-group">
                      <label className="form-label">
                         What is your main fitness goal?
                      </label>
                      <div className="button-grid cols-1">
                        {[{
                          value: "build_muscles",
                          label: "Gain Muscles",
                          icon: <GiMuscleUp className="workout-icon" />
                        },
                        {
                          value: "lose_weight",
                          label: "Lose Weight",
                          icon: <GiRunningShoe className="workout-icon" />
                        },
                        {
                          value: "gain_weight",
                          label: "Gain Weight",
                          icon: <GiWeightLiftingUp className="workout-icon" />
                        }].map((goalOption) => (
                          <button
                            key={goalOption.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, goal: goalOption.value })}
                            className={`option-button ${formData.goal === goalOption.value ? "selected" : ""}`}
                            style={{ flexDirection: 'column', gap: '0.25rem' }}
                          >
                            {goalOption.icon}
                            <span>{goalOption.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Weight Goals */}
                    {(formData.goal === "lose_weight" || formData.goal === "gain_weight") && (
                      <div className="weight-input-section">
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                          <FiTarget style={{ display: 'inline', marginRight: '0.5rem' }} />
                          Weight Goals
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                          <label className="form-label">Current Weight (kg)</label>
                          <input
                            type="number"
                            placeholder="Enter your current weight"
                            value={formData.currentWeight}
                            onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                            className="weight-input"
                            disabled={true}
                          />
                        </div>
                        <div>
                          <label className="form-label">Target Weight (kg)</label>
                          <input
                            type="number"
                            placeholder="Enter your target weight"
                            value={formData.targetWeight}
                            onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                            className="weight-input"
                          />
                        </div>
                      </div>
                    )}

                    {/* Time Commitment */}
                    <div className="form-group">
                      <label className="form-label">
                        How much time can you commit per workout?
                      </label>
                      <div className="button-grid cols-2">
                        {[15, 30, 45, 60].map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setFormData({ ...formData, timeCommitment: time.toString() })}
                            className={`option-button ${formData.timeCommitment === time.toString() ? "selected" : ""}`}
                          >
                            {time} min
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Workout Type */}
                    <div className="form-group">
                      <label className="form-label">
                       What type of workout do you prefer?
                      </label>
                      <div className="button-grid cols-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, workoutType: "cardio" })}
                          className={`option-button cardio ${formData.workoutType === "cardio" ? "selected" : ""}`}
                          style={{ flexDirection: 'column', gap: '0.25rem', minHeight: '64px' }}
                        >
                          <GiRunningShoe className="workout-icon" />
                          <span>Cardio</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, workoutType: "strength" })}
                          className={`option-button strength ${formData.workoutType === "strength" ? "selected" : ""}`}
                          style={{ flexDirection: 'column', gap: '0.25rem', minHeight: '64px' }}
                        >
                          <GiWeightLiftingUp className="workout-icon" />
                          <span>Strength</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, workoutType: "mixed" })}
                          className={`option-button mixed ${formData.workoutType === "mixed" ? "selected" : ""}`}
                          style={{ flexDirection: 'column', gap: '0.25rem', minHeight: '64px' }}
                        >
                          <FaDumbbell className="workout-icon" />
                          <span>Mixed</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, workoutType: "flexibility" })}
                          className={`option-button flexibility ${formData.workoutType === "flexibility" ? "selected" : ""}`}
                          style={{ flexDirection: 'column', gap: '0.25rem', minHeight: '64px' }}
                        >
                          <FaHeartbeat className="workout-icon" />
                          <span>Flexibility</span>
                        </button>
                      </div>
                    </div>

                    {/* Intensity Level */}
                    <div className="form-group">
                      <label className="form-label">
                        What's your fitness level?
                      </label>
                      <div className="button-grid cols-3">
                        {["beginner", "intermediate", "advanced"].map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({ ...formData, intensity: level })}
                            className={`option-button ${formData.intensity === level ? "selected" : ""}`}
                            style={{ fontSize: '0.8125rem' }}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Equipment */}
                    <div className="form-group">
                      <label className="form-label">
                       What equipment do you have access to?
                      </label>
                      <div className="button-grid cols-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, equipment: "none" })}
                          className={`option-button ${formData.equipment === "none" ? "selected" : ""}`}
                        >
                          No Equipment (Bodyweight Only)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, equipment: "basic" })}
                          className={`option-button ${formData.equipment === "basic" ? "selected" : ""}`}
                        >
                          Basic (Dumbbells, Resistance Bands)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, equipment: "full_gym" })}
                          className={`option-button ${formData.equipment === "full_gym" ? "selected" : ""}`}
                        >
                          Full Gym Access
                        </button>
                      </div>
                    </div>

                    {/* Days Per Week */}
                    <div className="form-group">
                      <label className="form-label">
                      How many days per week can you workout?
                      </label>
                      <div className="button-grid cols-4">
                        {[3, 4, 5, 6].map((days) => (
                          <button
                            key={days}
                            type="button"
                            onClick={() => setFormData({ ...formData, daysPerWeek: days })}
                            className={`option-button ${formData.daysPerWeek === days ? "selected" : ""}`}
                          >
                            {days}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Duration */}
                    {formData.goal && formData.currentWeight && (formData.goal === "build_muscles" || formData.targetWeight) && (
                      <div className="duration-display">
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                          <FiTrendingUp style={{ display: 'inline', marginRight: '0.5rem' }} />
                          Suggested Plan Duration
                        </h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #22D3EE 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                          {calculateDurationWeeks(
                            formData.currentWeight,
                            formData.targetWeight,
                            formData.goal,
                            bmiData?.age || 25
                          )} weeks
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="submit-button"
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FaBolt />
                          Generate Workout Plan
                        </span>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Plan Column */}
              <div>
                {plan ? (
                  <div className="plan-card">
                    <div className="plan-header">
                      <div className="plan-header-content">
                        <h2 className="plan-title">
                          <FaTrophy />
                          <span>Your Personalized Plan</span>
                        </h2>
                        <div className="action-buttons">
                          <button
                            onClick={copyToClipboard}
                            className="action-button"
                            title="Copy to clipboard"
                          >
                            <FiCopy style={{ fontSize: '1.125rem' }} />
                          </button>
                          <button
                            onClick={regeneratePlan}
                            disabled={loading}
                            className="action-button"
                            title="Regenerate plan"
                          >
                            <FiRefreshCw style={{ fontSize: '1.125rem' }} className={loading ? "spinner" : ""} />
                          </button>
                          <button
                            onClick={savePlan}
                            disabled={loading}
                            className="action-button"
                            title="Save plan"
                          >
                            <FiSave style={{ fontSize: '1.125rem' }} />
                          </button>
                        </div>
                      </div>
                      <div className="plan-tags">
                        <span className="plan-tag"> {formData.timeCommitment} min sessions</span>
                        <span className="plan-tag"> {formData.workoutType} training</span>
                        <span className="plan-tag"> {formData.daysPerWeek} days/week</span>
                        <span className="plan-tag"> {formData.intensity} level</span>
                        {formData.goal && (
                          <span className="plan-tag"> {formData.goal.replace(/_/g, ' ')}</span>
                        )}
                        {(formData.goal === "lose_weight" || formData.goal === "gain_weight") && formData.targetWeight && (
                          <span className="plan-tag"> Target: {formData.targetWeight} kg</span>
                        )}
                        {formData.currentWeight && (formData.goal === "build_muscles" || formData.targetWeight) && (
                          <span className="plan-tag"> {calculateDurationWeeks(formData.currentWeight, formData.targetWeight, formData.goal, bmiData?.age || 25)} weeks</span>
                        )}
                      </div>
                    </div>

                    <div className="start-plan-section">
                      <button
                        onClick={savePlan}
                        disabled={loading}
                        className="start-plan-button"
                      >
                        {loading ? (
                          <>
                            <FiRefreshCw className="spinner" />
                            Starting Plan...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle />
                            Start This Plan
                          </>
                        )}
                      </button>
                      <p style={{ color: '#9CA3AF', fontSize: '0.8125rem', textAlign: 'center', marginTop: '0.75rem', lineHeight: '1.5' }}>
                        This will save and activate this workout plan as your current active plan
                      </p>
                    </div>

                    <div className="plan-content">
                      {plan.map((dayPlan, dayIndex) => (
                        <div key={dayIndex} className="day-card" style={{ animationDelay: `${dayIndex * 0.1}s` }}>
                          <h3 className="day-title">
                            <FiCalendar />
                            <span>{dayPlan.day} {dayPlan.focus && ` - ${dayPlan.focus}`}</span>
                          </h3>
                          {dayPlan.warmup && (
                            <p style={{ fontSize: '0.875rem', color: '#D1D5DB', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                              <span style={{ fontWeight: '700', color: '#22D3EE' }}>🔥 Warmup:</span> {dayPlan.warmup}
                            </p>
                          )}
                          <div className="exercise-list">
                            {dayPlan.exercises.map((exercise, exIndex) => (
                              <div key={exIndex} className="exercise-item">
                                <p className="exercise-name">💪 {exercise.name}</p>
                                <p className="exercise-details">
                                  <strong>Sets:</strong> {exercise.sets} • <strong>Reps:</strong> {exercise.reps} • <strong>Weight:</strong> {exercise.weight || 'Bodyweight'} • <strong>Rest:</strong> {exercise.rest || '60s'}
                                </p>
                                {exercise.notes && (
                                  <p style={{ color: '#9CA3AF', fontSize: '0.75rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                                     <em>{exercise.notes}</em>
                                  </p>
                                )}
                                {exercise.demonstrationLink && (
                                  <a 
                                    href={exercise.demonstrationLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ 
                                      color: '#3B82F6', 
                                      fontSize: '0.75rem', 
                                      textDecoration: 'none',
                                      marginTop: '0.5rem',
                                      display: 'inline-block'
                                    }}
                                  >
                                   Watch Demo →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                          {dayPlan.cooldown && (
                            <p style={{ fontSize: '0.875rem', color: '#D1D5DB', marginTop: '1rem', lineHeight: '1.5' }}>
                              <span style={{ fontWeight: '700', color: '#8B5CF6' }}>❄️ Cooldown:</span> {dayPlan.cooldown}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <FaDumbbell />
                    </div>
                    <h3 className="empty-title">
                      No Workout Plan Generated
                    </h3>
                    <p className="empty-description">
                      {!bmiData
                        ? "Please go to BMI Calculator to input your data first."
                        : "Fill out the form and click 'Generate Workout Plan' to create your personalized fitness routine."}
                    </p>
                    {!bmiData && (
                      <button
                        onClick={() => navigate("/CurrentBMI")}
                        className="cta-button"
                      >
                        Go to BMI Calculator
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
                View Your Saved Workout Plans
              </h2>
              <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', fontSize: '1rem' }}>
                Navigate to the "My Plans" section to see your active and historical workout plans.
              </p>
              <button
                onClick={() => navigate("/my-workout-plan")}
                className="cta-button"
              >
                Go to My Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const calculateDurationWeeks = (currentWeight, targetWeight, goal, age) => {
  const currentW = parseFloat(currentWeight);
  const targetW = parseFloat(targetWeight);
  const currentAge = parseInt(age);

  let weeklyRateKg;
  let defaultDurationWeeks = 12;

  if (goal === "lose_weight") {
    weeklyRateKg = currentAge < 30 ? 0.7 : 0.5;
    const weightDiff = currentW - targetW;
    if (weightDiff <= 0) return 4;
    const weeks = Math.ceil(weightDiff / weeklyRateKg);
    return Math.min(weeks, 52);
  } else if (goal === "gain_weight") {
    weeklyRateKg = currentAge < 30 ? 0.4 : 0.3;
    const weightDiff = targetW - currentW;
    if (weightDiff <= 0) return 4;
    const weeks = Math.ceil(weightDiff / weeklyRateKg);
    return Math.min(weeks, 52);
  } else if (goal === "build_muscles") {
    return 24;
  }

  return defaultDurationWeeks;
};

export default WorkoutPlanGenerator;