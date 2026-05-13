/**
 * Post Model
 * Represents posts in the professional activity feed (LinkedIn-style)
 */

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        maxlength: [300, 'Reply cannot exceed 300 characters'],
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema(
  {
    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Content
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [3000, 'Post cannot exceed 3000 characters'],
    },
    
    // Media
    images: [{
      url: String,
      caption: String,
    }],
    videos: [{
      url: String,
      thumbnail: String,
    }],
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
    
    // Post Type
    postType: {
      type: String,
      enum: [
        'update',           // General update
        'achievement',      // Certifications, awards
        'project',          // Project showcase
        'job_opportunity',  // Job sharing
        'article',          // Long-form content
        'poll',             // Polls
        'question',         // Q&A
        'interview_experience', // Interview experiences
        'learning',         // Learning updates
        'announcement',     // Announcements
      ],
      default: 'update',
    },
    
    // For job_opportunity type
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
    },
    
    // For project type
    projectDetails: {
      title: String,
      techStack: [String],
      githubUrl: String,
      demoUrl: String,
    },
    
    // For achievement type
    achievementDetails: {
      title: String,
      organization: String,
      date: Date,
      credentialUrl: String,
    },
    
    // For poll type
    poll: {
      question: String,
      options: [{
        text: String,
        votes: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        }],
        voteCount: { type: Number, default: 0 },
      }],
      expiresAt: Date,
      totalVotes: { type: Number, default: 0 },
    },
    
    // Hashtags
    hashtags: [String],
    
    // Mentions
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    // Engagement
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    likeCount: {
      type: Number,
      default: 0,
    },
    
    comments: [commentSchema],
    commentCount: {
      type: Number,
      default: 0,
    },
    
    shares: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    shareCount: {
      type: Number,
      default: 0,
    },
    
    // Shared/Reposted from
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    isRepost: {
      type: Boolean,
      default: false,
    },
    
    // Visibility
    visibility: {
      type: String,
      enum: ['public', 'connections', 'private'],
      default: 'public',
    },
    
    // Status
    status: {
      type: String,
      enum: ['active', 'hidden', 'reported', 'deleted'],
      default: 'active',
    },
    
    // Moderation
    reportCount: {
      type: Number,
      default: 0,
    },
    reports: [{
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Edit history
    isEdited: {
      type: Boolean,
      default: false,
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    
    // Metrics
    viewCount: {
      type: Number,
      default: 0,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    
    // Pinned
    isPinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: Date,
    
    // Featured (by admin)
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredAt: Date,
    featuredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Comments settings
    commentsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ content: 'text', hashtags: 'text' });
postSchema.index({ postType: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ visibility: 1, status: 1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ isFeatured: 1, featuredAt: -1 });

// Virtual for engagement rate
postSchema.virtual('engagementRate').get(function () {
  if (this.viewCount === 0) return 0;
  const engagement = this.likeCount + this.commentCount + this.shareCount;
  return ((engagement / this.viewCount) * 100).toFixed(2);
});

// Pre-save hook to extract hashtags
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const matches = this.content.match(hashtagRegex);
    if (matches) {
      this.hashtags = [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
    }
  }
  
  // Update counts
  this.likeCount = this.likes.length;
  this.commentCount = this.comments.length;
  this.shareCount = this.shares.length;
  
  next();
});

// Static method to get feed for a user
postSchema.statics.getFeed = async function (userId, options = {}) {
  const { page = 1, limit = 20, postType } = options;
  const skip = (page - 1) * limit;
  
  // Get user's connections
  const Connection = mongoose.model('Connection');
  const connections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });
  
  const connectionIds = connections.map((c) =>
    c.requester.toString() === userId.toString() ? c.recipient : c.requester
  );
  
  // Include user's own posts and connections' posts
  const authorIds = [userId, ...connectionIds];
  
  const query = {
    $or: [
      { author: { $in: authorIds }, visibility: { $in: ['public', 'connections'] } },
      { visibility: 'public', isFeatured: true },
    ],
    status: 'active',
  };
  
  if (postType) {
    query.postType = postType;
  }
  
  const posts = await this.find(query)
    .populate('author', 'fullName profilePicture headline targetRole')
    .populate('originalPost')
    .populate('relatedJob', 'title company')
    .populate('comments.author', 'fullName profilePicture')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  
  return posts;
};

// Instance method to toggle like
postSchema.methods.toggleLike = function (userId) {
  const likeIndex = this.likes.findIndex(
    (id) => id.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  this.likeCount = this.likes.length;
  return this.save();
};

// Instance method to add comment
postSchema.methods.addComment = function (userId, content) {
  this.comments.push({
    author: userId,
    content,
  });
  this.commentCount = this.comments.length;
  return this.save();
};

const Post = mongoose.model('Post', postSchema);

export default Post;
