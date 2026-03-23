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
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 shadow-sm hover:border-[#84CC16]/30 transition-all mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-[#84CC16]/30 flex items-center justify-center font-bold text-[#84CC16] overflow-hidden">
            {post.userId?.avatar ? (
              <img src={post.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{post.userId?.firstName?.[0] || "U"}</span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-white">
              {post.userId?.firstName} {post.userId?.lastName}
            </h4>
            <p className="text-xs text-gray-500">{formattedDate}</p>
          </div>
        </div>
        {post.userId?.points !== undefined && (
          <div className="text-xs px-2 py-1 bg-[#84CC16]/10 text-[#84CC16] rounded-full font-medium">
            🏆 {post.userId.points} pts
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 text-sm whitespace-pre-wrap">{post.content}</p>
        {post.mediaUrl && (
          <div className="mt-3 rounded-lg overflow-hidden border border-[#1F2937]">
            <img src={post.mediaUrl} alt="Attached" className="w-full h-auto object-cover max-h-96" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 border-t border-[#1F2937] pt-3 text-sm text-gray-400">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 hover:text-white transition-colors ${isLiked ? 'text-[#EF4444]' : ''}`}
        >
          {isLiked ? <FaHeart className="text-lg" /> : <FaRegHeart className="text-lg" />}
          <span>{likesCount} Likes</span>
        </button>
        <button 
          onClick={fetchComments} 
          className="flex items-center gap-2 hover:text-[#3B82F6] transition-colors"
        >
          <FaComment className="text-lg" />
          <span>Comments</span>
        </button>
        <button className="flex items-center gap-2 hover:text-[#84CC16] transition-colors ml-auto">
          <FaShareAlt className="text-lg" />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-[#1F2937] pt-4">
          {loadingComments ? (
            <div className="text-center text-xs text-gray-500 py-2">Loading comments...</div>
          ) : (
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-2 items-start text-xs">
                  <div className="w-6 h-6 rounded-full bg-[#1F2937] flex items-center justify-center font-bold text-[#84CC16] text-[10px]">
                    {comment.userId?.avatar ? (
                      <img src={comment.userId.avatar} alt="Avatar" className="w-full h-full rounded-full" />
                    ) : (
                      <span>{comment.userId?.firstName?.[0]}</span>
                    )}
                  </div>
                  <div className="bg-[#1F2937]/50 p-2 rounded-lg flex-1">
                    <span className="font-semibold text-white mr-1">{comment.userId?.firstName}:</span>
                    <span className="text-gray-300">{comment.content}</span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-center text-xs text-gray-500 py-2">No comments yet.</div>}
            </div>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#1F2937] border border-[#374151] text-xs text-white focus:outline-none focus:border-[#84CC16]"
            />
            <button 
              type="submit" 
              className="px-3 py-1.5 rounded-lg bg-[#84CC16] text-black text-xs font-semibold hover:bg-[#A3E635] transition-colors"
              disabled={!newComment.trim()}
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
