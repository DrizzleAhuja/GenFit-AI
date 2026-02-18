import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, setUser } from "../../redux/userSlice";
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { FiMenu, FiX, FiUser, FiEdit2, FiLogOut } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { API_BASE_URL, API_ENDPOINTS } from "../../../config/api";
import { isPWAInstalled } from "../../utils/pwaInstall";
import { getOAuthErrorMessage, isPWAMode } from "../../utils/googleOAuthPWA";
import GenFitLogo from "../../Components/GenFitLogo";

export default function NavBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [role, setRole] = useState("user");
  const [isStandalone, setIsStandalone] = useState(false);

  const { darkMode } = useTheme();

  // Check if running as PWA
  useEffect(() => {
    setIsStandalone(isPWAInstalled());
  }, []);

  const getUserInitials = (user) => {
    if (user && user.firstName) {
      return user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : `${user.firstName[0]}`;
    }
    return "";
  };

  const handleLogout = async () => {
    try {
      dispatch(setUser(null));
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      setDropdownOpen(false);
      toast.success("Logged out successfully", {
        autoClose: 2000,
        onClose: () => navigate("/"),
      });
    } catch (error) {
      console.error("Error during logout", error);
      toast.error("Logout failed", { autoClose: 2000 });
    }
  };

  const handleLoginSuccess = async (response) => {
    try {
      const { credential } = response;

      if (!credential) {
        toast.error("No credential received from Google", { autoClose: 2000 });
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH}/login`,
        {
          token: credential,
          role,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      dispatch(setUser(res.data.user));
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("isLoggedIn", "true");
      setRole(res.data.user.role);

      toast.success("Logged in successfully", {
        autoClose: 1000,
        onClose: () => navigate("/CurrentBMI"),
      });
    } catch (error) {
      console.error("Error during login", error);

      let errorMessage = "Login failed";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage, { autoClose: 2000 });
    }
  };

  const handleLoginError = (error) => {
    console.error("Google login error:", error);
    
    const errorInfo = getOAuthErrorMessage(error);
    
    toast.error(`${errorInfo.title}: ${errorInfo.message}`, { 
      autoClose: 5000 
    });
    
    setTimeout(() => {
      toast.info(errorInfo.action, { 
        autoClose: 6000 
      });
    }, 2500);
    
    if (isPWAMode() && error?.error !== "popup_closed_by_user") {
      setTimeout(() => {
        toast.info(
          "💡 Tip: For better sign-in experience, open this site in Chrome browser", 
          { autoClose: 7000 }
        );
      }, 4000);
    }
  };

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      dispatch(setUser(savedUser));
      setRole(savedUser.role);
    }
  }, [dispatch]);

  const navLinks = [
    { path: "/", label: "HOME" },
    ...(!user
      ? [
          { path: "/about", label: "ABOUT US" },
          { path: "/features", label: "FEATURES" },
          { path: "/Contactus", label: "CONTACT US" },
          { path: "/leaderboard", label: "LEADERBOARD" },
        ]
      : [
          { path: "/VirtualTA", label: "VIRTUAL TRAINING ASSISTANT" },
          { path: "/CurrentBMI", label: "CURRENT BMI" },
          { path: "/calorie-tracker", label: "CALORIE TRACKER" },
          { path: "/Workout", label: "WORKOUT" },
          { path: "/diet-chart", label: "DIET CHART" },
          { path: "/leaderboard", label: "LEADERBOARD" },
        ]),
  ];

  return (
    <>
      <GoogleOAuthProvider 
        clientId="702465560392-1mu8j4kqafadep516m62oa5vf5klt7pu.apps.googleusercontent.com"
        onScriptLoadError={() => {
          console.error("Google OAuth script failed to load");
          toast.error("Google sign-in unavailable. Please check your connection.", { 
            autoClose: 3000 
          });
        }}
        onScriptLoadSuccess={() => {
          console.log("Google OAuth script loaded successfully");
        }}
      >
        {/* Desktop Navbar */}
        <nav className="hidden lg:block sticky top-0 left-0 w-full z-50 bg-[#05010d]/95 backdrop-blur-xl border-b border-purple-500/30 shadow-[0_0_25px_rgba(139,92,246,0.35)] text-white">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            {/* Logo */}
            <GenFitLogo size="default" />

            {/* Desktop Navigation Links */}
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors border-b-2 border-transparent ${
                      isActive
                        ? "text-[#22D3EE] border-[#22D3EE] bg-[#22D3EE]/10"
                        : "text-gray-300 hover:text-white hover:bg-white/5 hover:border-[#22D3EE]/60"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <div
                    className="flex items-center space-x-2 cursor-pointer group"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-medium bg-[#8B5CF6] text-white">
                      {getUserInitials(user)}
                    </div>
                    <span className="text-gray-200">
                      <b>
                        {user.firstName} {user.lastName ? user.lastName : ""}
                      </b>
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 bg-[#020617]/95 backdrop-blur-xl border border-[#1F2937]">
                      <NavLink
                        to="/EditProfile"
                        className="flex px-4 py-2 text-sm items-center text-gray-200 hover:bg-gray-700"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiEdit2 className="mr-2" /> Edit Profile
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm flex items-center text-gray-200 hover:bg-gray-700"
                      >
                        <FiLogOut className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <GoogleLogin
                  onSuccess={handleLoginSuccess}
                  onError={handleLoginError}
                  theme="filled_blue"
                  shape="pill"
                  size="medium"
                  text="signin_with"
                  useOneTap={false}
                  auto_select={false}
                />
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#05010d]/95 backdrop-blur-xl border-b border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.35)] text-white">
          <div className="flex justify-between items-center px-4 py-3">
            <button
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
            
            <GenFitLogo size="small" />

            {user && (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-medium bg-[#8B5CF6] text-white text-sm cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {getUserInitials(user)}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-[#040011] shadow-2xl border-r border-purple-500/30 transform transition-transform duration-300 ease-in-out z-50 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center p-4 border-b border-purple-500/40">
              <div onClick={() => setMobileMenuOpen(false)}>
                <GenFitLogo size="small" />
              </div>
              <button
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiX size={24} />
              </button>
            </div>

            {/* User Info Section */}
            {user && (
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-medium bg-[#8B5CF6] text-white">
                    {getUserInitials(user)}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {user.firstName} {user.lastName ? user.lastName : ""}
                    </p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `block px-6 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-gray-700 text-white border-l-4 border-[#22D3EE]"
                        : "text-gray-300 hover:bg-[#020617]/60 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Footer Section */}
            <div className="border-t border-gray-700 p-4">
              {user ? (
                <div className="space-y-2">
                  <NavLink
                    to="/EditProfile"
                    className="flex items-center px-4 py-2 text-gray-200 hover:bg-[#020617]/60 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiEdit2 className="mr-3" /> Edit Profile
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-200 hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <FiLogOut className="mr-3" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                    theme="filled_blue"
                    shape="pill"
                    size="medium"
                    text="signin_with"
                    useOneTap={false}
                    auto_select={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* User Dropdown for Mobile Top Bar */}
        {user && dropdownOpen && (
          <div className="lg:hidden fixed top-16 right-4 w-48 rounded-md shadow-lg py-1 z-50 bg-[#020617]/95 backdrop-blur-xl border border-[#1F2937]">
            <NavLink
              to="/EditProfile"
              className="flex px-4 py-2 text-sm items-center text-gray-200 hover:bg-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              <FiEdit2 className="mr-2" /> Edit Profile
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm flex items-center text-gray-200 hover:bg-gray-700"
            >
              <FiLogOut className="mr-2" /> Logout
            </button>
          </div>
        )}
      </GoogleOAuthProvider>
    </>
  );
}