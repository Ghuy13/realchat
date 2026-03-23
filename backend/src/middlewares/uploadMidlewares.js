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