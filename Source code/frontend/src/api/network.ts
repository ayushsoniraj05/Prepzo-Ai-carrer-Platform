/**
 * Network API Service
 * Handles connections, posts, and professional networking
 */

import api from './axios';

// Types
export interface UserSummary {
  _id: string;
  fullName: string;
  email?: string;
  profileImage?: string;
  targetRole?: string;
  knownTechnologies?: string[];
}

export interface Connection {
  _id: string;
  user: UserSummary;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface ConnectionSuggestion {
  user: UserSummary;
  mutualConnections: number;
  sharedSkills: string[];
  reason: string;
}

export interface Post {
  _id: string;
  author: UserSummary;
  content: string;
  images?: string[];
  videos?: string[];
  documents?: Array<{ name: string; url: string; size: number }>;
  postType:
    | 'update'
    | 'achievement'
    | 'project'
    | 'article'
    | 'job_opportunity'
    | 'question'
    | 'poll'
    | 'learning'
    | 'certification'
    | 'event';
  hashtags: string[];
  mentions: string[];
  visibility: 'public' | 'connections' | 'private';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked?: boolean;
  comments?: Comment[];
  poll?: Poll;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: UserSummary;
  content: string;
  likes: string[];
  likeCount: number;
  parentComment?: string;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Poll {
  question: string;
  options: Array<{
    text: string;
    votes: number;
    voters: string[];
  }>;
  endsAt?: string;
  totalVotes: number;
}

// API Functions
export const networkApi = {
  // ============ CONNECTIONS ============
  
  // Send connection request
  sendConnectionRequest: async (recipientId: string, message?: string) => {
    const response = await api.post('/network/connections/request', {
      recipientId,
      message,
    });
    return response.data;
  },

  // Respond to connection request (accept/reject)
  respondToRequest: async (connectionId: string, action: 'accept' | 'reject') => {
    const response = await api.put(`/network/connections/${connectionId}/respond`, {
      action,
    });
    return response.data;
  },

  // Remove connection
  removeConnection: async (userId: string) => {
    const response = await api.delete(`/network/connections/${userId}`);
    return response.data;
  },

  // Get user's connections
  getConnections: async (page = 1, limit = 20) => {
    const response = await api.get('/network/connections', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get pending connection requests
  getPendingRequests: async (): Promise<{
    success: boolean;
    data: { received: Connection[]; sent: Connection[] };
  }> => {
    const response = await api.get('/network/connections/requests');
    return response.data;
  },

  // Get mutual connections
  getMutualConnections: async (userId: string) => {
    const response = await api.get(`/network/connections/mutual/${userId}`);
    return response.data;
  },

  // Get connection suggestions
  getSuggestions: async (limit = 10): Promise<{
    success: boolean;
    data: ConnectionSuggestion[];
  }> => {
    const response = await api.get('/network/suggestions', {
      params: { limit },
    });
    return response.data;
  },

  // Block user
  blockUser: async (userId: string) => {
    const response = await api.post(`/network/block/${userId}`);
    return response.data;
  },

  // ============ POSTS ============

  // Create post
  createPost: async (data: {
    content: string;
    images?: string[];
    videos?: string[];
    documents?: Array<{ name: string; url: string; size: number }>;
    postType?: Post['postType'];
    visibility?: Post['visibility'];
    poll?: {
      question: string;
      options: string[];
      endsAt?: string;
    };
  }) => {
    const response = await api.post('/network/posts', data);
    return response.data;
  },

  // Get feed
  getFeed: async (page = 1, limit = 20) => {
    const response = await api.get('/network/feed', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get single post
  getPost: async (id: string) => {
    const response = await api.get(`/network/posts/${id}`);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, data: { content?: string; visibility?: Post['visibility'] }) => {
    const response = await api.put(`/network/posts/${id}`, data);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string) => {
    const response = await api.delete(`/network/posts/${id}`);
    return response.data;
  },

  // Toggle like on post
  toggleLike: async (postId: string): Promise<{
    success: boolean;
    data: { isLiked: boolean; likeCount: number };
  }> => {
    const response = await api.post(`/network/posts/${postId}/like`);
    return response.data;
  },

  // Add comment
  addComment: async (postId: string, content: string, parentComment?: string) => {
    const response = await api.post(`/network/posts/${postId}/comments`, {
      content,
      parentComment,
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (postId: string, commentId: string) => {
    const response = await api.delete(`/network/posts/${postId}/comments/${commentId}`);
    return response.data;
  },

  // Vote on poll
  voteOnPoll: async (postId: string, optionIndex: number) => {
    const response = await api.post(`/network/posts/${postId}/vote`, { optionIndex });
    return response.data;
  },

  // Get user's posts
  getUserPosts: async (userId: string, page = 1, limit = 20) => {
    const response = await api.get(`/network/posts/user/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get posts by hashtag
  getPostsByHashtag: async (tag: string, page = 1, limit = 20) => {
    const response = await api.get(`/network/posts/hashtag/${tag}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get trending hashtags
  getTrendingHashtags: async (): Promise<{
    success: boolean;
    data: Array<{ hashtag: string; count: number }>;
  }> => {
    const response = await api.get('/network/hashtags/trending');
    return response.data;
  },
};

export default networkApi;
