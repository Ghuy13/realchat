import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import friendRoute from "./routes/friendRoute.js";
import messageRoute from "./routes/messageRoute.js";
import ConversationRoute from "./routes/conversationRoute.js"
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddlewares.js";
import cors from "cors";
import { app, server } from "./socket/index.js";
import { v2 as cloudinary } from 'cloudinary';


dotenv.config();


const PORT = process.env.PORT || 5001;

// Normalize CLIENT_URL - remove trailing slash
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

//middlewares 
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


//public routes
app.use('/api/auth', authRoute);


//private routes
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/friends', friendRoute);
app.use('/api/messages', messageRoute);
app.use('/api/conversations', ConversationRoute)


connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server bắt đầu trên cổng ${PORT}`);
    });
});
