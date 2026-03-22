import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL } from "../../../config/api";
import { toast } from "react-toastify";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { useTheme } from '../../context/ThemeContext';
import { Send, Sparkles } from 'lucide-react';

export default function UserFeedback() {
  const { darkMode } = useTheme();
  const user = useSelector(selectUser);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message) return toast.error("Please enter your feedback message.");
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/messages`, {
        name: user ? `${user.firstName} ${user.lastName || ''}` : "Anonymous",
        email: user?.email || "anonymous@example.com",
        item: topic || "General Feedback",
        description: message,
        type: "feedback"
      });
      toast.success("Feedback submitted successfully!");

      setTopic("");
      setMessage("");
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#05010d]' : 'bg-[#020617] text-white'}`}>
      <NavBar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
        </div>

        <div className="relative z-10 w-full max-w-xl bg-[#0c0520]/40 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
          <header className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/30 mb-3">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-xs font-semibold text-gray-200">Share your thoughts</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] bg-clip-text text-transparent">User Feedback</h1>
            <p className="text-gray-400 text-sm mt-1">Autofilled for: {user ? `${user.firstName} (${user.email})` : "Anonymous"}</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">Feedback Topic</label>
              <input 
                type="text"
                value={topic} 
                onChange={e => setTopic(e.target.value)} 
                placeholder="e.g., General, Posture, Diet suggestion..." 
                className="w-full p-3 rounded-xl border border-purple-500/20 bg-[#0c0520]/60 text-white focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-300">Your Message</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                rows="5" 
                placeholder="Tell us what you think or report issues..." 
                className="w-full p-3 rounded-xl border border-purple-500/20 bg-[#0c0520]/60 text-white focus:ring-2 focus:ring-[#22D3EE]/40 focus:border-[#22D3EE] transition-all outline-none resize-none" 
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#22D3EE]/20 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
