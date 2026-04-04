import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL } from "../../../config/api";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import PostCard from "./Components/PostCard";
import { useTheme } from "../../context/ThemeContext";
import { Users, Send, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { validateLength, LIMITS } from "../../utils/formValidation";

export default function Community() {
  const { darkMode } = useTheme();
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
    const content = newPostContent.trim();
    if (!content) return;
    const err = validateLength(content, 1, LIMITS.COMMUNITY_POST_MAX, "Post");
    if (err) {
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts`,
        { content },
        { headers: { email: user.email } }
      );
      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPostContent("");
      }
    } catch (err) {
      console.error("Create post error:", err);
      toast.error(err.response?.data?.message || "Could not publish your post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardShell =
    "relative rounded-2xl sm:rounded-3xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300 overflow-hidden";

  return (
    <div
      className={`min-h-screen flex flex-col ${
        darkMode ? "bg-[#05010d] text-white" : "bg-[#020617] text-gray-100"
      }`}
    >
      <NavBar />

      <main className="flex-grow">
        <section className="relative overflow-hidden py-6 sm:py-8 lg:py-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-16 w-72 h-72 bg-[#8B5CF6] rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-28 right-0 w-80 h-80 bg-[#22D3EE] rounded-full blur-3xl opacity-25" />
          </div>

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <header className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#8B5CF6]/20 to-[#22D3EE]/20 border border-[#8B5CF6]/40 backdrop-blur-xl mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#FACC15]" />
                <span className="text-xs sm:text-sm font-semibold text-gray-100">
                  Connect &amp; motivate
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]">
                  Community
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
                Share wins, cheer each other on, and stay accountable with fellow GenFit members.
              </p>
            </header>

            {/* Create Post */}
            {user && (
              <div className={`${cardShell} mb-6 sm:mb-8`}>
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
                <form onSubmit={handlePostSubmit} className="p-5 sm:p-6 pt-7">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 rounded-full bg-[#0f172a] border border-[#8B5CF6]/35 flex items-center justify-center font-bold text-[#22D3EE] text-sm">
                      {user.avatar ? (
                        <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                      ) : (
                        <span>{user.firstName?.[0] || "U"}</span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      maxLength={LIMITS.COMMUNITY_POST_MAX}
                      className="flex-1 bg-[#0c0520]/80 border border-[#1F2937] rounded-xl p-3 sm:p-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#22D3EE]/70 focus:ring-1 focus:ring-[#22D3EE]/30 resize-none min-h-[88px]"
                      placeholder={`What's on your mind today, ${user.firstName || "there"}?`}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-black shadow-lg shadow-[#8B5CF6]/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                      disabled={!newPostContent.trim() || isSubmitting}
                    >
                      <Send className="w-4 h-4" />
                      Post
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Feed */}
            {loading ? (
              <div
                className={`${cardShell} p-10 sm:p-12 text-center text-gray-400 text-sm`}
              >
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
                <Users className="w-10 h-10 mx-auto mb-3 text-[#22D3EE]/60 animate-pulse" />
                Loading feed…
              </div>
            ) : error ? (
              <div
                className={`${cardShell} p-8 text-center border-red-500/30 bg-red-950/20`}
              >
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-red-500 to-orange-500" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post._id} post={post} currentUser={user} />
              ))
            ) : (
              <div className={`${cardShell} p-10 sm:p-12 text-center`}>
                <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
                <Users className="w-12 h-12 mx-auto mb-4 text-[#8B5CF6]/70" />
                <p className="text-gray-300 font-medium">No posts yet</p>
                <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
                  Be the first to share progress or a quick tip—the feed updates for everyone in real time.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
