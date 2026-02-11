import jwt from "jsonwebtoken";
import User from "../models/User.js";


//authorization - xác minh user là Ai
export const protectedRoute = (req, res, next) => {
    try {

        // lấy access token từ client gửi lên header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; //Bearer <token>
        if (!token) {
            return res.status(401).json({ message: "Khônng tìm thấy Accesss token" })
        }

        // xác nhận token có hợp lệ hay không
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(403).json({ message: "Access Token không hợp lệ" })
            }
            // token hợp tìm usser trong db
            const user = await User.findById(decodedUser.userId).select("-password"); //.select("-password"): lấy thông tin user trừ mật khẩu
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại" })
            }
            //trả user vào req
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("Lỗi khi xác minh JWT trong authMiddlewares", error);
        return res.status(500).json({ message: "Lỗi hệ thống!!!" })

    }
}
