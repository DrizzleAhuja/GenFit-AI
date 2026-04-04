import React, { useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart, FaComment, FaShareAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../../../config/api";

export default function PostCard({ post, currentUser, onLikeToggle }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts/${post._id}/like`,
        {},
        { headers: { email: currentUser.email } }
      );
      if (response.data.success) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setShowComments(true);
    setLoadingComments(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/community/posts/${post._id}/comments`,
        { headers: { email: currentUser.email } }
      );
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("Fetch comments error:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts/${post._id}/comment`,
        { content: newComment },
        { headers: { email: currentUser.email } }
      );
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Add comment error:", error);
    }
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300 overflow-hidden mb-6">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
      <div className="p-5 sm:p-6 pt-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#0f172a] border border-[#8B5CF6]/35 flex items-center justify-center font-bold text-[#22D3EE] overflow-hidden text-sm">
              {post.userId?.avatar ? (
                <img src={post.userId.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{post.userId?.firstName?.[0] || "U"}</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white truncate">
                {post.userId?.firstName} {post.userId?.lastName}
              </h4>
              <p className="text-xs text-gray-500">{formattedDate}</p>
            </div>
          </div>
          {post.userId?.points !== undefined && (
            <div className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#8B5CF6]/15 to-[#22D3EE]/15 border border-[#22D3EE]/25 text-[#22D3EE] rounded-full font-semibold shrink-0 ml-2">
              🏆 {post.userId.points} pts
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
          {post.mediaUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-[#1F2937] ring-1 ring-[#8B5CF6]/10">
              <img src={post.mediaUrl} alt="Attached" className="w-full h-auto object-cover max-h-96" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t border-[#1F2937] pt-4 text-sm text-gray-400">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-2 hover:text-white transition-colors ${isLiked ? "text-[#F87171]" : "hover:text-[#F87171]"}`}
          >
            {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
            <span>{likesCount} Likes</span>
          </button>
          <button
            type="button"
            onClick={fetchComments}
            className="flex items-center gap-2 hover:text-[#22D3EE] transition-colors"
          >
            <FaComment className="text-lg" />
            <span>Comments</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 hover:text-[#A855F7] transition-colors sm:ml-auto"
          >
            <FaShareAlt className="text-lg" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-5 border-t border-[#1F2937] pt-4">
            {loadingComments ? (
              <div className="text-center text-xs text-gray-500 py-2">Loading comments…</div>
            ) : (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-2 items-start text-xs">
                    <div className="w-6 h-6 shrink-0 rounded-full bg-[#0f172a] border border-[#8B5CF6]/30 flex items-center justify-center font-bold text-[#22D3EE] text-[10px]">
                      {comment.userId?.avatar ? (
                        <img src={comment.userId.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{comment.userId?.firstName?.[0]}</span>
                      )}
                    </div>
                    <div className="bg-[#0c0520]/70 border border-[#1F2937] p-2.5 rounded-xl flex-1">
                      <span className="font-semibold text-[#22D3EE]/90 mr-1">{comment.userId?.firstName}:</span>
                      <span className="text-gray-300">{comment.content}</span>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center text-xs text-gray-500 py-2">No comments yet.</div>
                )}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#0c0520]/80 border border-[#1F2937] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#22D3EE]/70"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-black text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
