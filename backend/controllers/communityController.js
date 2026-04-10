const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");
const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");

// @desc    Create a new post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, mediaUrl, type } = req.body;
    const userId = req.user._id;

    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: "Post must have content or an image" });
    }

    let finalMediaUrl = "";
    if (mediaUrl) {
      const uploadResponse = await cloudinary.uploader.upload(mediaUrl, {
        folder: "community-posts",
      });
      finalMediaUrl = uploadResponse.secure_url;
    }

    const post = await Post.create({
      userId,
      content: content || "",
      mediaUrl: finalMediaUrl,
      type: type || "user_post",
    });

    const populatedPost = await Post.findById(post._id).populate("userId", "firstName lastName avatar points");

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get community feed
// @route   GET /api/community/feed
// @access  Private
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user._id;

    // Optional: Fetch only following posts, or global
    // For now, let's fetch ALL posts for a Global feel, but sort by date
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "firstName lastName avatar points")
      .lean();

    // Map likes to check if current user liked it
    const feed = posts.map(post => ({
      ...post,
      isLiked: post.likes.some(id => id.toString() === userId.toString()),
    }));

    res.status(200).json({ success: true, count: feed.length, posts: feed });
  } catch (error) {
    console.error("Get Feed Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Toggle Like on a post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Like
      post.likes.push(userId);
    } else {
      // Unlike
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    res.status(200).json({ 
      success: true, 
      likesCount: post.likes.length, 
      isLiked: likeIndex === -1 
    });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Add comment to post
// @route   POST /api/community/posts/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const comment = await Comment.create({
      postId,
      userId,
      content,
    });

    const populatedComment = await Comment.findById(comment._id).populate("userId", "firstName lastName avatar");

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get comments for post
// @route   GET /api/community/posts/:id/comments
// @access  Private
exports.getPostComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 }) // oldest first
      .populate("userId", "firstName lastName avatar")
      .lean();

    res.status(200).json({ success: true, count: comments.length, comments });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Follow/Unfollow User
// @route   POST /api/community/follow/:id
// @access  Private
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const followingId = req.params.id;

    if (followerId.toString() === followingId.toString()) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself" });
    }

    // Check if following target exists
    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const existingFollow = await Follow.findOne({ followerId, followingId });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      return res.status(200).json({ success: true, message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await Follow.create({ followerId, followingId });
      return res.status(200).json({ success: true, message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    console.error("Follow User Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
