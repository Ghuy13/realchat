// import bcrypt from "bcrypt";
// import User from "../models/User.js";
// import Session from "../models/Session.js";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";

// const ACCESS_TOKEN_TTL = '30s';
// const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; //14 ngay

// // Hàm nhận request và respone từ user gửi lên 
// export const signUp = async (req, res) => {
//     try {
//         console.log("Request body:", req.body); // DEBUG
//         // Handle both camelCase (firstName/lastName) and lowercase (firstname/lastname)
//         const { username, password, email, firstname, lastname, firstName, lastName } = req.body;
//         const first = firstname || firstName;
//         const last = lastname || lastName;
//         console.log("Destructured values:", { username, password, email, firstname: first, lastname: last }); // DEBUG

//         if (!username || !password || !email || !first || !last) {
//             console.log("Missing fields:", { username, password, email, firstname: first, lastname: last }); // DEBUG
//             return res
//                 .status(400)
//                 .json({ message: "Không thể thiếu username, password, email, firstname, lastname" })
//         }
//         // Kiểm tra userName có tồn tại chưa
//         const duplicateUsername = await User.findOne({ username });
//         if (duplicateUsername) {
//             return res.status(409).json({ message: "UserName đã tồn tại" })
//         }

//         // Kiểm tra email có tồn tại chưa
//         const duplicateEmail = await User.findOne({ email });
//         if (duplicateEmail) {
//             return res.status(409).json({ message: "Email đã tồn tại" })
//         }

//         // Mã hóa password 
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Tạo user mới 
//         await User.create({
//             username,
//             password: hashedPassword,
//             email,
//             name: `${lastName} ${firstName}`,

//         });

//         // return 
//         return res.status(201).json({ message: "Đăng ký thành công" });

//     } catch (error) {
//         console.error("Lỗi khi gọi signUp", error);
//         return res.status(500).json({ message: "Lỗi hệ thống!!!" })

//     };

// };

// export const signIn = async (req, res) => {

//     try {
//         // lấy inputs
//         const { username, password } = req.body;
//         if (!username || !password) {
//             return res.status(400).json({ message: "Không thể thiếu username, password" })

//         };

//         // lấy hashedPassword trong db để so sánh với password input
//         const user = await User.findOne({ username });
//         if (!user) {
//             return res.status(401).json({ message: "UserName hoặc Password không đúng" })

//         };
//         //kiểm tra password
//         const passwordCorrect = await bcrypt.compare(password, user.password);
//         if (!passwordCorrect) {
//             return res.status(401).json({ message: "UserName hoặc Password không đúng" })
//         };

//         // nếu khớp -> tạo accessToken với JWT
//         const accessToken = jwt.sign(
//             { userId: user.id },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: '15m' }
//         );

//         // tạo refresh token
//         const refreshToken = crypto.randomBytes(64).toString("hex");

//         // tạo session mới để lưu refresh token
//         await Session.create({
//             userId: user.id,
//             refreshToken,
//             expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
//         });

//         // trả refresh token về cookie
//         const isProd = process.env.NODE_ENV === 'production';
//         res.cookie("refreshToken", refreshToken, {
//             httpOnly: true,
//             secure: isProd, // secure cookies only in production (HTTPS)
//             sameSite: isProd ? 'none' : 'lax', // 'none' requires secure; use 'lax' in dev
//             maxAge: REFRESH_TOKEN_TTL,
//         });


//         // trả access token về trong res
//         return res.status(200).json({ message: `User ${user.name} đã logged in!!!`, accessToken });


//     } catch (error) {
//         console.error("Lỗi khi gọi signIn", error);
//         return res.status(500).json({ message: "Lỗi hệ thống!!!" })
//     }


// };

// export const signOut = async (req, res) => {
//     try {
//         // lấy refresh token từ cookie
//         const token = req.cookies?.refreshToken;
//         if (token) {
//             // xóa refresh token trong session 
//             await Session.deleteOne({ refreshToken: token });
//             // xóa refresh trong cookie (gồm các tuỳ chọn giống khi set cookie)
//             const isProd = process.env.NODE_ENV === 'production';
//             res.clearCookie("refreshToken", {
//                 httpOnly: true,
//                 secure: isProd,
//                 sameSite: isProd ? 'none' : 'lax',
//             });
//         }

//         // trả về 204 No Content khi đã sign out thành công (hoặc không có token)
//         return res.sendStatus(204);
//     } catch (error) {
//         console.error("Lỗi khi gọi sigOut", error);
//         return res.status(500).json({ message: "Lỗi hệ thống!!!" })
//     }
// }

// // Hàm dùng tạo accesssToken mới từ refreshToken 
// export const refreshToken = async (req, res) => {
//     try {
//         // lấy refreshToken từ cookie
//         const token = req.cookies?.refreshToken;
//         if (!token) {
//             return res.status(401).json({ message: "Token không tồn tại!" })
//         }

//         // so sánh với refreshToken trong DB
//         const session = await Session.findOne({ refreshToken: token });
//         if (!session) {
//             return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn !" })
//         }
//         // kiểm tra hết hạn chưa 
//         if (session.expiresAt < new Date()) {
//             return res.status(403).json({ message: "Token đã hết hạn !" })
//         }
//         // tạo accessToken mới 
//         const accessToken = jwt.sign(
//             { userId: session.userId },
//             process.env.ACCESS_TOKEN_SECRET,
//             { expiresIn: ACCESS_TOKEN_TTL }
//         );
//         //return accessToken mới trong return 
//         return res.status(200).json({ accessToken });

//     } catch (error) {
//         console.error("Lỗi khi gọi refreshToken", error)
//         return res.status(500).json({ message: "Lỗi hệ thống!!!" })
//     }
// }
// @ts-nocheck
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";

const ACCESS_TOKEN_TTL = "30m"; // thuờng là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;

        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({
                message: "Không thể thiếu username, password, email, firstName, và lastName",
            });
        }

        // kiểm tra username tồn tại chưa
        const duplicate = await User.findOne({ username });

        if (duplicate) {
            return res.status(409).json({ message: "username đã tồn tại" });
        }

        // mã hoá password
        const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

        // tạo user mới
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${lastName} ${firstName}`,
        });

        // return
        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi gọi signUp", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const signIn = async (req, res) => {
    try {
        // lấy inputs
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Thiếu username hoặc password." });
        }

        // lấy hashedPassword trong db để so với password input
        const user = await User.findOne({ username });

        if (!user) {
            return res
                .status(401)
                .json({ message: "username hoặc password không chính xác" });
        }

        // kiểm tra password
        const passwordCorrect = await bcrypt.compare(password, user.hashedPassword)

        if (!passwordCorrect) {
            return res
                .status(401)
                .json({ message: "username hoặc password không chính xác" });
        }

        // nếu khớp, tạo accessToken với JWT
        const accessToken = jwt.sign(
            { userId: user._id },
            // @ts-ignore
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        // tạo refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

        // tạo session mới để lưu refresh token
        await Session.create({
            userId: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
        });

        // trả refresh token về trong cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none", //backend, frontend deploy riêng
            maxAge: REFRESH_TOKEN_TTL,
        });

        // trả access token về trong res
        return res
            .status(200)
            .json({ message: `User ${user.displayName} đã logged in!`, accessToken });
    } catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

export const signOut = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;

        if (token) {
            // xoá refresh token trong Session
            await Session.deleteOne({ refreshToken: token });

            // xoá cookie
            res.clearCookie("refreshToken");
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// tạo access token mới từ refresh token
export const refreshToken = async (req, res) => {
    try {
        // lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "Token không tồn tại." });
        }

        // so với refresh token trong db
        const session = await Session.findOne({ refreshToken: token });

        if (!session) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
        }

        // kiểm tra hết hạn chưa
        if (session.expiresAt < new Date()) {
            return res.status(403).json({ message: "Token đã hết hạn." });
        }

        // tạo access token mới
        const accessToken = jwt.sign(
            {
                userId: session.userId,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        // return
        return res.status(200).json({ accessToken });
    } catch (error) {
        console.error("Lỗi khi gọi refreshToken", error);
        return res.status(500).json({ message: "Lỗi hệ thống" });
    }
};