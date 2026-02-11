// import React, { useState, useEffect } from 'react';
// import Papa from 'papaparse';
// import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
// import NavBar from '../../pages/HomePage/NavBar';
// import Footer from '../../pages/HomePage/Footer';
// import { useTheme } from '../../context/ThemeContext';
// import './CalorieTracker.css';

// const CalorieTracker = () => {
//   const [foodData, setFoodData] = useState([]);
//   const [selectedFoods, setSelectedFoods] = useState([]);
//   const [quantities, setQuantities] = useState({});
//   const [numDishes, setNumDishes] = useState(1);
//   const [nutritionSummary, setNutritionSummary] = useState({
//     calories: 0,
//     protein: 0,
//     carbs: 0,
//     fat: 0,
//     sugar: 0,
//     calcium: 0,
//   });

//   useEffect(() => {
//     Papa.parse('/food1.csv', {
//       download: true,
//       header: true,
//       skipEmptyLines: true,
//       complete: (results) => {
//         setFoodData(results.data);
//       },
//       error: (error) => {
//         console.error("Error parsing CSV:", error);
//       }
//     });
//   }, []);

//   useEffect(() => {
//     calculateNutritionSummary();
//   }, [selectedFoods, quantities]);

//   const handleFoodSelection = (index, foodName) => {
//     const updatedSelectedFoods = [...selectedFoods];
//     updatedSelectedFoods[index] = foodName;
//     setSelectedFoods(updatedSelectedFoods);
//   };

//   const handleQuantityChange = (index, quantity) => {
//     setQuantities((prevQuantities) => ({
//       ...prevQuantities,
//       [index]: parseInt(quantity, 10),
//     }));
//   };

//   const calculateNutritionSummary = () => {
//     let totalCalories = 0;
//     let totalProtein = 0;
//     let totalCarbs = 0;
//     let totalFat = 0;
//     let totalSugar = 0;
//     let totalCalcium = 0;

//     selectedFoods.forEach((foodName, index) => {
//       const foodItem = foodData.find((food) => food.Shrt_Desc === foodName);
//       const quantity = quantities[index] || 1;

//       if (foodItem) {
//         totalCalories += parseFloat(foodItem.Energ_Kcal || 0) * quantity;
//         totalProtein += parseFloat(foodItem['Protein_(g)'] || 0) * quantity;
//         totalCarbs += parseFloat(foodItem['Carbohydrt_(g)'] || 0) * quantity;
//         totalFat += parseFloat(foodItem['Lipid_Tot_(g)'] || 0) * quantity;
//         totalSugar += parseFloat(foodItem['Sugar_Tot_(g)'] || 0) * quantity;
//         totalCalcium += parseFloat(foodItem['Calcium_(mg)'] || 0) * quantity;
//       }
//     });

//     setNutritionSummary({
//       calories: totalCalories,
//       protein: totalProtein,
//       carbs: totalCarbs,
//       fat: totalFat,
//       sugar: totalSugar,
//       calcium: totalCalcium,
//     });
//   };

//   const getChartData = (nutrientKey) => {
//     return selectedFoods.map((foodName, index) => {
//       const foodItem = foodData.find((food) => food.Shrt_Desc === foodName);
//       const quantity = quantities[index] || 1;
//       const value = foodItem ? parseFloat(foodItem[nutrientKey] || 0) * quantity : 0;
//       return { name: foodName, value: value };
//     }).filter(item => item.value > 0);
//   };

//   const COLORS = ['#60A5FA', '#34D399', '#FCD34D', '#FB923C', '#C4B5FD', '#FDBA74']; // Adjusted colors for dark mode

//   const { darkMode } = useTheme();
//   // const darkMode=1;

//   return (
//     <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
//       <NavBar />
//       <div className="calorie-tracker-container mx-auto p-4 max-w-4xl">
//         <h2 className="tracker-title text-3xl font-bold mb-6 text-center text-white">Nutrition Calorie Tracker</h2>

//         <div className={`input-section p-6 rounded-lg shadow-md mb-8 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//           <label className={`block text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Number of dishes:</label>
//           <input
//             type="number"
//             min="1"
//             max="10"
//             value={numDishes}
//             onChange={(e) => setNumDishes(parseInt(e.target.value, 10))}
//             className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
//           />
//         </div>

//         {[...Array(numDishes)].map((_, index) => (
//           <div key={index} className={`dish-selection p-6 rounded-lg shadow-md mb-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//             <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Dish {index + 1}</h3>
//             <select
//               onChange={(e) => handleFoodSelection(index, e.target.value)}
//               value={selectedFoods[index] || ''}
//               className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
//             >
//               <option value="">Select a food</option>
//               {foodData.map((food) => (
//                 <option key={food.NDB_No} value={food.Shrt_Desc}>
//                   {food.Shrt_Desc}
//                 </option>
//               ))}
//             </select>
//             <input
//               type="number"
//               min="1"
//               max="10"
//               value={quantities[index] || 1}
//               onChange={(e) => handleQuantityChange(index, e.target.value)}
//               className={`w-full p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
//             />
//             {selectedFoods[index] && (
//               <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Calories per serving: {foodData.find(food => food.Shrt_Desc === selectedFoods[index])?.Energ_Kcal || 0}</p>
//             )}
//           </div>
//         ))}

//         <div className={`summary-section p-6 rounded-lg shadow-md mb-8 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//           <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Total Nutrition</h3>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Calories: <span className="font-bold text-blue-400">{nutritionSummary.calories.toFixed(2)} Kcal</span></p>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Protein: <span className="font-bold text-green-400">{nutritionSummary.protein.toFixed(2)} g</span></p>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Carbs: <span className="font-bold text-yellow-400">{nutritionSummary.carbs.toFixed(2)} g</span></p>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Fat: <span className="font-bold text-orange-400">{nutritionSummary.fat.toFixed(2)} g</span></p>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Sugar: <span className="font-bold text-purple-400">{nutritionSummary.sugar.toFixed(2)} g</span></p>
//           <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Calcium: <span className="font-bold text-pink-400">{nutritionSummary.calcium.toFixed(2)} mg</span></p>
//         </div>

//         <div className="charts-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {getChartData('Energ_Kcal').length > 0 && (
//             <div className={`chart-item p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//               <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calorie Breakdown</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={getChartData('Energ_Kcal')}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                     label={{ fill: darkMode ? '#E5E7EB' : '#374151', fontSize: 12 }} // Dynamic label color
//                   >
//                     {getChartData('Energ_Kcal').map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: darkMode ? '#4B5563' : '#D1D5DB', color: darkMode ? '#E5E7EB' : '#1F2937' }} itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                   <Legend wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//           {getChartData('Protein_(g)').length > 0 && (
//             <div className={`chart-item p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//               <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Protein Breakdown</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={getChartData('Protein_(g)')}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                     label={{ fill: darkMode ? '#E5E7EB' : '#374151', fontSize: 12 }}
//                   >
//                     {getChartData('Protein_(g)').map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: darkMode ? '#4B5563' : '#D1D5DB', color: darkMode ? '#E5E7EB' : '#1F2937' }} itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                   <Legend wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//           {getChartData('Carbohydrt_(g)').length > 0 && (
//             <div className={`chart-item p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//               <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Carbs Breakdown</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={getChartData('Carbohydrt_(g)')}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                     label={{ fill: darkMode ? '#E5E7EB' : '#374151', fontSize: 12 }}
//                   >
//                     {getChartData('Carbohydrt_(g)').map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: darkMode ? '#4B5563' : '#D1D5DB', color: darkMode ? '#E5E7EB' : '#1F2937' }} itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                   <Legend wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//           {getChartData('Lipid_Tot_(g)').length > 0 && (
//             <div className={`chart-item p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//               <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Fat Breakdown</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={getChartData('Lipid_Tot_(g)')}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                     label={{ fill: darkMode ? '#E5E7EB' : '#374151', fontSize: 12 }}
//                   >
//                     {getChartData('Lipid_Tot_(g)').map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: darkMode ? '#4B5563' : '#D1D5DB', color: darkMode ? '#E5E7EB' : '#1F2937' }} itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                   <Legend wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//           {getChartData('Sugar_Tot_(g)').length > 0 && (
//             <div className={`chart-item p-6 rounded-lg shadow-md border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
//               <h4 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Sugar Breakdown</h4>
//               <ResponsiveContainer width="100%" height={200}>
//                 <PieChart>
//                   <Pie
//                     data={getChartData('Sugar_Tot_(g)')}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={60}
//                     fill="#8884d8"
//                     dataKey="value"
//                     nameKey="name"
//                     label={{ fill: darkMode ? '#E5E7EB' : '#374151', fontSize: 12 }}
//                   >
//                     {getChartData('Sugar_Tot_(g)').map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? '#374151' : '#F9FAFB', borderColor: darkMode ? '#4B5563' : '#D1D5DB', color: darkMode ? '#E5E7EB' : '#1F2937' }} itemStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                   <Legend wrapperStyle={{ color: darkMode ? '#E5E7EB' : '#1F2937' }} />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default CalorieTracker;
import React, { useState } from "react";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { API_BASE_URL } from "../../../config/api";

const CalorieTracker = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [userNote, setUserNote] = useState("");
  const [items, setItems] = useState([]); // { name, confidence, calories }
  const [totalCalories, setTotalCalories] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiNotes, setAiNotes] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      // Show the original (full-res) image as preview
      setImagePreview(result);

      // Internally resize to a smaller square (e.g. 512x512) before sending to backend
      const img = new Image();
      img.onload = () => {
        const CANVAS_SIZE = 512; // or 224 if you want smaller
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;

        // Cover strategy: scale and center-crop to square
        const scale = Math.max(
          CANVAS_SIZE / img.width,
          CANVAS_SIZE / img.height
        );
        const x = (CANVAS_SIZE / 2) - (img.width * scale) / 2;
        const y = (CANVAS_SIZE / 2) - (img.height * scale) / 2;

        ctx.drawImage(
          img,
          x,
          y,
          img.width * scale,
          img.height * scale
        );

        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImageBase64(resizedDataUrl);

        // Reset previous results
        setItems([]);
        setTotalCalories(0);
        setAiNotes("");
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const recalcTotal = (updatedItems) => {
    const sum = updatedItems.reduce(
      (acc, it) => acc + (Number(it.calories) || 0),
      0
    );
    setTotalCalories(sum);
  };

  const handleCaloriesChange = (index, value) => {
    const updated = items.map((it, i) =>
      i === index ? { ...it, calories: value } : it
    );
    setItems(updated);
    recalcTotal(updated);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError("Please upload a food image first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/calorie-tracker/scan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageBase64,
            userNote: userNote || undefined,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to analyze food image");
      }

      const data = await res.json();
      const payload = data.data || {};
      const foodItems = payload.food_items || [];

      const mapped = foodItems.map((fi) => ({
        name: fi.name || "Unknown food",
        confidence:
          typeof fi.confidence === "number"
            ? Math.round(fi.confidence * 100)
            : null,
        calories:
          typeof fi.estimated_calories === "number"
            ? fi.estimated_calories
            : 0,
      }));

      setItems(mapped);
      recalcTotal(mapped);
      setAiNotes(payload.notes || "");
    } catch (e) {
      console.error("Calorie tracker analyze error:", e);
      setError(e.message || "Something went wrong while analyzing the image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            AI Calorie Scanner
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-300">
            Upload a photo of your meal and let AI estimate calories. You can
            adjust the values if the portion looks different.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Image upload & preview */}
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-3">
                Upload food image
              </h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-xs text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-gray-900 hover:file:bg-emerald-400"
              />
              <textarea
                placeholder="Optional: add a note like '1 plate, medium portion' or 'only half the bowl is eaten'."
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                className="mt-3 w-full rounded-lg bg-gray-900 border border-gray-700 px-3 py-2 text-xs text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !imageBase64}
                className={`mt-4 w-full px-4 py-2 rounded-lg text-sm font-semibold ${
                  loading || !imageBase64
                    ? "bg-emerald-500/40 text-gray-900 cursor-not-allowed"
                    : "bg-emerald-500 text-gray-900 hover:bg-emerald-400"
                }`}
              >
                {loading ? "Analyzing..." : "Analyze Food Image"}
              </button>
              {error && (
                <p className="mt-2 text-xs text-red-400">
                  {error}
                </p>
              )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-3">
                Preview
              </h2>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-700 bg-black/60 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-gray-500">
                    No image selected. Upload a photo of your meal to begin.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Results & editing */}
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-3">
                Estimated calories
              </h2>

              {items.length === 0 ? (
                <p className="text-xs text-gray-400">
                  After you analyze an image, detected foods and calories will
                  appear here. You can then fine-tune the numbers if AI got the
                  portion slightly wrong.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      Total estimated calories
                    </span>
                    <span className="text-2xl font-bold text-emerald-400">
                      {Math.round(totalCalories)} kcal
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-3 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between gap-2 text-xs bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-100 truncate">
                            {item.name}
                          </div>
                          {item.confidence != null && (
                            <div className="text-[10px] text-gray-500">
                              AI confidence: {item.confidence}%
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <label className="text-[10px] text-gray-400">
                            Calories
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.calories}
                            onChange={(e) =>
                              handleCaloriesChange(idx, e.target.value)
                            }
                            className="w-24 rounded-md bg-gray-800 border border-gray-600 px-2 py-1 text-right text-xs text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {aiNotes && (
                    <p className="mt-2 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">
                        AI notes:
                      </span>{" "}
                      {aiNotes}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 space-y-2">
              <h2 className="text-sm font-semibold text-gray-100 mb-1">
                How this works
              </h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Upload a clear photo of your meal from above or at an angle.
                </li>
                <li>Optionally add a short note about portion size.</li>
                <li>Tap “Analyze Food Image” to get AI calorie estimates.</li>
                <li>
                  Adjust the calories per item if the portion looks different.
                </li>
              </ol>
              <p className="text-[11px] text-gray-400 mt-1">
                These are estimates only. For medical or very strict dieting
                purposes, double‑check with a nutrition professional.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CalorieTracker;

