import ConversationModel from '../models/ConversationModel.js';
import { createConversation } from '../../../../core/entities/Conversation.js';

/**
 * Create a new conversation
 * @description Creates a conversation between participants
 * @param {object} conversationData - Conversation data
 * @returns {Promise<object>} Created conversation
 */
export const create = async (conversationData) => {
    const conversation = new ConversationModel(conversationData);
    const saved = await conversation.save();

    const result = createConversation(saved.toObject());
    return result;
};

/**
 * Find conversation by ID
 * @description Retrieves a conversation by its ID
 * @param {string} id - Conversation ID
 * @returns {Promise<object | null>} Conversation or null
 */
export const findById = async (id) => {
    const conversation = await ConversationModel.findById(id).populate('lastMessage').lean();
    return conversation ? createConversation(conversation) : null;
};

/**
 * Find conversation by participants
 * @description Finds a conversation between two users
 * @param {string} participant1Id - First participant ID
 * @param {string} participant2Id - Second participant ID
 * @returns {Promise<object | null>} Conversation or null
 */
export const findByParticipants = async (participant1Id, participant2Id) => {
    const conversation = await ConversationModel.findOne({
        participants: { $all: [participant1Id, participant2Id] },
    })
        .populate('lastMessage')
        .lean();

    return conversation ? createConversation(conversation) : null;
};

/**
 * Find conversations by user ID
 * @description Retrieves all conversations for a user
 * @param {string} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<object>} Conversations and pagination
 */
export const findByUserId = async (userId, options = { limit: 20, skip: 0 }) => {
    const { limit, skip } = options;
    const conversations = await ConversationModel.find({
        participants: userId,
    })
        .sort({ lastMessageAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('lastMessage')
        .lean();

    const total = await ConversationModel.countDocuments({
        participants: userId,
    });

    return {
        conversations: conversations.map(createConversation),
        total,
        hasMore: skip + conversations.length < total,
    };
};

/**
 * Update last message
 * @description Updates the last message reference in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @returns {Promise<object | null>} Updated conversation
 */
export const updateLastMessage = async (conversationId, messageId) => {
    const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
            lastMessage: messageId,
            lastMessageAt: new Date(),
        },
        { new: true },
    ).lean();
    return conversation ? createConversation(conversation) : null;
};

/**
 * Increment unread count
 * @description Increments unread message count for a user
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<object | null>} Updated conversation
 */
export const incrementUnreadCount = async (conversationId, userId) => {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) return null;

    const currentCount = conversation.unreadCount.get(userId) || 0;
    conversation.unreadCount.set(userId, currentCount + 1);
    await conversation.save();

    return createConversation(conversation.toObject());
};

/**
 * Reset unread count
 * @description Resets unread message count for a user to zero
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @returns {Promise<object | null>} Updated conversation
 */
export const resetUnreadCount = async (conversationId, userId) => {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) return null;

    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    return createConversation(conversation.toObject());
};

/**
 * Delete conversation
 * @description Deletes a conversation by ID
 * @param {string} id - Conversation ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteConversation = async (id) => {
    const result = await ConversationModel.findByIdAndDelete(id);
    return !!result;
};

export { deleteConversation as delete };
