// Cập nhật lại thông tin cuộc trò chuyện sau khi tạo tin nhắn mới
export const undateConversationAfterCreateMessage = async (conversation, message, senderId) => {

    // Reset danh sách người đã xem vì có tin nhắn mới
    // Cập nhật thời gian tin nhắn cuối cùng
    // Lưu lại thông tin tin nhắn cuối (để hiển thị ở danh sách chat)
    conversation.set({
        seenBy: [],
        lastMessageAt: message.createdAt,
        lastMessage: {
            _id: message._id,
            content: message.content,
            senderId,
            createdAt: message.createdAt
        },
    })

    // Cập nhật số lượng tin nhắn chưa đọc cho từng thành viên
    conversation.participants.forEach((p) => {

        // Lấy id của từng thành viên trong cuộc trò chuyện
        const memberId = p.userId.toString();

        // Kiểm tra xem thành viên đó có phải là người gửi tin nhắn không
        const isSender = memberId === senderId.toString();

        // Lấy số tin nhắn chưa đọc trước đó (nếu chưa có thì mặc định là 0)
        const prevCount = conversation.unreadCounts.get(memberId) || 0;

        // Nếu là người gửi → reset unread về 0
        // Nếu không phải → tăng unread lên 1
        conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
    })
};
