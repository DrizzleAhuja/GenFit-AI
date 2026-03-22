import React, { useState, useEffect } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from "../../context/ThemeContext";
import { Sparkles, Utensils, Droplet, Plus, Minus, Info, Coffee, Sun, Moon, Sunrise, Flame, Camera, X, Zap } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import { toast } from "react-toastify";
import axios from "axios";

const MEAL_TYPES = [
  { id: "Breakfast", label: "Breakfast", icon: <Sunrise className="w-5 h-5 text-amber-400" /> },
  { id: "Lunch", label: "Lunch", icon: <Sun className="w-5 h-5 text-orange-400" /> },
  { id: "Evening Snack", label: "Evening Snack", icon: <Coffee className="w-5 h-5 text-amber-600" /> },
  { id: "Dinner", label: "Dinner", icon: <Moon className="w-5 h-5 text-indigo-400" /> },
];

export default function CalorieTracker() {
  const { darkMode } = useTheme();
  const user = useSelector(selectUser);

  // States
  const [history, setHistory] = useState([]);
  const [todayLogs, setTodayLogs] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState({});
  const [inputs, setInputs] = useState({ Breakfast: "", Lunch: "", "Evening Snack": "", Dinner: "" });
  const [waterIntake, setWaterIntake] = useState(0); // Today's sum
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");

  // Image scanner states
  const [activeScanner, setActiveScanner] = useState(null); // stores the meal.id if a scanner is open
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageQuantity, setImageQuantity] = useState(1);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (user?._id) {
      loadHistory();
    }
    setupNotifications();
  }, [user]);

  const setupNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // Hourly reminder (3600000 ms)
          const interval = setInterval(() => {
            new Notification("Time to hydrate! 💧", {
              body: "Stay on top of your water goal. Drink a glass of water now!",
              icon: "/favicon.ico"
            });
          }, 3600000);
          return () => clearInterval(interval);
        }
      });
    }
  };

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CALORIE_INTAKE}/history/${user._id}?days=1`);
      if (res.data?.success) {
        const logs = res.data.logs || [];
        setHistory(logs);
        
        // Filter for today
        const today = new Date().toISOString().slice(0, 10);
        const todayItems = logs.filter(l => new Date(l.date).toISOString().slice(0, 10) === today);
        setTodayLogs(todayItems);

        // Sum water for today
        const totalWater = todayItems.reduce((acc, log) => acc + (log.waterIntake || 0), 0);
        setWaterIntake(totalWater);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const logMealText = async (mealType) => {
    const text = inputs[mealType];
    if (!text?.trim()) {
      toast.error("Please enter what you ate");
      return;
    }

    setLoadingMeals((prev) => ({ ...prev, [mealType]: true }));
    try {
      // 1. Get estimate from Gemini
      const estimateRes = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CALORIE_INTAKE}/estimate`, { text, mealType });
      if (!estimateRes.data?.success) throw new Error("Failed to estimate calories");
      
      const { food_items, total_estimated_calories } = estimateRes.data.data;
      
      // 2. Save to backend
      const payload = {
        userId: user._id,
        totalCalories: total_estimated_calories || 0,
        source: "text",
        waterIntake: 0,
        items: (food_items || []).map(f => ({
          name: f.name,
          caloriesPerItem: f.estimated_calories,
          quantity: 1,
          totalCalories: f.estimated_calories,
          mealType: mealType
        }))
      };

      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CALORIE_INTAKE}/log`, payload);
      
      toast.success(`Logged ${Math.round(total_estimated_calories)} kcal for ${mealType}`);
      setInputs((prev) => ({ ...prev, [mealType]: "" }));
      loadHistory(); // Refresh data

    } catch (err) {
      console.error(err);
      toast.error("Failed to log meal. Please try again.");
    } finally {
      setLoadingMeals((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const logWater = async (amount) => {
    const newWater = waterIntake + amount;
    if (newWater < 0) return;
    
    // Optimistic update
    setWaterIntake(newWater);

    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CALORIE_INTAKE}/log`, {
        userId: user._id,
        totalCalories: 0,
        source: "water",
        waterIntake: amount, // logging the diff
        items: []
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to log water");
      setWaterIntake(waterIntake); // Revert
    }
  };

  // --- Image Scanner Logic ---
  const handleFileChange = (e) => {
    setImageError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setImageBase64(event.target.result);
    };
    reader.onerror = () => {
      setImageError("Failed to read image. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async (mealType) => {
    if (!imageBase64) return;
    
    setIsAnalyzingImage(true);
    setImageError("");

    try {
      // 1. Send image to scan endpoint
      const scanRes = await axios.post(`${API_BASE_URL}/api/auth/calorie-tracker/scan`, {
        imageBase64,
        userNote: `Meal type: ${mealType}`,
        userId: user._id
      });

      if (!scanRes.data?.success) throw new Error("Failed to scan image");

      const { food_items, total_estimated_calories } = scanRes.data.data;
      const totalCaloriesForQuantity = total_estimated_calories * imageQuantity;

      // 2. Save log to backend
      const payload = {
        userId: user._id,
        totalCalories: totalCaloriesForQuantity,
        source: "image",
        waterIntake: 0,
        items: (food_items || []).map(f => ({
          name: f.name,
          caloriesPerItem: f.estimated_calories,
          quantity: imageQuantity,
          totalCalories: f.estimated_calories * imageQuantity,
          mealType: mealType
        }))
      };

      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.CALORIE_INTAKE}/log`, payload);
      
      toast.success(`Scanned and logged ${Math.round(totalCaloriesForQuantity)} kcal for ${mealType}`);
      
      // Reset image state
      closeScanner();
      loadHistory(); // Refresh dashboard

    } catch (err) {
      console.error("Scan error:", err);
      if (err.response?.status === 403) {
        setLimitMessage(err.response.data?.error || "You have reached your free tier limit for Photo Scans. Please upgrade to Pro.");
        setShowLimitModal(true);
      } else {
        setImageError(err.response?.data?.error || "Failed to analyze image. Please try again.");
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const openScanner = (mealId) => {
    closeScanner(); // reset previous
    setActiveScanner(mealId);
  };

  const closeScanner = () => {
    setActiveScanner(null);
    setImagePreview(null);
    setImageBase64(null);
    setImageQuantity(1);
    setImageError("");
  };

  // --- Aggregations ---
  const totalCaloriesToday = todayLogs.reduce((acc, log) => acc + (log.totalCalories || 0), 0);
  
  // Group items by meal
  const mealItems = { Breakfast: [], Lunch: [], "Evening Snack": [], Dinner: [] };
  let hasItems = false;
  todayLogs.forEach(log => {
    (log.items || []).forEach(item => {
      const mt = item.mealType || "Other";
      if (mealItems[mt]) {
        mealItems[mt].push(item);
        hasItems = true;
      }
    });
  });

  const getMealTotal = (mealType) => {
    return mealItems[mealType].reduce((sum, item) => sum + (item.totalCalories || 0), 0);
  };

  const cardClass = "relative rounded-2xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300";

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "bg-[#05010d] text-white" : "bg-[#020617] text-gray-100"}`}>
      <NavBar />
      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          {/* Background glows */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <header className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Utensils className="w-5 h-5 text-[#FACC15]" />
                <span className="text-sm font-semibold text-gray-100">Smart Diet Journal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
                Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]">Nutrition</span> Log
              </h1>
              <p className="text-gray-400 text-sm max-w-2xl mx-auto">
                Type what you ate or snap a picture, and Gemini AI will estimate your calories instantly. Don't forget to track your hydration!
              </p>
            </header>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Calorie Summary */}
              <div className={`${cardClass} p-6 flex items-center justify-between`}>
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]"></div>
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Calories Consumed Today</h3>
                  <div className="text-4xl font-black text-white flex items-baseline gap-2">
                    {Math.round(totalCaloriesToday)} <span className="text-lg text-[#22D3EE] font-semibold">kcal</span>
                  </div>
                </div>
                <div className="p-4 bg-[#22D3EE]/10 rounded-2xl border border-[#22D3EE]/20 text-[#22D3EE]">
                  <Flame className="w-8 h-8" />
                </div>
              </div>

              {/* Water Summary */}
              <div className={`${cardClass} p-6 flex flex-col justify-center`}>
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9]"></div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-400 text-sm font-medium flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-[#38BDF8]" /> Water Intake
                  </h3>
                  <span className="text-xs text-[#38BDF8] font-semibold">{waterIntake} / 8 Glasses</span>
                </div>
                
                {/* Visual Tracker */}
                <div className="flex items-center justify-between gap-1 mb-4 mt-2">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-8 flex-1 rounded-sm transition-all duration-500 ${i < waterIntake ? 'bg-gradient-to-t from-[#0EA5E9] to-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-[#1F2937]/60'}`}
                    />
                  ))}
                </div>

                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={() => logWater(1)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] text-white font-bold hover:opacity-90 transition-opacity shadow-md"
                  >
                    <Plus className="w-5 h-5" /> Add a Glass
                  </button>
                </div>
              </div>
            </div>

            {/* Meal Logging Grid */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold border-b border-[#1F2937] pb-2">Log Your Meals</h2>
              
              <div className="grid grid-cols-1 gap-6">
                {MEAL_TYPES.map((meal) => {
                  const items = mealItems[meal.id];
                  const total = getMealTotal(meal.id);
                  const isLoggingText = loadingMeals[meal.id];
                  const isThisScannerActive = activeScanner === meal.id;

                  return (
                    <div key={meal.id} className={`${cardClass} overflow-hidden`}>
                      {/* Header */}
                      <div className="bg-[#1F2937]/30 px-5 py-4 flex items-center justify-between border-b border-[#1F2937]/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#020617] rounded-lg border border-[#1F2937] shadow-inner">
                            {meal.icon}
                          </div>
                          <h3 className="text-lg font-bold text-white tracking-wide">{meal.label}</h3>
                        </div>
                        <div className="text-sm font-semibold text-[#22D3EE] bg-[#22D3EE]/10 px-3 py-1 rounded-full border border-[#22D3EE]/20">
                          {Math.round(total)} kcal
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Food List */}
                        {items && items.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-[#020617]/50 rounded-md px-3 py-2 border border-[#1F2937]/50">
                                <div>
                                  <div className="text-sm text-gray-200 font-medium capitalize">{item.name}</div>
                                  <div className="text-[10px] text-gray-500">Qty: {item.quantity || 1}</div>
                                </div>
                                <div className="text-sm font-bold text-gray-300">
                                  {Math.round(item.totalCalories || 0)} <span className="text-[10px] text-gray-500 font-normal">kcal</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isThisScannerActive ? (
                          // Text Input Area
                          <div className="relative flex items-center gap-3 mt-2">
                            <button
                              onClick={() => openScanner(meal.id)}
                              title="Scan Food Image"
                              className="shrink-0 flex items-center justify-center p-3 rounded-xl bg-[#1F2937]/80 text-gray-300 hover:text-white hover:bg-[#374151] border border-gray-700 transition-colors shadow-sm"
                            >
                              <Camera className="w-5 h-5 text-[#8B5CF6]" />
                            </button>
                            <input
                              type="text"
                              value={inputs[meal.id] || ""}
                              onChange={(e) => setInputs(prev => ({ ...prev, [meal.id]: e.target.value }))}
                              placeholder={`E.g., "2 parathas with curd" or "1 chicken sandwich"`}
                              className="w-full bg-[#020617]/80 text-sm text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#8B5CF6] transition-colors shadow-inner"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') logMealText(meal.id);
                              }}
                            />
                            <button
                              onClick={() => logMealText(meal.id)}
                              disabled={isLoggingText}
                              className={`shrink-0 flex items-center justify-center h-11 px-5 rounded-xl font-bold transition-all ${
                                isLoggingText 
                                  ? "bg-[#8B5CF6]/40 text-gray-400 cursor-wait"
                                  : "bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white hover:opacity-90 shadow-md"
                              }`}
                            >
                              {isLoggingText ? "Analyzing..." : "Log"}
                            </button>
                          </div>
                        ) : (
                          // Image Scanner Area for this Meal
                          <div className="mt-2 p-4 bg-[#020617]/50 rounded-xl border border-[#8B5CF6]/30">
                            <div className="flex items-center justify-between mb-3 border-b border-[#1F2937] pb-2">
                              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#A855F7]">
                                <Sparkles className="w-4 h-4" /> Scan Food for {meal.label}
                              </h4>
                              <button onClick={closeScanner} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1 space-y-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="block w-full text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-semibold file:bg-[#8B5CF6]/20 file:text-[#8B5CF6] hover:file:bg-[#8B5CF6]/30 cursor-pointer"
                                />
                                {imagePreview && (
                                  <div className="rounded-lg overflow-hidden border border-[#1F2937] flex items-center justify-center bg-[#020617] h-32 w-full">
                                    <img src={imagePreview} alt="Preview" className="max-h-32 object-contain" />
                                  </div>
                                )}
                                {imageError && <p className="text-red-400 text-[11px]">{imageError}</p>}
                              </div>
                              
                              <div className="flex-1 flex flex-col justify-end space-y-3">
                                <div>
                                  <label className="text-xs text-gray-400 block mb-1">Servings</label>
                                  <input 
                                    type="number" 
                                    min="1" max="10" 
                                    value={imageQuantity} 
                                    onChange={e => setImageQuantity(Number(e.target.value) || 1)}
                                    className="w-full bg-[#020617]/80 text-sm text-white border border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-[#8B5CF6]"
                                  />
                                </div>
                                <button
                                  onClick={() => handleAnalyzeImage(meal.id)}
                                  disabled={isAnalyzingImage || !imageBase64}
                                  className={`w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                                    isAnalyzingImage || !imageBase64
                                      ? "bg-[#1F2937] text-gray-500 cursor-not-allowed"
                                      : "bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white hover:opacity-90 shadow-md"
                                  }`}
                                >
                                  {isAnalyzingImage ? "Scanning..." : "Analyze Image"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {hasItems && (
              <div className="mt-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Info className="w-4 h-4" /> AI estimates are approximations based on typical portion sizes.
              </div>
            )}

          </div>
        </section>
      </main>
      <Footer />
      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="relative p-6 max-w-sm w-full mx-4 rounded-2xl border border-[#1F2937] bg-[#020617]/90 text-center shadow-[0_20px_60px_rgba(139,92,246,0.2)] overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl" />
            
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/30">
                <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            <h3 className="text-xl font-extrabold text-white mb-2">Limit Reached!</h3>
            <p className="text-xs text-gray-400 mb-6">{limitMessage}</p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate('/')} 
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg hover:scale-105 transition-transform"
              >
                Upgrade to PRO (₹199)
              </button>
              <button 
                onClick={() => setShowLimitModal(false)} 
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
