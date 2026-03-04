import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { undateConversationAfterCreateMessage } from "../utils/messageHelper.js";

export const sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content, conversationId } = req.body
        const senderId = req.user._id  // người dùng đang gửi tin nhắn

        // let conversationId;
        // lưu thông tin cuộc trò truyện
        let conversation;
        if (!content) {
            return res.status(400).json({ message: 'Thiếu nội dung' })
        }
        if (conversationId) {
            conversation = await Conversation.findById(conversationId)
        }
        if (!conversation) {
            conversation = await Conversation.create({
                type: "direct",
                participants: [
                    { userId: senderId, joinedAt: new Date() },
                    { userId: recipientId, joinedAt: new Date() }
                ],
                lastMessageAt: new Date(),
                unreadCounts: new Map()
            })
        }

        const message = await Message.create({
            conversationId: conversation._id,
            sendId: senderId,
            content
        });

        undateConversationAfterCreateMessage(conversation, message, senderId);

        await conversation.save();

        return res.status(201).json({ message });

    } catch (error) {
        console.error("Lỗi xảy ra khi gửi tinh nhắn trực tiếp", error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })
    }
};

export const sendDGroupMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user._id;
        const conversation = req.conversation;

        if (!content) {
            return res.status(400).json({ message: 'Thiếu nội dung' })
        }

        const message = await Message.create({
            conversationId,
            sendId: senderId,
            content
        });

        undateConversationAfterCreateMessage(conversation, message, senderId);

        await conversation.save();

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi xảy ra khi gửi tinh nhắn nhóm", error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })
    }
};