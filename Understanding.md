# Understanding and Working of ShareMesh

## What Is Happening in This Project?

**ShareMesh** is a web application that allows people to share files and chat with each other directly, without depending on a central server to store or forward data.

Imagine you want to send a photo or message to your friend — instead of uploading it to a cloud service, ShareMesh lets you send it directly to your friend’s browser. It’s like handing over a note directly, but online.

### Simple Flow of the App:

1. **Create or Join a Room**  
   You either create a new room or join an existing one using a Room ID. This room acts like a private space between you and your friend.

2. **Connect Directly Using WebRTC**  
   Once you're both in the room, your browsers connect directly using WebRTC — a technology that allows peer-to-peer communication. No files are uploaded to any server.

3. **Send Files or Chat Messages**  
   You can now send files or messages. Everything you send goes straight to your friend’s browser through the WebRTC connection.

4. **Encryption Ensures Privacy**  
   Files are encrypted using AES (with CryptoJS) before being sent. Only the receiver can decrypt and access them.

## How a Message Travels from A to B

Let’s say you type a message: “Hey, let’s share a photo!”

1. **You type and hit Send**  
   The frontend captures your message and prepares it for sending.

2. **WebRTC handles the connection**  
   A direct link is already set up between you and your friend through WebRTC.

3. **The message is sent directly**  
   It goes from your browser to theirs — without touching any external server.

4. **The receiver gets it instantly**  
   The message appears in your friend's chat window. If it were a file, they would receive it in encrypted chunks, which are then reassembled and decrypted.


## Connecting with Core Networking Concepts from the Syllabus

This project demonstrates real-world applications of core networking ideas covered in your Computer Networks syllabus. Here’s how:

### 1. Peer-to-Peer Communication (P2P)  
**Definition**: In a P2P model, each device (called a peer) acts as both a client and a server. It enables direct communication between participants without relying on a centralized server.

### 2. WebRTC (Real-Time Browser Communication)  
**Definition**: WebRTC is a protocol supported by modern browsers that allows real-time, peer-to-peer communication of data, audio, or video using a secure and efficient channel.

### 3. Socket.IO and Signaling (Application Layer Protocol Concept)  
**Definition**: Signaling is the exchange of connection-related information (like session metadata) that allows two peers to establish a WebRTC connection. Socket.IO helps in this initial setup phase.

### 4. IP Address and Port Communication  
**Definition**: Every device in a network is identified by an IP address, and each application communicates via specific port numbers. These allow precise routing of data between applications.

### 5. Encryption (Network and Message Security)  
**Definition**: Encryption secures communication by converting data into an unreadable form for unauthorized users. Only someone with the correct key can decrypt and read the message.

### 6. NAT Traversal and STUN/TURN Servers (Related to NAT and Mobile IP)  
**Definition**: NAT hides private IP addresses behind a single public IP. WebRTC uses STUN and TURN servers to allow peers behind NATs to discover each other and communicate directly.

---

### How These Concepts Work Together – A Story

Imagine you are a file named `Resume.pdf`, ready to travel from Sender A to Receiver B using ShareMesh. Before setting out, you are encrypted using AES, ensuring that only the intended receiver can read you — a key aspect of security from the **Application Layer**. Now, before your actual journey begins, Sender A and Receiver B use **Socket.IO** to communicate connection-related metadata like session offers and ICE candidates. This signaling process occurs over HTTP, showcasing the **Application Layer** in action as it helps set up the communication rules. Once the signaling is complete, WebRTC steps in to find the most efficient path between A and B. However, both users are likely behind NATs (private networks), so **STUN servers** help them discover their public-facing IP addresses, enabling **NAT traversal** — a concept rooted in the **Network Layer**. Once a viable route is established, you begin your journey through a **WebRTC peer-to-peer connection**, bypassing central servers entirely. This transport relies on protocols like **UDP**, highlighting the role of the **Transport Layer** which ensures timely (though not always guaranteed) delivery. Your trip flows through various routers and network nodes using the IP addressing scheme and port numbers, representing decisions made at the **Network Layer** and **Transport Layer**. Internally, your data is encapsulated in packets and frames — starting from the **Application Layer**, down through **Transport**, **Network**, and **Data Link Layers** — before being sent as signals over the **Physical Layer**. Finally, when you arrive at Receiver B, you are decrypted back into your original readable form — and just like that, the file reaches its destination securely, privately, and directly. This entire journey reflects a layered network architecture, where each layer—from application to physical—plays a critical role in making peer-to-peer file sharing seamless and robust within ShareMesh.

