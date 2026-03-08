import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',  // Tham chiếu tới collection "Conversation" Cho phép dùng populate() để lấy thông tin cuộc trò chuyện
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        trim: true, // tự động xóa khoản trắng thừa đầu và cuối tin nhắn
    },
    imgUrl: {
        type: String,
    },
},
    {
        timestamps: true, // tự động thêm createdAt, updatedAt và Tự động cập nhật khi update 
    },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;