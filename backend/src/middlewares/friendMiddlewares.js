import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";


const pair = (a, b) => a < b ? [a, b] : [b, a];

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id.toString();
        const recipientId = req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];// Lấy danh sách thành viên từ body 

        if (!recipientId && memberIds.lenght === 0) {
            return res.status(400).json({ mesaage: " Cần cung cấp recipientId hoặc memberIds" })
        }

        if (recipientId) {
            const [userA, userB] = pair(me, recipientId)

            const isFriend = await Friend.findOne({ userA, userB })
            if (!isFriend) {
                return res.status(403).json({ message: " Bạn chưa kết bạn với người này" })
            }

            return next();
        }

        //todo : chat group
        const friendChecks = memberIds.map(async (memberId) => {
            const [userA, userB] = pair(me, memberId);
            const friend = await Friend.findOne({ userA, userB });
            return friend ? null : memberId;
        });

        const results = await Promise.all(friendChecks);
        const notFriends = results.filter(Boolean);

        if (notFriends.length > 0) {
            return res.status(403).json({ mesaage: "Bạn chỉ có thể thêm bạn bè vào nhóm", notFriends })
        }

        next();
    } catch (error) {
        console.error("Lỗi sảy ra khi checkFriendship:", error)
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
};

export const checkGroupMembership = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;

        // truy vấn db để lấy conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" })
        }

        const isMember = conversation.participants.some((p) => p.userId.toString() === userId.toString());

        if (!isMember) {
            return res.status(403).json({ message: "Bạn không phải thành viên của nhóm này" })
        }
        req.conversation = conversation;

        next();
    } catch (error) {
        console.error("Lỗi xảy ra khi checkGroupMembership", error);
        return res.status(500).json({ message: "Lỗi hệ thống" })
    }
};

