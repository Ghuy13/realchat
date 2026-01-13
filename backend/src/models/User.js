import mongoose from "mongoose";

// user model lưu thông tin người dùng
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,

    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
    },
    avatarUrl: {
        type: String, // link CDN để hiển thị hình
    },
    avatarId: {
        type: String, // Lưu Cloundinary public_id để xóa ảnh trên Cloundinary
    },
    bio: {
        type: String,
        maxlength: 500,
    },
    phone: {
        type: String,
        sparse: true, //cho phép giá trị này để trống null , nhưng không được trùng
        maxlength: 20,
    },
}, {
    timestamps: true,
});

export const User = mongoose.model('User', userSchema);
export default User; 