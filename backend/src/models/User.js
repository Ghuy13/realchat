// import mongoose from "mongoose";

// // user model lưu thông tin người dùng
// const userSchema = new mongoose.Schema({
//     username: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,

//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true,
//         lowercase: true,
//     },
//     name: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     avatarUrl: {
//         type: String, // link CDN để hiển thị hình
//     },
//     avatarId: {
//         type: String, // Lưu Cloundinary public_id để xóa ảnh trên Cloundinary
//     },
//     bio: {
//         type: String,
//         maxlength: 500,
//     },
//     phone: {
//         type: String,
//         sparse: true, //cho phép giá trị này để trống null , nhưng không được trùng
//         maxlength: 20,
//     },
// }, {
//     timestamps: true,
// });

// userSchema.virtual('displayName').get(function () {
//     return this.name;
// });

// userSchema.set('toJSON', { virtuals: true });

// export const User = mongoose.model('User', userSchema);
// export default User; 
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        hashedPassword: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
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
            type: String, // Cloudinary public_id để xoá hình
        },
        bio: {
            type: String,
            maxlength: 500, // tuỳ
        },
        phone: {
            type: String,
            sparse: true, // cho phép null, nhưng không được trùng
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
export default User;