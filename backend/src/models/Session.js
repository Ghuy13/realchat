import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    refreshToken: {
        type: String,
        required: true,
        unique: true,
    },
    //lưu thời điểm refresh token hết hạn
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,// 
});
//tự động xóa document khi hết hạng
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);;

