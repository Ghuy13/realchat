# RealChat

Ứng dụng chat realtime full-stack với **React + TypeScript** ở frontend và **Node.js + Express + Socket.IO + MongoDB** ở backend.

## Tính năng chính

- Đăng ký, đăng nhập, đăng xuất với JWT (access token) + refresh token (cookie httpOnly).
- Chat 1-1 realtime qua Socket.IO.
- Tạo cuộc trò chuyện nhóm và gửi tin nhắn nhóm.
- Gửi ảnh trong tin nhắn.
- Upload avatar người dùng lên Cloudinary.
- Quản lý bạn bè: gửi lời mời, chấp nhận/từ chối, danh sách bạn bè.
- Trạng thái online/offline và cập nhật unread/read.

## Công nghệ sử dụng

### Frontend (`/frontend`)

- React 19 + TypeScript
- Vite
- Zustand (state management)
- React Router
- Tailwind CSS
- Axios
- socket.io-client

### Backend (`/backend`)

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT + bcrypt
- Cookie Parser + CORS
- Multer + Cloudinary

## Cấu trúc thư mục

```text
realchat/
├─ frontend/     # Ứng dụng React
└─ backend/      # REST API + Socket server
```

## Yêu cầu môi trường

- Node.js 18+
- npm 9+
- MongoDB (local hoặc cloud)
- Tài khoản Cloudinary

## Thiết lập môi trường

### 1) Backend `.env`

Tạo file `backend/.env`:

```env
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_CONNECTIONSTRING=mongodb://127.0.0.1:27017/realchat
ACCESS_TOKEN_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2) Frontend `.env`

Tạo file `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

## Cài đặt và chạy dự án

Mở 2 terminal riêng biệt.

### Terminal 1: chạy backend

```bash
cd backend
npm install
npm run dev
```

Backend mặc định chạy tại `http://localhost:5001`.

### Terminal 2: chạy frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Scripts hữu ích

### Backend

- `npm run dev`: chạy với nodemon
- `npm start`: chạy production mode

### Frontend

- `npm run dev`: chạy Vite dev server
- `npm run build`: build production
- `npm run preview`: preview bản build
- `npm run lint`: chạy ESLint

## API chính (tóm tắt)

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/signout`
- `POST /api/auth/refresh`

### User

- `GET /api/users/me`
- `GET /api/users/search`
- `POST /api/users/uploadAvatar`

### Friend

- `POST /api/friends/requests`
- `POST /api/friends/requests/:requestId/accept`
- `POST /api/friends/requests/:requestId/decline`
- `GET /api/friends`
- `GET /api/friends/requests`

### Conversation & Message

- `POST /api/conversations`
- `GET /api/conversations`
- `GET /api/conversations/:conversationId/messages`
- `PATCH /api/conversations/:conversationId/seen`
- `POST /api/messages/direct`
- `POST /api/messages/group`

## Realtime events (Socket.IO)

- Server : `online-users`, `new-message`, `read-message`, `new-group`
- Client : `join-conversation`

## Ghi chú triển khai

- Cấu hình CORS cho backend phải khớp `CLIENT_URL`.
- Cookie refresh token được set `httpOnly` + `secure` + `sameSite: none`, phù hợp khi frontend/backend tách domain qua HTTPS.
- Khi deploy, cập nhật đầy đủ biến môi trường cho cả frontend và backend.

Nếu bạn muốn, mình có thể viết thêm phần **Docker Compose** để chạy MongoDB + backend + frontend bằng một lệnh.
