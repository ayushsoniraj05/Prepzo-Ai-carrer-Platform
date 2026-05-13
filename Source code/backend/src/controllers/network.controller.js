/**
 * Network Controller
 * Handles connections, posts, and professional networking
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import Connection from '../models/Connection.model.js';
import Post from '../models/Post.model.js';
import User from '../models/User.model.js';
import Notification from '../models/Notification.model.js';

// ============ CONNECTIONS ============

/**
 * @desc    Send connection request
 * @route   POST /api/network/connections/request
 * @access  Private
 */
export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { recipientId, message } = req.body;
  const requesterId = req.user._id;

  if (requesterId.toString() === recipientId) {
    res.status(400);
    throw new Error('Cannot send connection request to yourself');
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId).select('fullName');
  if (!recipient) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check existing connection
  const existingStatus = await Connection.getConnectionStatus(requesterId, recipientId);
  if (existingStatus !== 'none') {
    res.status(400);
    throw new Error(`Connection already ${existingStatus}`);
  }

  const connection = await Connection.create({
    requester: requesterId,
    recipient: recipientId,
    message,
    source: 'search',
  });

  // Notify recipient
  await Notification.createNotification({
    recipient: recipientId,
    sender: requesterId,
    type: 'connection_request',
    title: 'New Connection Request',
    message: `${req.user.fullName} wants to connect with you`,
    relatedEntities: { user: requesterId },
    actionUrl: `/network/requests`,
    actions: [
      { label: 'Accept', action: 'accept_connection' },
      { label: 'Decline', action: 'decline_connection' },
    ],
  });

  res.status(201).json({
    success: true,
    data: connection,
    message: 'Connection request sent',
  });
});

/**
 * @desc    Respond to connection request
 * @route   PUT /api/network/connections/:id/respond
 * @access  Private
 */
export const respondToRequest = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'accept' or 'reject'
  const userId = req.user._id;

  const connection = await Connection.findOne({
    _id: req.params.id,
    recipient: userId,
    status: 'pending',
  });

  if (!connection) {
    res.status(404);
    throw new Error('Connection request not found');
  }

  connection.status = action === 'accept' ? 'accepted' : 'rejected';
  connection.respondedAt = new Date();
  await connection.save();

  if (action === 'accept') {
    // Notify requester
    await Notification.createNotification({
      recipient: connection.requester,
      sender: userId,
      type: 'connection_accepted',
      title: 'Connection Accepted',
      message: `${req.user.fullName} accepted your connection request`,
      relatedEntities: { user: userId },
      actionUrl: `/profile/${userId}`,
    });
  }

  res.json({
    success: true,
    data: connection,
    message: action === 'accept' ? 'Connection accepted' : 'Connection declined',
  });
});

/**
 * @desc    Remove connection
 * @route   DELETE /api/network/connections/:userId
 * @access  Private
 */
export const removeConnection = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.userId;

  const connection = await Connection.findOneAndDelete({
    $or: [
      { requester: userId, recipient: targetId },
      { requester: targetId, recipient: userId },
    ],
    status: 'accepted',
  });

  if (!connection) {
    res.status(404);
    throw new Error('Connection not found');
  }

  res.json({
    success: true,
    message: 'Connection removed',
  });
});

/**
 * @desc    Get user's connections
 * @route   GET /api/network/connections
 * @access  Private
 */
export const getConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const result = await Connection.getUserConnections(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get pending connection requests
 * @route   GET /api/network/connections/requests
 * @access  Private
 */
export const getPendingRequests = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [received, sent] = await Promise.all([
    Connection.find({ recipient: userId, status: 'pending' })
      .populate('requester', 'fullName email targetRole knownTechnologies profileImage')
      .sort({ createdAt: -1 }),
    Connection.find({ requester: userId, status: 'pending' })
      .populate('recipient', 'fullName email targetRole knownTechnologies profileImage')
      .sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: { received, sent },
  });
});

/**
 * @desc    Get mutual connections
 * @route   GET /api/network/connections/mutual/:userId
 * @access  Private
 */
export const getMutualConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.userId;

  const mutualIds = await Connection.getMutualConnections(userId, targetId);
  
  const mutuals = await User.find({ _id: { $in: mutualIds } })
    .select('fullName targetRole profileImage');

  res.json({
    success: true,
    data: mutuals,
  });
});

/**
 * @desc    Get connection suggestions
 * @route   GET /api/network/suggestions
 * @access  Private
 */
export const getConnectionSuggestions = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 10 } = req.query;

  // Get current user's connections
  const connectionIds = await Connection.getUserConnections(userId, { limit: 1000 });
  const connectedIds = connectionIds.connections.map(c => c.user._id);
  connectedIds.push(userId);

  // Get user's skills and target role
  const user = await User.findById(userId).select('knownTechnologies targetRole');

  // Find users with similar skills/roles who aren't connected
  const suggestions = await User.find({
    _id: { $nin: connectedIds },
    role: 'student',
    $or: [
      { knownTechnologies: { $in: user.knownTechnologies || [] } },
      { targetRole: user.targetRole },
    ],
  })
    .select('fullName email targetRole knownTechnologies profileImage')
    .limit(parseInt(limit));

  // Calculate relevance for each suggestion
  const suggestionsWithRelevance = await Promise.all(
    suggestions.map(async (s) => {
      const mutualCount = await Connection.getMutualConnections(userId, s._id);
      const sharedSkills = (s.knownTechnologies || []).filter(
        skill => (user.knownTechnologies || []).includes(skill)
      );
      
      return {
        user: s,
        mutualConnections: mutualCount.length,
        sharedSkills,
        reason: s.targetRole === user.targetRole 
          ? `Same career goal: ${s.targetRole}`
          : sharedSkills.length > 0
          ? `${sharedSkills.length} shared skill(s)`
          : 'Suggested for you',
      };
    })
  );

  // Sort by relevance
  suggestionsWithRelevance.sort((a, b) => 
    (b.mutualConnections * 3 + b.sharedSkills.length) - 
    (a.mutualConnections * 3 + a.sharedSkills.length)
  );

  res.json({
    success: true,
    data: suggestionsWithRelevance,
  });
});

/**
 * @desc    Block user
 * @route   POST /api/network/block/:userId
 * @access  Private
 */
export const blockUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const targetId = req.params.userId;

  // Find existing connection or create blocked status
  let connection = await Connection.findOne({
    $or: [
      { requester: userId, recipient: targetId },
      { requester: targetId, recipient: userId },
    ],
  });

  if (connection) {
    connection.status = 'blocked';
    connection.blockedBy = userId;
    await connection.save();
  } else {
    connection = await Connection.create({
      requester: userId,
      recipient: targetId,
      status: 'blocked',
      blockedBy: userId,
    });
  }

  res.json({
    success: true,
    message: 'User blocked',
  });
});

// ============ POSTS ============

/**
 * @desc    Create post
 * @route   POST /api/network/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req, res) => {
  const { content, images, videos, documents, postType, visibility, poll } = req.body;

  const post = await Post.create({
    author: req.user._id,
    content,
    images,
    videos,
    documents,
    postType: postType || 'update',
    visibility: visibility || 'connections',
    poll,
  });

  await post.populate('author', 'fullName profileImage targetRole');

  // Notify mentioned users
  if (post.mentions && post.mentions.length > 0) {
    for (const mentionedId of post.mentions) {
      await Notification.createNotification({
        recipient: mentionedId,
        sender: req.user._id,
        type: 'post_mention',
        title: 'You were mentioned',
        message: `${req.user.fullName} mentioned you in a post`,
        relatedEntities: { post: post._id },
        actionUrl: `/posts/${post._id}`,
      });
    }
  }

  res.status(201).json({
    success: true,
    data: post,
  });
});

/**
 * @desc    Get feed
 * @route   GET /api/network/feed
 * @access  Private
 */
export const getFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const result = await Post.getFeed(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * @desc    Get single post
 * @route   GET /api/network/posts/:id
 * @access  Private
 */
export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'fullName profileImage targetRole')
    .populate({
      path: 'comments.author',
      select: 'fullName profileImage',
    });

  if (!post || !post.isActive) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check visibility
  if (post.visibility !== 'public') {
    const areConnected = await Connection.areConnected(req.user._id, post.author._id);
    if (!areConnected && post.author._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this post');
    }
  }

  res.json({
    success: true,
    data: post,
  });
});

/**
 * @desc    Update post
 * @route   PUT /api/network/posts/:id
 * @access  Private
 */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id,
    author: req.user._id,
    isActive: true,
  });

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const { content, visibility } = req.body;
  
  post.content = content || post.content;
  post.visibility = visibility || post.visibility;
  post.isEdited = true;
  
  await post.save();

  res.json({
    success: true,
    data: post,
  });
});

/**
 * @desc    Delete post
 * @route   DELETE /api/network/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    { isActive: false },
    { new: true }
  );

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  res.json({
    success: true,
    message: 'Post deleted',
  });
});

/**
 * @desc    Like/Unlike post
 * @route   POST /api/network/posts/:id/like
 * @access  Private
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive) {
    res.status(404);
    throw new Error('Post not found');
  }

  const isLiked = await post.toggleLike(userId);

  // Notify post author if liked (not if unliked, and not self-like)
  if (isLiked && post.author.toString() !== userId.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: userId,
      type: 'post_like',
      title: 'New Like',
      message: `${req.user.fullName} liked your post`,
      relatedEntities: { post: post._id },
      actionUrl: `/posts/${post._id}`,
    });
  }

  res.json({
    success: true,
    data: { isLiked, likeCount: post.likeCount },
  });
});

/**
 * @desc    Add comment to post
 * @route   POST /api/network/posts/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { content, parentComment } = req.body;

  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await post.addComment(userId, content, parentComment);

  // Notify post author
  if (post.author.toString() !== userId.toString()) {
    await Notification.createNotification({
      recipient: post.author,
      sender: userId,
      type: 'post_comment',
      title: 'New Comment',
      message: `${req.user.fullName} commented on your post`,
      relatedEntities: { post: post._id },
      actionUrl: `/posts/${post._id}`,
    });
  }

  res.json({
    success: true,
    data: comment,
  });
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/network/posts/:postId/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post || !post.isActive) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Can delete own comment or if post author
  if (
    comment.author.toString() !== req.user._id.toString() &&
    post.author.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  comment.isDeleted = true;
  await post.save();

  res.json({
    success: true,
    message: 'Comment deleted',
  });
});

/**
 * @desc    Vote on poll
 * @route   POST /api/network/posts/:id/vote
 * @access  Private
 */
export const voteOnPoll = asyncHandler(async (req, res) => {
  const { optionIndex } = req.body;
  const userId = req.user._id;

  const post = await Post.findById(req.params.id);

  if (!post || !post.isActive || post.postType !== 'poll') {
    res.status(404);
    throw new Error('Poll not found');
  }

  if (!post.poll || !post.poll.options[optionIndex]) {
    res.status(400);
    throw new Error('Invalid poll option');
  }

  // Check if poll ended
  if (post.poll.endsAt && new Date(post.poll.endsAt) < new Date()) {
    res.status(400);
    throw new Error('Poll has ended');
  }

  // Check if already voted
  const alreadyVoted = post.poll.options.some(opt => 
    opt.voters.includes(userId)
  );

  if (alreadyVoted) {
    res.status(400);
    throw new Error('You have already voted');
  }

  post.poll.options[optionIndex].votes += 1;
  post.poll.options[optionIndex].voters.push(userId);
  post.poll.totalVotes += 1;

  await post.save();

  res.json({
    success: true,
    data: post.poll,
  });
});

/**
 * @desc    Get user's posts
 * @route   GET /api/network/posts/user/:userId
 * @access  Private
 */
export const getUserPosts = asyncHandler(async (req, res) => {
  const targetId = req.params.userId;
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Check connection status for visibility
  const areConnected = await Connection.areConnected(userId, targetId);
  const isSelf = userId.toString() === targetId;

  const visibilityQuery = isSelf 
    ? {} 
    : areConnected 
    ? { visibility: { $in: ['public', 'connections'] } }
    : { visibility: 'public' };

  const [posts, total] = await Promise.all([
    Post.find({ author: targetId, isActive: true, ...visibilityQuery })
      .populate('author', 'fullName profileImage targetRole')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Post.countDocuments({ author: targetId, isActive: true, ...visibilityQuery }),
  ]);

  res.json({
    success: true,
    data: {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @desc    Get posts by hashtag
 * @route   GET /api/network/posts/hashtag/:tag
 * @access  Private
 */
export const getPostsByHashtag = asyncHandler(async (req, res) => {
  const tag = req.params.tag.toLowerCase().replace('#', '');
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [posts, total] = await Promise.all([
    Post.find({ 
      hashtags: tag, 
      isActive: true,
      visibility: 'public',
    })
      .populate('author', 'fullName profileImage targetRole')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Post.countDocuments({ hashtags: tag, isActive: true, visibility: 'public' }),
  ]);

  res.json({
    success: true,
    data: {
      hashtag: tag,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * @desc    Get trending hashtags
 * @route   GET /api/network/hashtags/trending
 * @access  Private
 */
export const getTrendingHashtags = asyncHandler(async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const trending = await Post.aggregate([
    { $match: { isActive: true, createdAt: { $gte: oneWeekAgo } } },
    { $unwind: '$hashtags' },
    { $group: { _id: '$hashtags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  res.json({
    success: true,
    data: trending.map(t => ({ hashtag: t._id, count: t.count })),
  });
});
