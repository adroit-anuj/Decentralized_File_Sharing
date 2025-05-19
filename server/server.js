const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Function to generate a random room ID between 8 and 15 characters
const generateShortRoomId = () => {
  const chars = 'AEJZQ2357';
  const length = Math.floor(Math.random()) + 6;
  let roomId = '';
  for (let i = 0; i < length; i++) {
    roomId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return roomId;
};

// List of 50 game-inspired names (3-6 letters each)
const gameNames = [
  'Ninja', 'Blaze', 'Ghost', 'Raven', 'Storm', 'Frost', 'Viper', 'Hawk', 'Titan', 'Shade',
  'Wolf', 'Drift', 'Spike', 'Flare', 'Chaos', 'Mystic', 'Rogue', 'Blade', 'Echo', 'Gloom',
  'Fury', 'Scout', 'Bolt', 'Crush', 'Grip', 'Spark', 'Dash', 'Fang', 'Sly', 'Zest',
  'Rift', 'Gaze', 'Flux', 'Haze', 'Kite', 'Lark', 'Myth', 'Nova', 'Prowl', 'Quest',
  'Rush', 'Snipe', 'Thorn', 'Vex', 'Wisp', 'Xenon', 'Yeti', 'Zap', 'Dusk', 'Cobra'
];

// Function to generate a unique user name by combining two different names
const generateUserName = (assignedNames) => {
  let userName;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    const name1 = gameNames[Math.floor(Math.random() * gameNames.length)];
    let name2;
    do {
      name2 = gameNames[Math.floor(Math.random() * gameNames.length)];
    } while (name2 === name1);

    userName = `${name1}${name2}`;
    attempts += 1;

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate a unique user name. Too many users.');
    }
  } while (assignedNames.has(userName));

  return userName;
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://adroit-anuj.github.io',
    methods: ['GET', 'POST'],
  },
});

const roomSizes = {};
const userNames = new Map();
const assignedNames = new Set();

io.on('connection', (socket) => {
  const userName = generateUserName(assignedNames);
  userNames.set(socket.id, userName);
  assignedNames.add(userName);
  console.log(`Assigned ${userName} to socket ${socket.id}`);

  socket.emit('userNameAssigned', userName);

  socket.on('createRoom', (maxSize) => {
    console.log('Received createRoom event with maxSize:', maxSize, 'at:', new Date().toISOString());
    let roomId;
    const activeRooms = io.sockets.adapter.rooms;
    do {
      roomId = generateShortRoomId();
    } while (activeRooms.has(roomId));

    console.log('Generated roomId:', roomId);
    roomSizes[roomId] = maxSize;
    socket.emit('roomCreated', roomId);
  });

  socket.on('joinRoom', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const currentSize = room ? room.size : 0;
    const maxSize = roomSizes[roomId] || Infinity;

    if (currentSize >= maxSize) {
      socket.emit('error', 'Room full');
      return;
    }

    socket.join(roomId);
    const peerIds = Array.from(io.sockets.sockets.keys()).filter(id => io.sockets.sockets.get(id).rooms.has(roomId));
    const peersWithNames = peerIds.map(id => ({ id, name: userNames.get(id) }));
    socket.emit('usersInRoom', peersWithNames);
    socket.to(roomId).emit('newUserJoined', { id: socket.id, name: userNames.get(socket.id) });
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', { peerId: socket.id, roomId });
  });

  socket.on('signal', ({ targetId, signal }) => {
    io.to(targetId).emit('signal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
    rooms.forEach(roomId => {
      socket.to(roomId).emit('userLeft', { peerId: socket.id, roomId });
    });
    const userName = userNames.get(socket.id);
    userNames.delete(socket.id);
    assignedNames.delete(userName);
  });
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Socket.io server running on port ${port}`);
});
