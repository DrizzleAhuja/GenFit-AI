import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { selectUser } from "../../redux/userSlice";
import { ToastContainer } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { FiCheck, FiBell } from "react-icons/fi";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../../config/api";

const Section1 = () => {
  const user = useSelector(selectUser);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/notifications`, {
          withCredentials: true,
          headers: { email: user.email }
        });
        setNotifications(res.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    const socket = io(API_BASE_URL, {
      query: { userId: user._id }
    });

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => socket.disconnect();
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/mark-read`, {}, { 
        withCredentials: true,
        headers: { email: user.email }
      });
      setNotifications(prev => prev.map(n => ({...n, isRead: true})));
    } catch (error) {
      console.error("Error marking all read", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notifications/${id}/mark-read`, {}, { 
        withCredentials: true,
        headers: { email: user.email }
      });
      setNotifications(prev => prev.map(n => n._id === id ? {...n, isRead: true} : n));
    } catch (error) {
      console.error("Error marking specific notification as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex flex-col min-h-screen bg-[#05010d] text-white pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <FiBell className="text-[#22D3EE]" /> Notifications
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/40 text-[#22D3EE] font-medium py-2 px-4 rounded-xl border border-purple-500/30 transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)]"
            >
              <FiCheck /> Mark all as read ({unreadCount})
            </button>
          )}
        </div>
        <ToastContainer theme="dark" />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-[#22D3EE]" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`flex flex-col gap-2 p-5 rounded-2xl border transition-all cursor-pointer shadow-lg backdrop-blur-xl ${
                  !notification.isRead
                    ? "bg-[#1E1B4B]/80 border-purple-500/50 shine-effect"
                    : "bg-[#0B0F19]/80 border-gray-800 opacity-70"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                    {notification.title}
                  </h3>
                  {!notification.isRead && (
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22D3EE]"></span>
                    </span>
                  )}
                </div>
                <p className={`text-base leading-relaxed ${!notification.isRead ? 'text-gray-200' : 'text-gray-400'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500 mt-2 font-medium tracking-wide">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 bg-[#0B0F19]/80 backdrop-blur-md rounded-2xl border border-gray-800 shadow-xl">
             <FiBell className="text-6xl text-gray-700 mb-4" />
            <div className="text-xl text-gray-400 font-medium">You're all caught up!</div>
            <p className="text-gray-500 mt-2 text-sm text-center max-w-sm">When you get updates about your diet plans or resting periods, they'll appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Section1;
