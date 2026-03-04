import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema({
    // from : id của người gửi lời mời kết bạn
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // to: người nhận
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        maxlength: 300,

    },

}, { timestamps: true });

// thêm index để không cho gửi chung lời mời 
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });

// giúp truy vấn nhanh tất cả lời mời kết bạn đã gửi và nhận
friendRequestSchema.index({ from: 1 });

friendRequestSchema.index({ to: 1 });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

export default FriendRequest;


