import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    joinedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, { _id: false });


const lastMessageSchema = new mongoose.Schema({
    _id: { type: String },
    content: {
        type: String,
        default: null,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: null,
    },
}, { _id: false }); //{ _id: false } : để cho moogo không tự tạo id cho schema này 

const conversationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['direct', 'group'], // giới hạn giá trị hợp lệ ['direct', 'group']
        required: true,
    },
    participants: {
        type: [participantSchema],
        required: true,
    },
    group: {
        type: [groupSchema]
    },
    lastMessageAt: {
        type: Date
    },
    seenBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    lastMessage: {
        type: lastMessageSchema,
        default: null,
    },
    unreadCounts: {
        type: Map, // Map : lưu số tin nhắn chưa đọc của user
        of: Number,
        default: {},
    },
}, { timestamps: true });

// tạo compound để query danh sách chat nhanh hơn
conversationSchema.index({
    "participants.userId": 1,
    lastMessageAt: -1,
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;