import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useNavigate } from "react-router-dom";
import { 
  FaFire, FaTrophy, FaDumbbell, FaAppleAlt, FaRuler, 
  FaHeartbeat, FaWalking, FaBolt, FaArrowUp, FaArrowDown,
  FaLightbulb, FaChartLine, FaCalendarCheck, FaUtensils
} from "react-icons/fa";
import { 
  Sparkles, Target, TrendingUp, Activity, Zap, Award, Calendar, 
  Brain, Flame, Heart, Scale, Timer, ChevronRight, Clock,
  Sun, Moon, Sunrise, Coffee, Dumbbell, Footprints
} from "lucide-react";

// Circular Progress Ring Component
const CircularProgress = ({ percentage, size = 140, strokeWidth = 10, color = "#84CC16" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(132, 204, 22, 0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{percentage}%</span>
        <span className="text-xs text-gray-400">Complete</span>
      </div>
    </div>
  );
};

// Animated Counter
const AnimatedCounter = ({ value, duration = 1200 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setCount(0); return; }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
};

// Weekly Bar Chart Component
const WeeklyBarChart = ({ data, title, icon: Icon, yAxisLabel = "min" }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...data, 60);
  const yLabels = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  
  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-[#84CC16]" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="flex h-48">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between text-xs text-gray-500 pr-2 py-1">
          {yLabels.reverse().map((label, i) => (
            <span key={i}>{label}{yAxisLabel}</span>
          ))}
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end justify-between gap-2 border-l border-b border-gray-700/50 pl-2 pb-1">
          {days.map((day, i) => {
            const height = (data[i] / maxValue) * 100;
            const isToday = i === todayIndex;
            return (
              <div key={day} className="flex flex-col items-center flex-1 h-full justify-end">
                <div 
                  className={`w-full max-w-[32px] rounded-t-md transition-all duration-700 ${
                    isToday 
                      ? 'bg-gradient-to-t from-[#84CC16] to-[#A3E635] shadow-[0_0_15px_rgba(132,204,22,0.4)]' 
                      : 'bg-gradient-to-t from-[#84CC16]/70 to-[#84CC16]/90'
                  }`}
                  style={{ height: `${Math.max(height, 3)}%` }}
                />
                <span className={`text-xs mt-2 ${isToday ? 'text-[#84CC16] font-bold' : 'text-gray-500'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Line Chart Component for Calorie Intake
const CalorieLineChart = ({ intakeData, burnedData, goal }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxValue = Math.max(...intakeData, ...burnedData, goal) * 1.1;
  const chartHeight = 160;
  const chartWidth = 100;
  
  const getY = (value) => chartHeight - (value / maxValue) * chartHeight;
  const goalY = getY(goal);
  
  const intakePath = intakeData.map((val, i) => {
    const x = (i / 6) * chartWidth;
    const y = getY(val);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  const burnedPath = burnedData.map((val, i) => {
    const x = (i / 6) * chartWidth;
    const y = getY(val);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-[#84CC16]" />
          <h3 className="text-lg font-semibold text-white">Calorie Intake</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#84CC16]" />
            <span className="text-gray-400">Intake</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#22D3EE]" />
            <span className="text-gray-400">Burned</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-44">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-500">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Chart Area */}
        <div className="ml-10 h-40 relative">
          <svg className="w-full h-full" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            {/* Goal Line */}
            <line 
              x1="0" y1={goalY} x2={chartWidth} y2={goalY} 
              stroke="#F97316" strokeWidth="1" strokeDasharray="4 2"
            />
            <text x={chartWidth - 15} y={goalY - 5} fill="#F97316" fontSize="8">Goal</text>
            
            {/* Intake Line */}
            <path d={intakePath} fill="none" stroke="#84CC16" strokeWidth="2" strokeLinecap="round" />
            {intakeData.map((val, i) => (
              <circle key={i} cx={(i / 6) * chartWidth} cy={getY(val)} r="4" fill="#84CC16" />
            ))}
            
            {/* Burned Line */}
            <path d={burnedPath} fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" />
            {burnedData.map((val, i) => (
              <circle key={i} cx={(i / 6) * chartWidth} cy={getY(val)} r="3" fill="#22D3EE" />
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            {days.map((day, i) => <span key={i}>{day}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
};

// GitHub-style Streak Heatmap
const StreakHeatmap = ({ activityData }) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#84CC16]" />
          <h3 className="text-lg font-semibold text-white">Consistency</h3>
        </div>
        <span className="text-xs text-gray-500">Last 4 weeks</span>
      </div>
      
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {days.map((day, i) => (
          <div key={i} className="text-center text-xs text-gray-500 font-medium">{day}</div>
        ))}
      </div>
      
      {/* Heatmap Grid - 4 weeks */}
      <div className="space-y-2">
        {activityData.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((active, dayIndex) => (
              <div
                key={dayIndex}
                className={`aspect-square rounded-md transition-all duration-300 ${
                  active 
                    ? 'bg-[#84CC16] shadow-[0_0_8px_rgba(132,204,22,0.4)]' 
                    : 'bg-[#1F2937]/60'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#1F2937]/60" />
          <span className="text-gray-500">Rest</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[#84CC16]" />
          <span className="text-gray-500">Active</span>
        </div>
      </div>
    </div>
  );
};

// BMI Trend Chart
const BMITrendChart = ({ bmiHistory }) => {
  if (!bmiHistory || bmiHistory.length === 0) return null;
  
  const data = [...bmiHistory].reverse().slice(-7);
  const maxBMI = Math.max(...data.map(b => b.bmi), 30);
  const minBMI = Math.min(...data.map(b => b.bmi), 15);
  const range = maxBMI - minBMI || 10;
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-[#EC4899]" />
        <h3 className="text-lg font-semibold text-white">BMI Trend</h3>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-24">
        {data.map((bmi, i) => {
          const height = ((bmi.bmi - minBMI) / range) * 100;
          const isNormal = bmi.category === 'Normal weight';
          return (
            <div key={i} className="flex flex-col items-center flex-1">
              <span className="text-xs text-gray-400 mb-1">{bmi.bmi}</span>
              <div 
                className={`w-full max-w-[24px] rounded-t transition-all duration-500 ${
                  isNormal ? 'bg-[#22C55E]' : 'bg-[#F97316]'
                }`}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
              <span className="text-[10px] text-gray-500 mt-1">
                {new Date(bmi.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* BMI Zones */}
      <div className="flex justify-between mt-3 text-[10px]">
        <span className="text-[#22C55E]">Normal: 18.5-24.9</span>
        <span className="text-[#F97316]">Overweight: 25+</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ points: 0, weeklyPoints: 0, streakCount: 0, badges: [], weeklyChallenge: {} });
  const [adherence, setAdherence] = useState({ active: false, adherenceThisWeek: 0, last4Weeks: [] });
  const [bmiHistory, setBmiHistory] = useState([]);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.email || !user?._id) { setLoading(false); return; }
      try {
        const [s, a, b, w] = await Promise.all([
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/stats`, { params: { email: user.email } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.GAMIFY}/adherence`, { params: { userId: user._id } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.BMI}/history`, { params: { email: user.email } }),
          axios.get(`${API_BASE_URL}${API_ENDPOINTS.AUTH}/workout-plan/active/${user._id}`).catch(() => ({ data: { plan: null } })),
        ]);
        setStats(s.data || {});
        setAdherence(a.data || {});
        setBmiHistory((b.data || []).slice(0, 7));
        setWorkoutPlan(w.data?.plan || null);
      } catch (e) { console.error("Dashboard load error:", e); }
      setLoading(false);
    }
    load();
  }, [user]);

  // Calculate metrics
  const weeklyGoalPercent = useMemo(() => {
    const target = stats.weeklyChallenge?.target || 5;
    const progress = stats.weeklyChallenge?.progress || 0;
    return Math.min(Math.round((progress / target) * 100), 100);
  }, [stats]);

  const caloriesBurned = useMemo(() => {
    const base = (stats.weeklyPoints || 0) * 3 + (stats.streakCount || 0) * 50;
    return Math.max(base, 500);
  }, [stats]);

  const workoutsThisWeek = useMemo(() => {
    return stats.weeklyChallenge?.progress || Math.min(stats.streakCount || 0, 7);
  }, [stats]);

  // Mock data for charts (in real app, fetch from API)
  const weeklyExerciseData = useMemo(() => {
    const base = [25, 15, 0, 45, 35, 50, 30];
    return base.map((v, i) => v + (stats.streakCount > i ? 10 : 0));
  }, [stats]);

  const calorieIntakeData = useMemo(() => [1900, 1850, 2100, 1950, 2180, 2300, 1800], []);
  const calorieBurnedData = useMemo(() => [300, 150, 50, 400, 180, 350, 200], []);
  const calorieGoal = 2000;

  const streakHeatmapData = useMemo(() => {
    const weeks = [];
    for (let w = 0; w < 4; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        week.push(Math.random() > 0.3);
      }
      weeks.push(week);
    }
    return weeks;
  }, []);

  const consistencyScore = useMemo(() => {
    const totalActive = streakHeatmapData.flat().filter(Boolean).length;
    return Math.round((totalActive / 28) * 100);
  }, [streakHeatmapData]);

  const getAIInsight = () => {
    if (stats.streakCount >= 7) return { title: "Excellent Momentum!", text: `Your ${stats.streakCount}-day streak shows remarkable dedication. You're in the top 10% of consistent users!` };
    if (adherence.adherenceThisWeek < 50) return { title: "Optimize Rest Days", text: "Your calorie intake on rest days was 7% above goal. Consider reducing carb intake on rest days to maintain a deficit." };
    if (stats.streakCount >= 3) return { title: "Building Habits", text: "You're developing a solid routine! 3 more days to unlock the 7-day streak badge." };
    return { title: "Start Strong", text: "Begin your fitness journey today! Even 15 minutes of activity can boost your metabolism by 10%." };
  };

  const insight = getAIInsight();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0F1C] text-white">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 animate-pulse">Loading analytics...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C] text-white">
      <NavBar />
      <main className="flex-grow">
        <section className="py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-8 h-8 text-[#84CC16]" />
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">FitSync</h1>
                </div>
                <p className="text-gray-400">Smart Analytics Dashboard</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/30">
                <div className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
                <span className="text-sm text-[#84CC16] font-medium">AI-Powered</span>
              </div>
            </div>

            {/* Primary Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Calories Burned */}
              <div className="relative rounded-2xl bg-[#111827] border border-[#1F2937] p-5 hover:border-[#84CC16]/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#84CC16]/10 group-hover:bg-[#84CC16]/20 transition-colors">
                    <Flame className="w-5 h-5 text-[#84CC16]" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold flex items-center gap-1">
                    <FaArrowUp className="w-2 h-2" /> 12%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={caloriesBurned} />
                </div>
                <p className="text-sm text-gray-400">Calories Burned</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>

              {/* Workouts */}
              <div className="relative rounded-2xl bg-[#111827] border border-[#1F2937] p-5 hover:border-[#84CC16]/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#84CC16]/10 group-hover:bg-[#84CC16]/20 transition-colors">
                    <Dumbbell className="w-5 h-5 text-[#84CC16]" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold flex items-center gap-1">
                    <FaArrowUp className="w-2 h-2" /> 20%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={workoutsThisWeek} />
                </div>
                <p className="text-sm text-gray-400">Workouts</p>
                <p className="text-xs text-gray-500 mt-1">This week</p>
              </div>

              {/* Day Streak */}
              <div className="relative rounded-2xl bg-[#111827] border border-[#1F2937] p-5 hover:border-[#F97316]/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#F97316]/10 group-hover:bg-[#F97316]/20 transition-colors">
                    <Zap className="w-5 h-5 text-[#F97316]" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={stats.streakCount || 0} />
                </div>
                <p className="text-sm text-gray-400">Day Streak</p>
                <p className="text-xs text-[#F97316] mt-1">Keep going! 🔥</p>
              </div>

              {/* Consistency Score */}
              <div className="relative rounded-2xl bg-[#111827] border border-[#1F2937] p-5 hover:border-[#EC4899]/50 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-[#EC4899]/10 group-hover:bg-[#EC4899]/20 transition-colors">
                    <Heart className="w-5 h-5 text-[#EC4899]" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold flex items-center gap-1">
                    <FaArrowUp className="w-2 h-2" /> 3%
                  </span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {consistencyScore}<span className="text-lg">%</span>
                </div>
                <p className="text-sm text-gray-400">Consistency Score</p>
                <p className="text-xs text-gray-500 mt-1">Last 4 weeks</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Weekly Exercise Chart */}
              <div className="lg:col-span-2 rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <WeeklyBarChart 
                  data={weeklyExerciseData} 
                  title="Weekly Exercise" 
                  icon={Dumbbell}
                  yAxisLabel="m"
                />
              </div>

              {/* Weekly Goal */}
              <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-[#84CC16]" />
                  <h3 className="text-lg font-semibold text-white">Weekly Goal</h3>
                </div>
                
                <div className="flex justify-center mb-6">
                  <CircularProgress percentage={weeklyGoalPercent} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 rounded-xl bg-[#1F2937]/50 border border-[#374151]">
                    <div className="text-xl font-bold text-white">
                      {Math.round(weeklyExerciseData.reduce((a, b) => a + b, 0))}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Minutes</div>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#1F2937]/50 border border-[#374151]">
                    <div className="text-xl font-bold text-white">
                      {workoutsThisWeek}/7
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Workouts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Calorie Intake Chart */}
              <div className="lg:col-span-2 rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <CalorieLineChart 
                  intakeData={calorieIntakeData}
                  burnedData={calorieBurnedData}
                  goal={calorieGoal}
                />
              </div>

              {/* Streak Heatmap */}
              <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <StreakHeatmap activityData={streakHeatmapData} />
              </div>
            </div>

            {/* AI Insights Section */}
            <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-[#84CC16]/10">
                  <Brain className="w-5 h-5 text-[#84CC16]" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                <div className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse ml-1" />
              </div>
              
              <div className="p-4 rounded-xl bg-[#1F2937]/30 border border-[#374151]/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#F97316]/10 flex-shrink-0">
                    <FaLightbulb className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-400">{insight.text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: BMI Trend + Quick Actions + Badges */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* BMI Trend */}
              <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                {bmiHistory.length > 0 ? (
                  <BMITrendChart bmiHistory={bmiHistory} />
                ) : (
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 mb-4">No BMI data yet</p>
                    <button 
                      onClick={() => navigate('/CurrentBMI')}
                      className="px-4 py-2 rounded-lg bg-[#84CC16] text-black text-sm font-semibold hover:bg-[#A3E635] transition-colors"
                    >
                      Calculate BMI
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#FACC15]" />
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: FaRuler, label: 'BMI', path: '/CurrentBMI', color: 'bg-[#EC4899]' },
                    { icon: FaDumbbell, label: 'Workout', path: '/Workout', color: 'bg-[#3B82F6]' },
                    { icon: FaUtensils, label: 'Diet', path: '/diet-chart', color: 'bg-[#F97316]' },
                    { icon: FaWalking, label: 'Steps', path: '/daily-steps', color: 'bg-[#22C55E]' },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(action.path)}
                      className={`${action.color} p-3 rounded-xl text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm`}
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-[#FACC15]" />
                  <h3 className="text-lg font-semibold text-white">Badges ({(stats.badges || []).length})</h3>
                </div>
                {(stats.badges || []).length > 0 ? (
                  <div className="space-y-2">
                    {(stats.badges || []).slice(0, 3).map((badge, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#1F2937]/50 border border-[#FACC15]/20">
                        <FaTrophy className="w-4 h-4 text-[#FACC15]" />
                        <span className="text-sm text-white font-medium">{badge}</span>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/leaderboard')}
                      className="w-full py-2 text-sm text-[#84CC16] hover:text-white transition-colors flex items-center justify-center gap-1"
                    >
                      View All <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">Complete challenges to earn badges!</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
