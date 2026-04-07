# 🌠 Cosmos: Real-Time Proximity Platform

Cosmos is a **2D real-time virtual environment** where users interact through avatars and communicate based on spatial proximity, creating a game-like social experience.

---

## 🚀 Features

- 🎮 **Real-Time Avatars** – Smooth 60fps movement using PixiJS (WebGL)
- 📍 **Proximity-Based Chat** – Messages visible only within a defined radius
- 💾 **Persistent World** – User positions and chat history stored in MongoDB
- ⚡ **Real-Time Sync** – Low-latency communication via Socket.io
- 🎨 **Custom Avatars** – Choose name and avatar color
- 📊 **Dynamic UI** – Activity feed and recent conversations

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- PixiJS
- Tailwind CSS

**Backend**
- Node.js
- Express
- Socket.io

**Database**
- MongoDB

---

## 🧠 How It Works

- The server calculates **Euclidean distance** between users to determine proximity  
- Users within a set radius can **communicate in real-time**  
- Socket.io manages **bi-directional event-based communication**  
- MongoDB persists **user state, messages, and activity logs**  

---

## ⚙️ Setup & Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd cosmos

2. Install Dependencies

Server

cd server
npm install

Client

cd client
npm install
3. Environment Setup

Create a .env file in the server/ directory:

PORT=3002
MONGO_URI=mongodb://127.0.0.1:27017/virtual-cosmos
▶️ Run the Application

Start Backend

cd server
npm run dev

Start Frontend

cd client
npm run dev

Visit: http://localhost:5173