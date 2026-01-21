# 🚀 DevLink — A Developer Blogging & Real-Time Chat Platform

DevLink is a **full-stack web application** built for developers to **write blogs, share ideas, discover other developers, and communicate in real time**.

The project focuses on **clean backend architecture, secure authentication, and real-time systems**.

---

## ✨ Key Features

### 🔐 Authentication & Security
- Email & password authentication
- OTP-based email verification
- JWT authentication stored in **HTTP-only cookies**
- Secure logout with cookie invalidation
- Role-based access control
- Proper CORS configuration for cross-origin cookies

---

### 📝 Blogging Platform
- Create, update, and delete posts
- Draft & publish workflow (`published = false / true`)
- Archive section for unpublished posts
- Slug-based post routing
- View count tracking
- Tag-based post search
- Pagination-ready APIs

---

### 👤 Users & Discovery
- Public user profile pages
- Username-based user search
- Only published posts visible to the public
- Private drafts visible only to the author

---

### 💬 Real-Time Chat System
- One-to-one chat with **request & accept flow**
- Chat requests must be accepted before messaging
- Secure room-based authorization
- Real-time messaging using **WebSockets**
- Persistent chat history stored in MongoDB
- Seen/read timestamps for messages

---

## 🛠 Tech Stack

### Backend
- **Go (Golang)**
- **Gin** — HTTP web framework
- **MongoDB Atlas** — Database
- **JWT** — Authentication
- **Gorilla WebSocket** — Real-time communication
- **bcrypt** — Password hashing

### Frontend (Upcoming)
- **Next.js**
- **Tailwind CSS**
- **WebSocket client**
- **Cookie-based authentication**

---

## 📁 Project Structure

```txt
devLink-backend/
├── controllers/
│   ├── auth.controller.go
│   ├── post.controller.go
│   ├── user.controller.go
│   ├── chat.controller.go
│   └── ws.controller.go
│
├── routes/
│   ├── auth.routes.go
│   ├── public.routes.go
│   ├── protected.routes.go
│   └── ws.routes.go
│
├── models/
│   ├── user.go
│   ├── post.go
│   ├── chat.go
│   └── message.go
│
├── database/
│   └── database_connection.go
│
├── middleware/
│   └── auth.middleware.go
│
├── utils/
│   └── jwt.go
│
├── main.go
└── go.mod
