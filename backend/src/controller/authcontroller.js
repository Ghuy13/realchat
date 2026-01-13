import bcrypt from "bcrypt";
import User from "../models/User.js";

// Hàm nhận request và respone từ user gửi lên 
export const signUp = async (req, res) => {
    try {

        const { username, password, email, firstName, lastName } = req.body; // lấy dữ liệu người dùng
        if (!username || !password || !email || !firstName || !lastName) {
            return res
                .status(400)
                .json({ message: "Không thể thiếu username, password, email, firstName, lastName" })
        }
        // Kiểm tra userName có tồn tại chưa
        const duplicate = await User.findOne({ username });

        if (duplicate) {
            return res.status(409).json({ message: "UserName đã tồn tại" })
        }

        // Mã hóa password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user mới 
        await User.create({
            username,
            password: hashedPassword,
            email,
            displayName: `${firstName} ${lastName}`,

        });

        // return 
        return res.status(201).json({ message: "Đăng ký thành công" });

    } catch (error) {
        console.error("Lỗi khi gọi signUp", error);
        return res.status(500).json({ message: "Lỗi hệ thống!!!" })

    }

};