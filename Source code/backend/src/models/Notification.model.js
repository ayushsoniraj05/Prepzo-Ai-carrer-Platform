/**
 * Notification Model
 * Represents notifications for users
 */

import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // Recipient
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Sender (if applicable)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Notification Type
    type: {
      type: String,
      enum: [
        // Connection
        'connection_request',
        'connection_accepted',
        
        // Job & Application
        'new_job_match',
        'job_recommendation',
        'application_submitted',
        'application_received',
        'application_viewed',
        'application_shortlisted',
        'application_rejected',
        'application_status_changed',
        'interview_scheduled',
        'offer_extended',
        'offer_received',
        'job_deadline_reminder',
        'saved_job_deadline',
        
        // Company
        'company_followed',
        'company_new_job',
        
        // Post & Engagement
        'post_like',
        'post_comment',
        'post_share',
        'post_mention',
        'comment_like',
        'comment_reply',
        
        // Profile
        'profile_view',
        'skill_endorsement',
        
        // System
        'system_announcement',
        'feature_update',
        'reminder',
        'welcome',
        
        // AI
        'ai_recommendation',
        'ai_mentor_response',
        'resume_analysis_complete',
        'assessment_reminder',
      ],
      required: true,
    },
    
    // Title
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    
    // Message
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    
    // Related entities
    relatedEntities: {
      job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
      },
      application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      connection: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection',
      },
    },
    
    // Link to navigate to
    actionUrl: String,
    
    // Action buttons
    actions: [{
      label: String,
      type: { type: String, enum: ['primary', 'secondary', 'danger'] },
      url: String,
    }],
    
    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    
    // Dismissed (user removed from notification center)
    isDismissed: {
      type: Boolean,
      default: false,
    },
    dismissedAt: Date,
    
    // Priority
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    
    // Delivery channels
    deliveryChannels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    
    // Delivery status
    deliveryStatus: {
      inApp: { sent: Boolean, sentAt: Date },
      email: { sent: Boolean, sentAt: Date, messageId: String },
      push: { sent: Boolean, sentAt: Date },
    },
    
    // Metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // Expiry
    expiresAt: Date,
    
    // Category for filtering
    category: {
      type: String,
      enum: ['jobs', 'connections', 'engagement', 'system', 'ai'],
      default: 'system',
    },
    
    // Grouping (for bundling notifications)
    groupKey: String,
    groupedCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, category: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ groupKey: 1 });

// Pre-save to set category
notificationSchema.pre('save', function (next) {
  if (!this.category) {
    const jobTypes = ['new_job_match', 'job_recommendation', 'application_submitted', 'application_received', 'application_viewed', 
                      'application_shortlisted', 'application_rejected', 'application_status_changed', 'interview_scheduled', 
                      'offer_extended', 'offer_received', 'job_deadline_reminder', 'saved_job_deadline', 'company_new_job'];
    const connectionTypes = ['connection_request', 'connection_accepted', 'company_followed'];
    const engagementTypes = ['post_like', 'post_comment', 'post_share', 'post_mention', 
                             'comment_like', 'comment_reply', 'profile_view', 'skill_endorsement'];
    const aiTypes = ['ai_recommendation', 'ai_mentor_response', 'resume_analysis_complete', 'assessment_reminder'];
    
    if (jobTypes.includes(this.type)) this.category = 'jobs';
    else if (connectionTypes.includes(this.type)) this.category = 'connections';
    else if (engagementTypes.includes(this.type)) this.category = 'engagement';
    else if (aiTypes.includes(this.type)) this.category = 'ai';
    else this.category = 'system';
  }
  next();
});

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDismissed: false,
  });
};

// Static method to get notifications for a user
notificationSchema.statics.getUserNotifications = async function (userId, options = {}) {
  const { page = 1, limit = 20, category, unreadOnly = false } = options;
  const skip = (page - 1) * limit;
  
  const query = {
    recipient: userId,
    isDismissed: false,
  };
  
  if (category) query.category = category;
  if (unreadOnly) query.isRead = false;
  
  const [notifications, total, unreadCount] = await Promise.all([
    this.find(query)
      .populate('sender', 'fullName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
    this.countDocuments({ recipient: userId, isRead: false, isDismissed: false }),
  ]);
  
  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    unreadCount,
  };
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function (userId, category) {
  const query = { recipient: userId, isRead: false };
  if (category) query.category = category;
  
  return this.updateMany(query, {
    isRead: true,
    readAt: new Date(),
  });
};

// Static method to create notification
notificationSchema.statics.createNotification = async function (data) {
  const notification = new this(data);
  await notification.save();
  
  // Here you could emit socket event for real-time notification
  // socketService.emit(data.recipient, 'notification', notification);
  
  return notification;
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
