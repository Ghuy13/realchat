import multer from "multer"; // thư viện nhận và xử lý file upload từ form lên server
import { v2 as cloudinary } from "cloudinary";


export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 1024 * 1024 * 1 //1MB
    },
});

export const uploadImageFromBuffer = (buffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "real_chat/avatars",
            resource_type: "image",
            transformation: [{ with: 200, height: 200, crop: "fill" }],
            ...options,
        },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

export const uploadMessageImageFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "real_chat/messages",
            resource_type: "image",
            // Không crop, giữ nguyên kích thước
        },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(buffer);
    });
};

export const uploadMessageImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 10, // 10MB cho ảnh message
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh'), false);
        }
    },
});