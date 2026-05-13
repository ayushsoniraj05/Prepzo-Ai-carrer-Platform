/**
 * Network Routes
 * Handles connections, posts, and professional networking
 */

import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  // Connections
  sendConnectionRequest,
  respondToRequest,
  removeConnection,
  getConnections,
  getPendingRequests,
  getMutualConnections,
  getConnectionSuggestions,
  blockUser,
  // Posts
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  voteOnPoll,
  getUserPosts,
  getPostsByHashtag,
  getTrendingHashtags,
} from '../controllers/network.controller.js';

const router = express.Router();

// All network routes require authentication
router.use(protect);

// ============ CONNECTIONS ============
router.post('/connections/request', sendConnectionRequest);
router.put('/connections/:id/respond', respondToRequest);
router.delete('/connections/:userId', removeConnection);
router.get('/connections', getConnections);
router.get('/connections/requests', getPendingRequests);
router.get('/connections/mutual/:userId', getMutualConnections);

// Suggestions
router.get('/suggestions', getConnectionSuggestions);

// Block
router.post('/block/:userId', blockUser);

// ============ POSTS ============
router.post('/posts', createPost);
router.get('/feed', getFeed);
router.get('/posts/user/:userId', getUserPosts);
router.get('/posts/hashtag/:tag', getPostsByHashtag);
router.get('/posts/:id', getPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// Post interactions
router.post('/posts/:id/like', toggleLike);
router.post('/posts/:id/comments', addComment);
router.delete('/posts/:postId/comments/:commentId', deleteComment);
router.post('/posts/:id/vote', voteOnPoll);

// Hashtags
router.get('/hashtags/trending', getTrendingHashtags);

export default router;
