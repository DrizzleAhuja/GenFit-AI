import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectUser, setUser } from "../../redux/userSlice";
import { FiUser, FiMail, FiSave, FiArrowLeft } from "react-icons/fi";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";

export default function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    diseasesAndAllergies: "", // Combined field for diseases and allergies
  });

  useEffect(() => {
    if (user) {
      // Combine diseases and allergies into one field
      const diseases = user.diseases ? user.diseases.join(', ') : '';
      const allergies = user.allergies ? user.allergies.join(', ') : '';
      const combined = [diseases, allergies].filter(item => item !== '').join(', ');
      
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        diseasesAndAllergies: combined,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Split combined field back into diseases and allergies arrays
      const items = formData.diseasesAndAllergies.split(',').map(item => item.trim()).filter(item => item !== '');
      
      const res = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.USERS}/${user._id}`,
        { 
          firstName: formData.firstName,
          lastName: formData.lastName,
          diseases: items, // Store all items in diseases
          allergies: items, // Store all items in allergies (same for now)
        }
      );

      // Update Redux store
      dispatch(setUser(res.data));

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(res.data));

      console.log("Profile updated successfully:", res.data);
      toast.success("Profile updated successfully", {
        autoClose: 1000,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Profile update failed", {
        autoClose: 2000,
      });
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-[#020617] text-gray-100">
        <div className="animate-pulse text-lg text-gray-300">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617]">
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl overflow-hidden shadow-[0_18px_45px_rgba(15,23,42,0.8)]">
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />

          {/* Header */}
          <div className="px-6 py-4 border-b border-[#1F2937]">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full mr-4 text-gray-300 hover:bg-[#020617]/80 hover:text-[#22D3EE] transition-colors"
              >
                <FiArrowLeft size={20} />
              </button>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                Edit Profile
              </h2>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  First Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser size={18} className="text-[#22D3EE]" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 rounded-md bg-[#020617]/60 border border-[#1F2937] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                    placeholder="John"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  Last Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiUser size={18} className="text-[#22D3EE]" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 rounded-md bg-[#020617]/60 border border-[#1F2937] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="diseasesAndAllergies"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  Diseases & Allergies (comma-separated)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <textarea
                    id="diseasesAndAllergies"
                    name="diseasesAndAllergies"
                    value={formData.diseasesAndAllergies}
                    onChange={handleChange}
                    rows="4"
                    className="block w-full pl-3 pr-3 py-3 rounded-md bg-[#020617]/60 border border-[#1F2937] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent"
                    placeholder="Diabetes, Hypertension, Pollen, Peanuts, etc."
                  ></textarea>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Enter any diseases, allergies, or health conditions separated by commas
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2 text-gray-300"
                >
                  Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiMail size={18} className="text-[#8B5CF6]" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user?.email || ""}
                    className="block w-full pl-10 pr-3 py-3 rounded-md bg-[#020617]/40 border border-[#1F2937] text-gray-400 placeholder-gray-500 focus:outline-none cursor-not-allowed"
                    disabled
                    readOnly
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed for security reasons
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 rounded-md text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] focus:ring-[#8B5CF6] shadow-lg hover:shadow-[#8B5CF6]/30 transition-all"
                >
                  <FiSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
