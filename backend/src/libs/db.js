import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING)
        console.log('Kết nối CSDL thành công!');
    } catch (error) {
        console.log('Lỗi kết nối không thành công CSDL', error);
        process.exit(1); // dừng chương trình khi không kết nối DB    

    }
}