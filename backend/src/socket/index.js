import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddlewares.js";
import { getUserConversationsForSocketIO } from "../controller/conversationController.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    // cấu hình cors để frontend kết nối
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map(); // {userId: socketId}

//socket lắng ghe sự kiện kết nối
io.on("connection", async (socket) => {
    const user = socket.user;

    console.log(`${user.displayName} online với socket ${socket.id}`);

    onlineUsers.set(user._id, socket.id);

    io.emit("online-users", Array.from(onlineUsers.keys()));

    const conversationIds = await getUserConversationsForSocketIO(user._id);
    conversationIds.forEach((id) => {
        socket.join(id);
    });

    socket.on("join-conversation", (conversationId) => {
        socket.join(conversationId);
    })


    socket.on("disconnect", () => {
        onlineUsers.delete(user._id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`socket disconnected: ${socket.id}`);

    });
});

export { io, app, server };