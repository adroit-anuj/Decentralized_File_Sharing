# ShareMesh  
### https://adroit-anuj.github.io/Decentralized_File_Sharing/

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)


**ShareMesh** is a fully decentralized file sharing and real-time chat application built using WebRTC, Socket.IO, and React. It enables secure, direct peer-to-peer (P2P) communication without any central server for data transfer.

> 📁 Repository: `Decentralized_File_Sharing`  
> 🚀 App Name: **ShareMesh**

---

## 🔍 What Makes It Unique

### 1. Pure P2P Architecture  
No middle servers for transferring files or messages. All communication is browser-to-browser using WebRTC.

### 2. End-to-End File Encryption  
Files are encrypted using AES (via CryptoJS) before being sent, ensuring only the receiver can decrypt and access them.

### 3. Room-Based Access with Capacity Limits  
Rooms can be created with custom 8–15 character IDs and limited to 2, 5, or 10 users. This helps maintain speed and privacy in small groups.

### 4. Real-Time Chat + File Transfer  
Live messaging system synced across peers, alongside encrypted file sending — all happening simultaneously and seamlessly.

### 5. Clean UI & UX  
Interface is intentionally kept simple and fast, keeping distractions out of the way so users can just focus on sharing and talking.

---

## 🧩 Tech Stack

### Frontend  
- React  
- Socket.IO Client  
- CryptoJS (AES encryption)

### Backend  

- Node.js  
- Socket.IO

---

## 🚀 Getting Started

### Prerequisites  
- Node.js (v16 or above)  
- npm  
- Any modern browser (tested on Chrome & Firefox)

### Clone the Repository  
```bash
git clone https://github.com/adroit-anuj/Decentralized_File_Sharing.git
cd Decentralized_File_Sharing
```

### Start the Backend Server  
```bash
cd server
npm install
node server.js
```
This will start the backend on `http://localhost:5000`.

### Start the Frontend  
```bash
cd ../client
npm install
npm start
```
This opens the app at `http://localhost:3000`.

---

## ⚙️ How to Use

### ✅ Create or Join a Room  
- To **create**, enter a unique Room ID and select a capacity limit (2 / 5 / 10).  
- To **join**, enter an existing Room ID that isn’t full.

### 📂 Send Files  
- Select a file from your system.  
- Choose the peer you want to send it to.  
- Encrypted file will be sent directly and downloaded automatically on the recipient’s end.

### 💬 Real-Time Chat  
- Type and send messages instantly across the room.  
- Messages appear in real-time to all connected peers.

### 🚪 Leave Room  
- Hit the "Exit" button anytime.  
- Others in the room are notified when someone leaves.

---

## ☁️ Deployment

### Backend on Render  
- Push the `/server` folder to a GitHub repo.  
- Deploy it as a Web Service on [Render](https://render.com).  
- Update the server URL in frontend (`Room.js`) to your Render backend URL.

### Frontend on GitHub Pages  
- Update the `homepage` field in `client/package.json`:
  ```json
  "homepage": "https://your-username.github.io/Decentralized_File_Sharing"
  ```
- Then deploy:
  ```bash
  cd client
  npm run deploy
  ```

---

## 🤝 Contributing

You're welcome to help improve this project:
- Fork the repo  
- Create a new branch:  
  ```bash
  git checkout -b feature/your-feature
  ```
- Make changes and push:  
  ```bash
  git commit -m "Added cool feature"
  git push origin feature/your-feature
  ```
- Open a Pull Request 🚀

---

## 🐛 Issues

Found a bug or got an idea? Create a new issue [here](https://github.com/adroit-anuj/Decentralized_File_Sharing/issues).

---

## 📜 License

This project is licensed under the **MIT License**. See the [`LICENSE`](LICENSE) file for full details.<br><br>
[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)

---

**ShareMesh** — A decentralized way to share files and messages, peer-to-peer, encrypted, and instant.
