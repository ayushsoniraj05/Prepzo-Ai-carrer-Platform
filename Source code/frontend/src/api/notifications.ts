/**
 * Notifications API Service
 * Handles user notifications
 */

import api from './axios';

// Types
export type NotificationCategory = 'jobs' | 'connections' | 'engagement' | 'system' | 'ai';

export type NotificationType =
  // Job related
  | 'job_recommendation'
  | 'job_deadline_reminder'
  | 'job_match'
  | 'saved_job_closing'
  | 'company_new_job'
  // Application related
  | 'application_submitted'
  | 'application_viewed'
  | 'application_shortlisted'
  | 'application_rejected'
  | 'application_status_changed'
  | 'interview_scheduled'
  | 'interview_reminder'
  | 'offer_received'
  // Connection related
  | 'connection_request'
  | 'connection_accepted'
  | 'profile_view'
  | 'follow_user'
  // Post related
  | 'post_like'
  | 'post_comment'
  | 'post_share'
  | 'post_mention'
  | 'comment_reply'
  // System
  | 'profile_completion_reminder'
  | 'skill_assessment_reminder'
  | 'new_feature'
  | 'system_announcement'
  // AI related
  | 'ai_insight'
  | 'placement_readiness_update'
  | 'skill_gap_alert'
  | 'career_milestone';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  type: NotificationType;
  title: string;
  message: string;
  relatedEntities?: {
    job?: string;
    company?: string;
    application?: string;
    post?: string;
    user?: string;
  };
  actionUrl?: string;
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: NotificationCategory;
  createdAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  };
}

// API Functions
export const notificationsApi = {
  // Get notifications
  getNotifications: async (params: {
    page?: number;
    limit?: number;
    category?: NotificationCategory;
    isRead?: boolean;
  } = {}): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ success: boolean; data: { count: number } }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async (category?: NotificationCategory) => {
    const response = await api.put('/notifications/read-all', null, {
      params: category ? { category } : {},
    });
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // Clear all notifications
  clearAll: async (category?: NotificationCategory) => {
    const response = await api.delete('/notifications/clear-all', {
      params: category ? { category } : {},
    });
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences: {
    emailEnabled?: boolean;
    pushEnabled?: boolean;
    categories?: Record<NotificationCategory, boolean>;
  }) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};

export default notificationsApi;
