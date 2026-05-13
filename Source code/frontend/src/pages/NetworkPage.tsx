/**
 * Network Page
 * LinkedIn-style connections and professional feed
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  Image,
  Video,
  FileText,
  Hash,
  TrendingUp,
  X,
  Check,
  Clock,
  Sparkles,
  Globe,
  ChevronDown,
  Bot,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { networkApi, Post, Connection, ConnectionSuggestion, UserSummary } from '@/api/network';
import ThinkingLoader from '@/components/ui/loading';
import toast from 'react-hot-toast';

export function NetworkPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { setGlobalLoading } = useAppStore();

  // State
  const [activeTab, setActiveTab] = useState<'feed' | 'connections' | 'requests'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<{ received: Connection[]; sent: Connection[] }>({
    received: [],
    sent: [],
  });
  const [suggestions, setSuggestions] = useState<ConnectionSuggestion[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<{ hashtag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New post state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState<'public' | 'connections'>('connections');
  const [posting, setPosting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
    }
  }, [isAuthenticated, navigate]);

  // Load feed
  const loadFeed = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    try {
      const response = await networkApi.getFeed(pageNum, 20);
      if (response.success) {
        if (pageNum === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.posts]);
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load feed:', error);
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [setGlobalLoading]);

  // Load connections
  const loadConnections = useCallback(async () => {
    try {
      const response = await networkApi.getConnections(1, 50);
      if (response.success) {
        setConnections(response.data.connections);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    }
  }, []);

  // Load requests
  const loadRequests = useCallback(async () => {
    try {
      const response = await networkApi.getPendingRequests();
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to load requests:', error);
    }
  }, []);

  // Load suggestions and trending
  const loadExtra = useCallback(async () => {
    try {
      const [suggestionsRes, trendingRes] = await Promise.all([
        networkApi.getSuggestions(5),
        networkApi.getTrendingHashtags(),
      ]);
      
      if (suggestionsRes.success) setSuggestions(suggestionsRes.data);
      if (trendingRes.success) setTrendingHashtags(trendingRes.data);
    } catch (error) {
      console.error('Failed to load extra data:', error);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'feed') loadFeed();
      else if (activeTab === 'connections') loadConnections();
      else if (activeTab === 'requests') loadRequests();
      
      loadExtra();
    }
  }, [activeTab, isAuthenticated, loadFeed, loadConnections, loadRequests, loadExtra]);

  // Handle create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setPosting(true);
    try {
      const response = await networkApi.createPost({
        content: newPostContent,
        visibility: postVisibility,
        postType: 'update',
      });
      
      if (response.success) {
        setPosts((prev) => [response.data, ...prev]);
        setNewPostContent('');
        setShowCreatePost(false);
        toast.success('Post created!');
      }
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setPosting(false);
    }
  };

  // Handle like post
  const handleLikePost = async (postId: string) => {
    try {
      const response = await networkApi.toggleLike(postId);
      if (response.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, isLiked: response.data.isLiked, likeCount: response.data.likeCount }
              : p
          )
        );
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  // Handle connection request response
  const handleRequestResponse = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      const response = await networkApi.respondToRequest(connectionId, action);
      if (response.success) {
        setRequests((prev) => ({
          ...prev,
          received: prev.received.filter((r) => r._id !== connectionId),
        }));
        toast.success(action === 'accept' ? 'Connection accepted!' : 'Request declined');
        if (action === 'accept') {
          loadConnections();
        }
      }
    } catch (error) {
      toast.error('Failed to respond to request');
    }
  };

  // Handle send connection request
  const handleSendRequest = async (userId: string) => {
    try {
      const response = await networkApi.sendConnectionRequest(userId);
      if (response.success) {
        setSuggestions((prev) => prev.filter((s) => s.user._id !== userId));
        toast.success('Connection request sent!');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send request';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] selection:bg-[#00ff9d] selection:text-[#0a0c10] overflow-x-hidden relative">
      {/* Background Effect */}
      <div className="absolute inset-0 w-full h-full bg-[#0a0c10] z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <GridBeam className="absolute inset-0" />

      {/* Header / Hero Section */}
      <div className="relative z-10 border-b border-white/5 bg-[#0a0c10]/30 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-left">
          <div className="flex items-center gap-4 text-[13px] font-rubik font-[900] uppercase tracking-[0.5em] text-white/40 mb-8">
            <Users size={20} strokeWidth={2.5} />
            Transmission Hub
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-rubik font-[900] leading-[0.95] tracking-tighter text-white uppercase mb-6">
                Connect the <br/>
                <span className="text-white/40">Neural Nodes.</span>
              </h1>
              <p className="text-[18px] md:text-[21px] leading-relaxed text-white/50 font-rubik font-medium tracking-tight max-w-xl">
                Real-time synchronization with 142+ certified professional nodes. Bridge the distance through data-rich interaction.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2 p-1 bg-[#0a0c10] rounded-[24px] border border-white/5">
                {(['feed', 'connections', 'requests'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-8 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
                      activeTab === tab
                        ? 'bg-[#00ff9d] text-[#0a0c10]'
                        : 'text-white/40 hover:bg-white/5'
                    }`}
                  >
                    {tab === 'feed' && 'Signal Feed'}
                    {tab === 'connections' && 'Nodes'}
                    {tab === 'requests' && 'Buffer'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
          {/* Sidebar - Hidden on mobile, shown in tabs/bottom */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* User Profile Overview */}
            <div className="bg-[#0a0c10]/80 border border-white/5 rounded-[40px] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-40">
                 <Bot size={24} className="text-[#00ff9d]" />
              </div>
              <div className="w-24 h-24 bg-[#0a0c10] border-4 border-white/5 rounded-[32px] mx-auto mb-6 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                <span className="text-4xl font-rubik font-[900] text-white">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
                {user?.profileImage && (
                  <img src={user.profileImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <h3 className="text-xl font-rubik font-[900] text-white uppercase tracking-tighter text-center mb-1">{user?.fullName}</h3>
              <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00ff9d] text-center mb-8">{user?.targetRole || 'CORE ENTITY'}</p>
              
              <div className="grid grid-cols-2 gap-4 py-8 border-y border-white/5">
                <div className="text-center">
                   <p className="text-2xl font-rubik font-[900] text-white">{connections.length}</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Nodes</p>
                </div>
                <div className="text-center">
                   <p className="text-2xl font-rubik font-[900] text-white">42</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Visits</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate(`/profile/${user?._id}`)}
                className="w-full mt-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-white hover:bg-white/10 transition-all"
              >
                Access ID Core
              </button>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">People You May Know</h3>
                </div>
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.user._id}
                      className="flex items-center gap-3 p-2 bg-white/5 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                        {suggestion.user.profileImage ? (
                          <img
                            src={suggestion.user.profileImage}
                            alt={suggestion.user.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white">
                            {suggestion.user.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">
                          {suggestion.user.fullName}
                        </p>
                        <p className="text-purple-400 text-xs truncate">
                          {suggestion.reason}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(suggestion.user._id)}
                        className="p-1 hover:bg-white/10 rounded text-purple-400"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Trending Hashtags */}
            {trendingHashtags.length > 0 && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Trending</h3>
                </div>
                <div className="space-y-2">
                  {trendingHashtags.slice(0, 5).map((tag) => (
                    <button
                      key={tag.hashtag}
                      onClick={() => navigate(`/network/hashtag/${tag.hashtag}`)}
                      className="flex items-center justify-between w-full p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 text-sm">{tag.hashtag}</span>
                      </div>
                      <span className="text-purple-500 text-xs">{tag.count} posts</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Feed Tab */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Create Post - Premium Input Node */}
                <div className="bg-[#0a0c10]/60 border border-white/5 rounded-[32px] p-8 backdrop-blur-xl mb-10 overflow-hidden relative">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-[#0a0c10] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
                         <span className="text-xl font-rubik font-[900] text-white">{user?.fullName?.charAt(0)}</span>
                      </div>
                      <div 
                         onClick={() => setShowCreatePost(true)}
                         className="flex-1 py-4 px-8 bg-white/5 border border-white/5 rounded-2xl text-white/30 text-[14px] font-bold cursor-pointer hover:bg-white/10 transition-all font-rubik"
                      >
                         Initiate status transmission...
                      </div>
                   </div>
                   <div className="flex items-center gap-8 mt-8 pt-8 border-t border-white/5">
                      <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-[#00ff9d] transition-all">
                         <Image size={18} className="text-blue-400" />
                         Visual Node
                      </button>
                      <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-[#00ff9d] transition-all">
                         <Video size={18} className="text-[#00ff9d]" />
                         Stream Node
                      </button>
                      <button className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-[#00ff9d] transition-all">
                         <FileText size={18} className="text-orange-400" />
                         Logic Paper
                      </button>
                   </div>
                </div>

                {/* Posts */}
                {loading ? (
                  <div className="flex items-center justify-center py-32">
                    <ThinkingLoader loadingText="Mapping Nodes" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-[#0a0c10]/20 border border-white/5 rounded-[40px] p-24 text-center backdrop-blur-xl">
                    <MessageSquare className="w-16 h-16 text-white/10 mx-auto mb-8" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Quiet Spectrum</h3>
                    <p className="text-white/30 font-rubik font-bold uppercase text-[13px] tracking-wide">No signals detected in your immediate network</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {posts.map((post, idx) => (
                      <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.8 }}
                      >
                        <PostCard
                          post={post}
                          onLike={() => handleLikePost(post._id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Load More */}
                {hasMore && posts.length > 0 && (
                  <div className="text-center">
                    <GlassButton onClick={() => {
                      setPage(p => p + 1);
                      loadFeed(page + 1);
                    }}>
                      Load More
                    </GlassButton>
                  </div>
                )}
              </div>
            )}

            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div>
                {connections.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No connections yet</h3>
                    <p className="text-purple-300 mb-6">
                      Start building your professional network
                    </p>
                    <GlassButton onClick={() => setActiveTab('feed')}>
                      Find People
                    </GlassButton>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.map((connection) => (
                      <ConnectionCard
                        key={connection._id}
                        connection={connection}
                        onView={() => navigate(`/profile/${connection.user._id}`)}
                        onMessage={() => toast('Messaging coming soon!')}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                {/* Received Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Received ({requests.received.length})
                  </h3>
                  {requests.received.length === 0 ? (
                    <p className="text-purple-300 text-center py-8">No pending requests</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.received.map((request) => (
                        <RequestCard
                          key={request._id}
                          request={request}
                          type="received"
                          onAccept={() => handleRequestResponse(request._id, 'accept')}
                          onReject={() => handleRequestResponse(request._id, 'reject')}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Sent Requests */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Sent ({requests.sent.length})
                  </h3>
                  {requests.sent.length === 0 ? (
                    <p className="text-purple-300 text-center py-8">No sent requests</p>
                  ) : (
                    <div className="space-y-3">
                      {requests.sent.map((request) => (
                        <RequestCard
                          key={request._id}
                          request={request}
                          type="sent"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0c10]/95 border border-purple-500/30 rounded-2xl w-full max-w-lg"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Create Post</h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    <X className="w-5 h-5 text-purple-400" />
                  </button>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/30 rounded-full flex items-center justify-center">
                    <span className="text-white">{user?.fullName?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.fullName}</p>
                    <button className="flex items-center gap-1 text-purple-400 text-sm">
                      {postVisibility === 'public' ? (
                        <Globe className="w-3 h-3" />
                      ) : (
                        <Users className="w-3 h-3" />
                      )}
                      {postVisibility === 'public' ? 'Public' : 'Connections'}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="What would you like to share?"
                  className="w-full h-40 bg-transparent border-none text-white placeholder-purple-400 resize-none focus:outline-none"
                  autoFocus
                />

                {/* Visibility Toggle */}
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => setPostVisibility('connections')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      postVisibility === 'connections'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-purple-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Connections
                  </button>
                  <button
                    onClick={() => setPostVisibility('public')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      postVisibility === 'public'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-purple-300'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    Public
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg">
                      <Image className="w-5 h-5 text-blue-400" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg">
                      <Video className="w-5 h-5 text-green-400" />
                    </button>
                  </div>
                  <GlassButton
                    onClick={handleCreatePost}
                    disabled={posting || !newPostContent.trim()}
                    className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Post Card Component
function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: () => void;
}) {
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="group bg-[#0a0c10]/40 border border-white/5 rounded-[32px] p-8 md:p-10 transition-all hover:bg-[#1c2128] hover:border-white/10 shadow-2xl backdrop-blur-sm relative overflow-hidden mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#0a0c10] border border-white/10 rounded-[22px] flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-1 group-hover:border-[#00ff9d]/30 transition-colors">
            {post.author.profileImage ? (
              <img
                src={post.author.profileImage}
                alt={post.author.fullName}
                className="w-full h-full object-cover rounded-[18px]"
              />
            ) : (
              <span className="text-xl font-rubik font-[900] text-white">{post.author.fullName.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <p className="text-lg font-rubik font-[900] text-white uppercase tracking-tight group-hover:text-[#00ff9d] transition-colors">{post.author.fullName}</p>
               <div className="w-1 h-1 rounded-full bg-[#00ff9d]" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded">NODE 1A</p>
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-white/30">{post.author.targetRole || 'MEMBER'}</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] font-black uppercase tracking-widest text-white/20">
              <span className="flex items-center gap-2">
                <Clock size={12} />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/5" />
              <span className="flex items-center gap-2">
                {post.visibility === 'public' ? <Globe size={12} /> : <Users size={12} />}
                {post.visibility.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 text-white/30 hover:text-white transition-all">
           <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="relative mb-8">
        <p className="text-[16px] md:text-[18px] leading-relaxed text-white/80 font-medium tracking-tight whitespace-pre-wrap font-rubik">
           {post.content}
        </p>
      </div>

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-8">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-[#00ff9d] text-[11px] font-black uppercase tracking-widest hover:underline cursor-pointer bg-[#00ff9d]/5 px-3 py-1 rounded-lg">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Images - Premium Display */}
      {post.images && post.images.length > 0 && (
        <div className={`grid gap-4 mb-8 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, idx) => (
            <div key={idx} className="relative rounded-[24px] overflow-hidden border border-white/10 group/img">
               <img
                 src={img}
                 alt="Post image"
                 className="w-full h-[400px] object-cover group-hover/img:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10]/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}

      {/* Stats - Tech Style */}
      <div className="flex items-center gap-10 py-6 border-y border-white/5 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
        <div className="flex items-center gap-3">
           <span className="text-white">{post.likeCount}</span>
           LIKES
        </div>
        <div className="flex items-center gap-3">
           <span className="text-white">{post.commentCount}</span>
           COMMENT NODES
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
           <button
             onClick={onLike}
             className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all border ${
               post.isLiked
                 ? 'bg-[#ff3b3b]/10 border-[#ff3b3b]/30 text-[#ff3b3b]'
                 : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
             }`}
           >
             <Heart size={18} className={post.isLiked ? 'fill-current' : ''} />
             <span className="text-[11px] font-black uppercase tracking-widest">Transmit Like</span>
           </button>
           
           <button
             onClick={() => setShowComments(!showComments)}
             className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:bg-white/10 transition-all"
           >
             <MessageSquare size={18} />
             <span className="text-[11px] font-black uppercase tracking-widest">Open Thread</span>
           </button>
        </div>

        <button className="w-12 h-12 rounded-2xl bg-white text-[#0a0c10] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
           <Share2 size={20} />
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex gap-4 items-center bg-white/5 rounded-2xl p-2 pr-6">
                <div className="w-10 h-10 bg-[#0a0c10] border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                   <span className="text-white font-black">Y</span>
                </div>
                <input
                  type="text"
                  placeholder="Record your pulse on this signal..."
                  className="flex-1 bg-transparent border-none text-white text-[14px] font-bold placeholder-white/10 focus:outline-none py-3"
                />
                <button className="text-[#00ff9d] text-[10px] font-black uppercase tracking-widest">Push</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Connection Card Component
function ConnectionCard({
  connection,
  onView,
  onMessage,
}: {
  connection: Connection;
  onView: () => void;
  onMessage: () => void;
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-purple-500/30 rounded-full flex items-center justify-center overflow-hidden">
          {connection.user.profileImage ? (
            <img
              src={connection.user.profileImage}
              alt={connection.user.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl text-white">
              {connection.user.fullName.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">{connection.user.fullName}</h4>
          <p className="text-purple-400 text-sm">{connection.user.targetRole || 'Student'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onMessage}
            className="p-2 hover:bg-white/10 rounded-lg text-purple-400"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <GlassButton onClick={onView} className="text-sm">
            View
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}

// Request Card Component
function RequestCard({
  request,
  type,
  onAccept,
  onReject,
}: {
  request: Connection;
  type: 'received' | 'sent';
  onAccept?: () => void;
  onReject?: () => void;
}) {
  const user = type === 'received' 
    ? (request as unknown as { requester: UserSummary }).requester 
    : (request as unknown as { recipient: UserSummary }).recipient;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-purple-500/30 rounded-full flex items-center justify-center overflow-hidden">
          <span className="text-xl text-white">
            {user?.fullName?.charAt(0) || '?'}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-white">{user?.fullName}</h4>
          <p className="text-purple-400 text-sm">{user?.targetRole || 'Student'}</p>
          {request.message && (
            <p className="text-purple-300 text-sm mt-1">"{request.message}"</p>
          )}
        </div>
        {type === 'received' ? (
          <div className="flex gap-2">
            <button
              onClick={onAccept}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={onReject}
              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        )}
      </div>
    </GlassCard>
  );
}
