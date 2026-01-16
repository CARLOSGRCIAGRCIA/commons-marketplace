import MessageModel from '../models/MessageModel.js';
import { createMessage } from '../../../../core/entities/Message.js';

/**
 * Create a new message
 * @description Stores a message in the database
 * @param {object} messageData - Message data
 * @returns {Promise<object>} Created message
 */
export const create = async (messageData) => {
    const message = new MessageModel(messageData);
    const saved = await message.save();
    const plainObject = saved.toObject();

    if (!plainObject.id && plainObject._id) {
        plainObject.id = plainObject._id;
    }

    const result = createMessage(plainObject);
    return result;
};

/**
 * Find message by ID
 * @description Retrieves a message by its ID
 * @param {string} id - Message ID
 * @returns {Promise<object | null>} Message or null
 */
export const findById = async (id) => {
    const message = await MessageModel.findById(id).lean();
    return message ? createMessage(message) : null;
};

/**
 * Find messages by conversation ID
 * @description Retrieves messages for a conversation with pagination
 * @param {string} conversationId - Conversation ID
 * @param {object} options - Query options (limit, skip, sort)
 * @returns {Promise<object>} Messages and pagination info
 */
export const findByConversationId = async (conversationId, options = { limit: 50, skip: 0 }) => {
    const { limit, skip } = options;
    const messages = await MessageModel.find({ conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

    const total = await MessageModel.countDocuments({ conversationId });

    return {
        messages: messages.map(createMessage),
        total,
        hasMore: skip + messages.length < total,
    };
};

/**
 * Update message status
 * @description Updates the status of a message
 * @param {string} id - Message ID
 * @param {string} status - New status (sent, delivered, read)
 * @returns {Promise<object | null>} Updated message
 */
export const updateStatus = async (id, status) => {
    const message = await MessageModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return message ? createMessage(message) : null;
};

/**
 * Mark messages as read
 * @description Marks all unread messages in a conversation as read
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID who is reading
 * @returns {Promise<number>} Number of messages updated
 */
export const markAsRead = async (conversationId, userId) => {
    const result = await MessageModel.updateMany(
        {
            conversationId,
            receiverId: userId,
            status: { $ne: 'read' },
        },
        { status: 'read' },
    );
    return result.modifiedCount;
};

/**
 * Delete message
 * @description Deletes a message by ID
 * @param {string} id - Message ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteMessage = async (id) => {
    const result = await MessageModel.findByIdAndDelete(id);
    return !!result;
};

export { deleteMessage as delete };
