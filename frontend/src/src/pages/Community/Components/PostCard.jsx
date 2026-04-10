import React, { useState } from "react";
import axios from "axios";
import { FaHeart, FaRegHeart, FaComment, FaShareAlt } from "react-icons/fa";
import { API_BASE_URL } from "../../../../config/api";
import { toast } from "react-toastify";
import { validateLength, LIMITS } from "../../../utils/formValidation";
import { formatRelativeTime } from "../../../utils/timeUtils";

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
        if (onLikeToggle) {
          onLikeToggle(post._id, response.data.isLiked, response.data.likesCount);
        }
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
    const content = newComment.trim();
    if (!content) return;
    const err = validateLength(content, 1, LIMITS.COMMUNITY_COMMENT_MAX, "Comment");
    if (err) {
      toast.error(err);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/community/posts/${post._id}/comment`,
        { content },
        { headers: { email: currentUser.email } }
      );
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Add comment error:", error);
      toast.error(error.response?.data?.message || "Could not add your comment.");
    }
  };

  const formattedDate = formatRelativeTime(post.createdAt);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#1F2937] bg-[#020617]/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.8)] hover:border-[#22D3EE]/60 transition-all duration-300 overflow-hidden mb-6">
      <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
      <div className="p-5 sm:p-6 pt-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className={`relative w-12 h-12 shrink-0 rounded-full p-[2px] ${
              (post.userId?.points || 0) > 1000 ? 'bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'bg-[#1F2937]'
            }`}>
              <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center font-bold text-[#22D3EE] overflow-hidden text-sm">
                {post.userId?.avatar ? (
                  <img src={post.userId.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg">{post.userId?.firstName?.[0] || "U"}</span>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-white truncate text-base leading-tight group-hover:text-[#22D3EE] transition-colors">
                {post.userId?.firstName} {post.userId?.lastName}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span>{formattedDate}</span>
                {post.type === "milestone" && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-[#FACC15]">Milestone ✨</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {post.userId?.points !== undefined && (
            <div className="flex flex-col items-end gap-1">
              <div className="text-[10px] px-2.5 py-1 bg-gradient-to-r from-[#8B5CF6]/15 to-[#22D3EE]/15 border border-[#22D3EE]/25 text-[#22D3EE] rounded-full font-black uppercase tracking-wider shrink-0 shadow-lg shadow-black/20">
                {post.userId.points} pts
              </div>
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
        <div className="flex flex-wrap items-center gap-6 border-t border-[#1F2937] pt-5 text-sm">
          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-2.5 transition-all duration-300 group ${
              isLiked ? "text-[#F87171]" : "text-gray-400 hover:text-[#F87171]"
            }`}
          >
            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-[#F87171]/10' : 'group-hover:bg-[#F87171]/10'}`}>
              {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
            </div>
            <span className="font-bold">{likesCount}</span>
          </button>
          
          <button
            type="button"
            onClick={fetchComments}
            className="flex items-center gap-2.5 text-gray-400 hover:text-[#22D3EE] transition-all duration-300 group"
          >
            <div className="p-2 rounded-full group-hover:bg-[#22D3EE]/10 transition-colors">
              <FaComment className="text-lg" />
            </div>
            <span className="font-bold">Comments</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2.5 text-gray-400 hover:text-[#8B5CF6] transition-all duration-300 group ml-auto"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/community?post=${post._id}`);
              toast.success("Link copied to clipboard!");
            }}
          >
            <div className="p-2 rounded-full group-hover:bg-[#8B5CF6]/10 transition-colors">
              <FaShareAlt className="text-lg" />
            </div>
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
                maxLength={LIMITS.COMMUNITY_COMMENT_MAX}
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
