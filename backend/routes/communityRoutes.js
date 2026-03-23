const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  getPostComments,
  followUser,
} = require("../controllers/communityController");

// All routes are protected
router.use(authMiddleware);

// Post routes
router.get("/feed", getFeed);
router.post("/posts", createPost);
router.post("/posts/:id/like", toggleLike);
router.post("/posts/:id/comment", addComment);
router.get("/posts/:id/comments", getPostComments);

// Social routes
router.post("/follow/:id", followUser);

module.exports = router;
