import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import PostCard from "./Components/PostCard";
import { Activity, Edit3, Send } from "lucide-react";

export default function Community() {
  const user = useSelector(selectUser);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      if (!user?.email) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/community/feed`, {
          headers: { email: user.email },
        });
        if (response.data.success) {
          setPosts(response.data.posts);
        }
      } catch (err) {
        console.error("Feed error:", err);
        setError("Failed to load community feed.");
      } finally {
        setLoading(false);
      }
    }
    fetchFeed();
  }, [user]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts`,
        { content: newPostContent },
        { headers: { email: user.email } }
      );
      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPostContent("");
      }
    } catch (err) {
      console.error("Create post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C] text-white">
      <NavBar />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-8 h-8 text-[#84CC16]" />
            <div>
              <h1 className="text-2xl font-bold text-white">Community</h1>
              <p className="text-xs text-gray-400">Share your progress with friends</p>
            </div>
          </div>

          {/* Create Post */}
          {user && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 mb-6">
              <form onSubmit={handlePostSubmit}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#84CC16]/20 flex items-center justify-center font-bold text-[#84CC16]">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="me" /> : <span>{user.firstName?.[0] || 'U'}</span>}
                  </div>
                  <textarea
                    rows="3"
                    className="flex-1 bg-[#1F2937]/50 border border-[#374151] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#84CC16] resize-none"
                    placeholder={`What's on your mind today, ${user.firstName || 'there'}?`}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-[#84CC16] hover:bg-[#A3E635] text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
                    disabled={!newPostContent.trim() || isSubmitting}
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="text-center text-gray-400 py-10">Loading feed...</div>
          ) : error ? (
            <div className="text-center text-red-400 py-10">{error}</div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post._id} post={post} currentUser={user} />
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">No posts in community yet. Start the conversation!</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
