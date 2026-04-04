// BMICalculator.js - Updated with professional styling
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaWeight,
  FaRulerVertical,
  FaBirthdayCake,
  FaVenusMars,
  FaHistory,
} from "react-icons/fa";
import { GiBodyHeight } from "react-icons/gi";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import {
  BMI_LIMITS,
  validateBmiForm,
  bmiCategoryFromValue,
  heightMetersFromFtIn,
} from "./bmiFormValidation";

export default function BMICalculator() {
  const user = useSelector(selectUser);
  const [weight, setWeight] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [history, setHistory] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user?.email) fetchBMIHistory();
  }, [user]);

  const fetchBMIHistory = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.BMI}/history`,
        {
          params: { email: user.email },
        }
      );
      setHistory(res.data);
    } catch (error) {
      console.error("Error fetching BMI history", error);
    }
  };

  const clearError = (keys) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      keys.forEach((k) => delete next[k]);
      return next;
    });
  };

  const calculateBMI = () => {
    const form = {
      heightFeet,
      heightInches,
      weight,
      age,
    };
    const { ok, errors, firstMessage } = validateBmiForm(form);
    if (!ok) {
      setFieldErrors(errors);
      toast.error(firstMessage || "Please fix the highlighted fields.");
      return;
    }
    setFieldErrors({});

    const heightInMeters = heightMetersFromFtIn(heightFeet, heightInches);
    const weightKg = parseFloat(String(weight).trim().replace(",", "."));
    const bmiNum = weightKg / (heightInMeters * heightInMeters);
    const calculatedBMI = bmiNum.toFixed(2);
    const bmiCategory = bmiCategoryFromValue(bmiNum);

    setBmi(calculatedBMI);
    setCategory(bmiCategory);
    saveBMI(calculatedBMI, bmiCategory, weightKg);
  };

  const saveBMI = async (calculatedBMI, bmiCategory, weightKg) => {
    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.BMI}/save`, {
        email: user.email,
        heightFeet: parseInt(heightFeet, 10),
        heightInches: parseInt(heightInches, 10),
        weight: weightKg,
        age: parseInt(age, 10),
        diseases: [],
        allergies: [],
        bmi: parseFloat(calculatedBMI),
        category: bmiCategory,
      });
      toast.success("BMI saved successfully");
      fetchBMIHistory();
    } catch (error) {
      console.error("Error saving BMI", error);
      toast.error("Failed to save BMI");
    }
  };

  const getBMIColor = (bmiValue) => {
    const n = Number(bmiValue);
    if (!Number.isFinite(n)) return "text-gray-500";
    if (n < 18.5) return "text-blue-500";
    if (n < 24.9) return "text-green-500";
    if (n < 29.9) return "text-yellow-500";
    if (n < 35) return "text-orange-500";
    return "text-red-500";
  };

  const inputErr = (key) =>
    fieldErrors[key] ? "border-red-500 focus:border-red-400" : "border-gray-600";

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            BMI Calculator
          </h1>
          <p className="text-xl text-gray-300">
            Track your Body Mass Index and monitor your health progress
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <FaWeight className="mr-3 text-green-400" /> Calculate Your BMI
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FaBirthdayCake className="mr-2 text-gray-400" /> Age
                </label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  min={BMI_LIMITS.ageMin}
                  max={BMI_LIMITS.ageMax}
                  step={1}
                  onChange={(e) => {
                    clearError(["age"]);
                    setAge(e.target.value);
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-700 border focus:ring-1 focus:ring-green-500 text-white ${inputErr(
                    "age"
                  )}`}
                />
                {fieldErrors.age && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FaVenusMars className="mr-2 text-gray-400" /> Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <FaWeight className="mr-2 text-gray-400" /> Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 72.5 kg"
                  value={weight}
                  min={BMI_LIMITS.weightKgMin}
                  max={BMI_LIMITS.weightKgMax}
                  step="0.01"
                  onChange={(e) => {
                    clearError(["weight"]);
                    setWeight(e.target.value);
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-700 border focus:ring-1 focus:ring-green-500 text-white ${inputErr(
                    "weight"
                  )}`}
                />
                {fieldErrors.weight && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.weight}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <GiBodyHeight className="mr-2 text-gray-400" /> Height
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Feet"
                      value={heightFeet}
                      min={BMI_LIMITS.feetMin}
                      max={BMI_LIMITS.feetMax}
                      step={1}
                      onChange={(e) => {
                        clearError(["heightFeet", "height"]);
                        setHeightFeet(e.target.value);
                      }}
                      className={`w-full p-3 rounded-lg bg-gray-700 border focus:ring-1 focus:ring-green-500 text-white ${inputErr(
                        "heightFeet"
                      )}`}
                    />
                    <span className="absolute right-3 top-3 text-gray-400">
                      ft
                    </span>
                    {fieldErrors.heightFeet && (
                      <p className="text-xs text-red-400 mt-1">
                        {fieldErrors.heightFeet}
                      </p>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Inches"
                      value={heightInches}
                      min={0}
                      max={11}
                      step={1}
                      onChange={(e) => {
                        clearError(["heightInches", "height"]);
                        setHeightInches(e.target.value);
                      }}
                      className={`w-full p-3 rounded-lg bg-gray-700 border focus:ring-1 focus:ring-green-500 text-white ${inputErr(
                        "heightInches"
                      )}`}
                    />
                    <span className="absolute right-3 top-3 text-gray-400">
                      in
                    </span>
                    {fieldErrors.heightInches && (
                      <p className="text-xs text-red-400 mt-1">
                        {fieldErrors.heightInches}
                      </p>
                    )}
                  </div>
                </div>
                {fieldErrors.height && (
                  <p className="text-xs text-red-400 mt-2">{fieldErrors.height}</p>
                )}
              </div>

              <button
                onClick={calculateBMI}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:opacity-90 transition-all"
              >
                Calculate BMI
              </button>
            </div>

            {bmi && (
              <div className="mt-8 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Your Results
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">Your BMI:</p>
                    <p className={`text-3xl font-bold ${getBMIColor(bmi)}`}>
                      {bmi}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300">Category:</p>
                    <p className={`text-xl font-semibold ${getBMIColor(bmi)}`}>
                      {category}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* History Section */}
          <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <FaHistory className="mr-3 text-green-400" /> BMI History
            </h2>

            {history.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-green-300 transition"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span
                          className={`text-lg font-semibold ${getBMIColor(
                            entry.bmi
                          )}`}
                        >
                          {entry.bmi}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                          ({entry.category})
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          entry.category === "Underweight"
                            ? "bg-blue-400"
                            : entry.category === "Normal weight"
                            ? "bg-green-400"
                            : entry.category === "Overweight"
                            ? "bg-yellow-400"
                            : entry.category === "Obese"
                            ? "bg-orange-400"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (parseFloat(entry.bmi) / 40) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaHistory className="text-5xl text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400">
                  No BMI History
                </h3>
                <p className="text-gray-500 mt-2">
                  Calculate your BMI to start tracking your progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </div>
  );
}
