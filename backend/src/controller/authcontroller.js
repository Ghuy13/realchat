import bcrypt from "bcrypt";
import User from "../models/User.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngay

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

    };

};

export const signIn = async (req, res) => {

    try {
        // lấy inputs
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "Không thể thiếu username, password" })

        };

        // lấy hashedPassword trong db để so sánh với password input
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "UserName hoặc Password không đúng" })

        };
        //kiểm tra password
        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return res.status(401).json({ message: "UserName hoặc Password không đúng" })
        };

        // nếu khớp -> tạo accessToken với JWT
        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '15m' }
        );

        // tạo refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        // tạo session mới để lưu refresh token
        await Session.create({
            userId: user.id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // trả refresh token về cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,         // không thể bị truy cập bới JS
            secure: true,
            sameSite: 'none',        // cho phép backend và frontend chạy trên 2 domain khác nhau
            maxAge: REFRESH_TOKEN_TTL,

        });


        // trả access token về trong res
        return res.status(200).json({ message: `User ${user.displayName} đã logged in!!!`, accessToken });


    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Lỗi hệ thống!!!" })
    }


};

export const signOut = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        if (!token) {
            // xóa refresh token trong session 
            await Session.deleteOne({ refreshToken: token });
            // xóa refresh trong cookie 
            res.clearCookie("refreshToken");
        }
        return res.status(204);
    } catch (error) {
        console.error("Lỗi khi gọi sigOut", error);
        return res.status(500).json({ message: "Lỗi hệ thống!!!" })
    }
}