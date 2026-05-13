/**
 * Connection Model
 * Represents professional connections between users (LinkedIn-style)
 */

import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
  {
    // Connection parties
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'blocked'],
      default: 'pending',
    },
    
    // Connection message
    message: {
      type: String,
      maxlength: [300, 'Connection message cannot exceed 300 characters'],
    },
    
    // Response
    respondedAt: Date,
    
    // Connection source
    source: {
      type: String,
      enum: ['profile', 'suggestion', 'search', 'company', 'post', 'mutual'],
      default: 'profile',
    },
    
    // Mutual connections at time of request
    mutualConnectionsCount: {
      type: Number,
      default: 0,
    },
    
    // Follow status (can follow without connection)
    isFollowing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
connectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
connectionSchema.index({ requester: 1, status: 1 });
connectionSchema.index({ recipient: 1, status: 1 });

// Static method to check if users are connected
connectionSchema.statics.areConnected = async function (userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
    status: 'accepted',
  });
  return !!connection;
};

// Static method to get connection status
connectionSchema.statics.getConnectionStatus = async function (userId1, userId2) {
  const connection = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2 },
      { requester: userId2, recipient: userId1 },
    ],
  });
  
  if (!connection) return { status: 'none', canConnect: true };
  
  if (connection.status === 'accepted') {
    return { status: 'connected', canConnect: false, connectionId: connection._id };
  }
  
  if (connection.status === 'pending') {
    const isRequester = connection.requester.toString() === userId1.toString();
    return {
      status: isRequester ? 'pending_sent' : 'pending_received',
      canConnect: false,
      connectionId: connection._id,
    };
  }
  
  if (connection.status === 'blocked') {
    return { status: 'blocked', canConnect: false };
  }
  
  return { status: 'none', canConnect: true };
};

// Static method to get user's connections
connectionSchema.statics.getUserConnections = async function (userId, options = {}) {
  const { page = 1, limit = 20, status = 'accepted' } = options;
  const skip = (page - 1) * limit;
  
  const connections = await this.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status,
  })
    .populate('requester', 'fullName email profilePicture headline targetRole')
    .populate('recipient', 'fullName email profilePicture headline targetRole')
    .sort({ respondedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  // Map to show the other user
  return connections.map((conn) => {
    const otherUser = conn.requester._id.toString() === userId.toString()
      ? conn.recipient
      : conn.requester;
    return {
      connectionId: conn._id,
      user: otherUser,
      connectedAt: conn.respondedAt || conn.createdAt,
    };
  });
};

// Static method to get mutual connections
connectionSchema.statics.getMutualConnections = async function (userId1, userId2) {
  // Get connections of both users
  const [user1Connections, user2Connections] = await Promise.all([
    this.find({
      $or: [{ requester: userId1 }, { recipient: userId1 }],
      status: 'accepted',
    }),
    this.find({
      $or: [{ requester: userId2 }, { recipient: userId2 }],
      status: 'accepted',
    }),
  ]);
  
  // Extract user IDs
  const getConnectedUserId = (conn, userId) =>
    conn.requester.toString() === userId.toString()
      ? conn.recipient.toString()
      : conn.requester.toString();
  
  const user1ConnectedIds = new Set(
    user1Connections.map((c) => getConnectedUserId(c, userId1))
  );
  const user2ConnectedIds = user2Connections.map((c) =>
    getConnectedUserId(c, userId2)
  );
  
  // Find mutual
  const mutualIds = user2ConnectedIds.filter((id) => user1ConnectedIds.has(id));
  
  return mutualIds;
};

// Static method to get connection count
connectionSchema.statics.getConnectionCount = async function (userId) {
  return this.countDocuments({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted',
  });
};

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;
