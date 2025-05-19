import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import CryptoJS from 'crypto-js';
import FileModal from './components/FileModal';
import Button from './components/Button';
import PeerList from './components/PeerList';
import ProgressBar from './components/ProgressBar';
import ChatBox from './components/ChatBox';
import Notifications from './components/Notifications';

const socket = io('https://sharemesh.onrender.com', { transports: ['websocket'] });

// Simple MIME type mapping based on extension
const getMimeType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'txt': 'text/plain',
    'tex': 'text/plain',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeTypes[extension] || 'application/octet-stream';
};

const Room = () => {
  const [roomId, setRoomId] = useState('');
  const [peers, setPeers] = useState({});
  const [connectedPeerIds, setConnectedPeerIds] = useState([]);
  const [file, setFile] = useState(null);
  const [receivedFiles, setReceivedFiles] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [fileChunks, setFileChunks] = useState({});
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [acceptedFiles, setAcceptedFiles] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [maxRoomSize, setMaxRoomSize] = useState(2);
  const [notification, setNotification] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const acceptedFilesRef = useRef(acceptedFiles);
  const fileInputRef = useRef(null);
  const encryptionKeys = useRef({});
  const pendingFiles = useRef({});

  useEffect(() => {
    acceptedFilesRef.current = acceptedFiles;
  }, [acceptedFiles]);

  const handleData = useCallback(
    (peerId) => (data) => {
      console.log(`Received raw data from ${peerId}:`, data);
      const receivedData = new TextDecoder().decode(data);
      try {
        const parsed = JSON.parse(receivedData);
        console.log(`Parsed data from ${peerId}:`, parsed);
        console.log(`Current acceptedFiles:`, acceptedFilesRef.current);

        if (parsed.type === 'file-meta') {
          console.log(`Showing modal for file from ${peerId}:`, parsed);
          encryptionKeys.current[peerId] = parsed.key;
          setReceivedFiles((prev) => ({
            ...prev,
            [peerId]: { name: parsed.name, size: parsed.size },
          }));
          setFileName(parsed.name);
          setShowModal(peerId);
          setProgress((prev) => ({ ...prev, [peerId]: 0 }));
        } else if (parsed.type === 'file-chunk' && acceptedFilesRef.current.includes(peerId)) {
          console.log(`Processing chunk from ${peerId}`);
          const decrypted = CryptoJS.AES.decrypt(
            parsed.data,
            encryptionKeys.current[peerId]
          ).toString(CryptoJS.enc.Latin1);
          const chunk = new Uint8Array(
            atob(decrypted)
              .split('')
              .map((c) => c.charCodeAt(0))
          );
          setFileChunks((prev) => ({
            ...prev,
            [peerId]: [...(prev[peerId] || []), chunk],
          }));
          setProgress((prev) => {
            const fileSize = receivedFiles[peerId]?.size || 1;
            const newProgress = Math.min(
              ((prev[peerId] || 0) + chunk.length) / fileSize * 100,
              100
            );
            return { ...prev, [peerId]: newProgress };
          });
        } else if (parsed.type === 'file-end' && acceptedFilesRef.current.includes(peerId)) {
          console.log(`Received file-end from ${peerId}`);
          const chunks = fileChunks[peerId] || [];
          const mimeType = getMimeType(fileName);
          console.log(`Creating Blob with MIME type: ${mimeType}`);
          const blob = new Blob(chunks, { type: mimeType });
          console.log(`Blob created for ${fileName}, size: ${blob.size}`);
          console.log(`Triggering download for ${fileName}`);
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setAcceptedFiles((prev) => prev.filter((id) => id !== peerId));
          setFileChunks((prev) => {
            const newChunks = { ...prev };
            delete newChunks[peerId];
            return newChunks;
          });
          setProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[peerId];
            return newProgress;
          });
        } else if (parsed.type === 'chat') {
          console.log(`Received chat from ${peerId}:`, parsed.message);
          setChatMessages((prev) => [
            ...prev,
            { peerId, message: parsed.message, timestamp: Date.now() },
          ]);
        } else if (parsed.type === 'accept') {
          console.log(`Received accept from ${peerId}`);
          if (pendingFiles.current[peerId]) {
            const { file: pendingFile, sendChunks } = pendingFiles.current[peerId];
            console.log(`Resuming file send to ${peerId} for ${pendingFile.name}`);
            sendChunks();
            delete pendingFiles.current[peerId];
          }
        }
      } catch (e) {
        console.error('Data parsing error:', e);
      }
    },
    [fileChunks, fileName, receivedFiles]
  );

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsSocketConnected(true);
    });

    socket.on('userNameAssigned', (userName) => {
      console.log(`Received user name: ${userName} for socket ${socket.id}`);
      setUserNames((prev) => ({
        ...prev,
        [socket.id]: userName,
      }));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsSocketConnected(false);
      // Reset room state on disconnect
      setCurrentRoom(null);
      setRoomId('');
      setPeers({});
      setConnectedPeerIds([]);
      setChatMessages([]);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsSocketConnected(false);
      setNotification('Failed to connect to server. Please try again.');
      setTimeout(() => setNotification(null), 5000);
    });

    socket.on('usersInRoom', (peersWithNames) => {
      const newPeers = {};
      setUserNames((prev) => {
        const updated = { ...prev };
        peersWithNames.forEach(({ id, name }) => {
          if (id !== socket.id) {
            updated[id] = name;
          }
        });
        return updated;
      });

      peersWithNames.forEach(({ id: peerId }) => {
        if (!peers[peerId] && peerId !== socket.id) {
          const peer = new Peer({ initiator: true, trickle: false });
          peer.on('signal', (signal) => {
            socket.emit('signal', { targetId: peerId, signal });
          });
          peer.on('connect', () => {
            console.log(`Data channel open with ${peerId}`);
            setConnectedPeerIds((prev) => [...new Set([...prev, peerId])]);
          });
          peer.on('data', handleData(peerId));
          peer.on('error', (err) => console.error(`Peer ${peerId} error:`, err));
          newPeers[peerId] = peer;
        }
      });
      setPeers((prev) => ({ ...prev, ...newPeers }));
    });

    socket.on('newUserJoined', ({ id: peerId, name }) => {
      if (!peers[peerId] && peerId !== socket.id) {
        setUserNames((prev) => ({
          ...prev,
          [peerId]: name,
        }));
        const peer = new Peer({ initiator: false, trickle: false });
        peer.on('signal', (signal) => {
          socket.emit('signal', { targetId: peerId, signal });
        });
        peer.on('connect', () => {
          console.log(`Data channel open with ${peerId}`);
          setConnectedPeerIds((prev) => [...new Set([...prev, peerId])]);
        });
        peer.on('data', handleData(peerId));
        peer.on('error', (err) => console.error(`Peer ${peerId} error:`, err));
        setPeers((prev) => ({ ...prev, [peerId]: peer }));
      }
    });

    socket.on('signal', ({ from, signal }) => {
      if (peers[from]) {
        peers[from].signal(signal);
      } else {
        const peer = new Peer({ initiator: false, trickle: false });
        peer.on('signal', (signal) => {
          socket.emit('signal', { targetId: from, signal });
        });
        peer.on('connect', () => {
          console.log(`Data channel open with ${from}`);
          setConnectedPeerIds((prev) => [...new Set([...prev, from])]);
        });
        peer.on('data', handleData(from));
        peer.signal(signal);
        setPeers((prev) => ({ ...prev, [from]: peer }));
      }
    });

    socket.on('userLeft', ({ peerId, roomId: leftRoomId }) => {
      if (peers[peerId]) {
        peers[peerId].destroy();
        setPeers((prev) => {
          const newPeers = { ...prev };
          delete newPeers[peerId];
          return newPeers;
        });
        setConnectedPeerIds((prev) => prev.filter((id) => id !== peerId));

        if (leftRoomId === currentRoom) {
          const userName = userNames[peerId] || 'Unknown';
          setNotification(`${userName} has left the room`);
          setTimeout(() => setNotification(null), 5000);
        }
      }
    });

    socket.on('roomCreated', (newRoomId) => {
      console.log(`Room created with ID: ${newRoomId}`);
      setRoomId(newRoomId);
      setShowCreateRoomModal(false);
      socket.emit('joinRoom', newRoomId);
    });

    socket.on('error', (message) => {
      setNotification(message);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.off('connect');
      socket.off('userNameAssigned');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('usersInRoom');
      socket.off('newUserJoined');
      socket.off('signal');
      socket.off('userLeft');
      socket.off('roomCreated');
      socket.off('error');
    };
  }, [peers, userNames, currentRoom]);

  const joinRoom = () => {
    if (roomId.trim()) {
      setCurrentRoom(roomId);
      socket.emit('joinRoom', roomId);
    }
  };

  const handleCreateRoom = () => {
    console.log('OK button clicked at:', new Date().toISOString());
    console.log('Current socket connection status:', socket.connected);
    if (!socket.connected) {
      setNotification('Not connected to server. Please wait and try again.');
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    socket.emit('createRoom', maxRoomSize);

    const timeout = setTimeout(() => {
      setNotification('Server did not respond. Please try again.');
      setTimeout(() => setNotification(null), 5000);
      setShowCreateRoomModal(false);
    }, 5000);

    socket.once('roomCreated', () => {
      clearTimeout(timeout);
    });
  };

  const handleExitRoom = () => {
    if (currentRoom) {
      // Emit leaveRoom event to the server
      socket.emit('leaveRoom', currentRoom);
      // Reset room-related state
      setCurrentRoom(null);
      setRoomId('');
      setPeers({});
      setConnectedPeerIds([]);
      setChatMessages([]);
      setNotification('You have left the room');
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const sendFile = (targetPeerId) => {
    if (file && peers[targetPeerId] && peers[targetPeerId].connected) {
      const peer = peers[targetPeerId];
      console.log(`Starting file send to ${targetPeerId} for ${file.name}, size: ${file.size}`);
      const chunkSize = 16384;
      let offset = 0;
      const key = CryptoJS.lib.WordArray.random(32).toString();

      const sendMeta = () => {
        console.log(`Sending file-meta to ${targetPeerId}`);
        peer.send(JSON.stringify({ 
          type: 'file-meta', 
          name: file.name, 
          size: file.size, 
          key 
        }));
      };

      const readNextChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        const reader = new FileReader();
        reader.onload = () => {
          const chunk = reader.result;
          const encrypted = CryptoJS.AES.encrypt(
            btoa(String.fromCharCode(...new Uint8Array(chunk))),
            key
          ).toString();
          console.log(`Sending file-chunk to ${targetPeerId}, offset: ${offset}`);
          peer.send(JSON.stringify({ type: 'file-chunk', data: encrypted }));
          offset += chunkSize;
          if (offset < file.size) {
            readNextChunk();
          } else {
            console.log(`Sending file-end to ${targetPeerId}`);
            peer.send(JSON.stringify({ type: 'file-end', name: file.name }));
            setFile(null);
          }
        };
        reader.readAsArrayBuffer(slice);
      };

      sendMeta();
      pendingFiles.current[targetPeerId] = { file, sendChunks: readNextChunk };
    }
  };

  const sendChatMessage = (message) => {
    Object.values(peers).forEach((peer) => {
      if (peer.connected) {
        peer.send(JSON.stringify({ type: 'chat', message }));
      }
    });
    setChatMessages((prev) => [
      ...prev,
      { peerId: socket.id, message, timestamp: Date.now() },
    ]);
  };

  const handleAccept = (peerId) => {
    setAcceptedFiles((prev) => {
      const updated = [...new Set([...prev, peerId])];
      console.log(`Accepted files:`, updated);
      return updated;
    });
    setShowModal(null);
    const peer = peers[peerId];
    if (peer && peer.connected) {
      console.log(`Sending accept message to ${peerId}`);
      peer.send(JSON.stringify({ type: 'accept' }));
    }
  };

  const handleReject = (peerId) => {
    setShowModal(null);
    setReceivedFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[peerId];
      return newFiles;
    });
  };

  return (
    <div className="container py-4">
      {/* Notification in Top-Left Corner */}
      {notification && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: '#ffcccb',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          {notification}
        </div>
      )}

      <h1 className="display-4 mb-4"><b>ShareMesh</b></h1>
      <div className="d-flex mb-3">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room ID"
          className="form-control me-2"
        />
        <button onClick={joinRoom} className="btn btn-primary me-2">
          Join Room
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => setShowCreateRoomModal(true)}
          disabled={!isSocketConnected}
        >
          {isSocketConnected ? 'Create Room' : 'Connecting...'}
        </button>
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create a New Room</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateRoomModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="maxRoomSize" className="form-label">
                    Maximum Room Size
                  </label>
                  <select
                    id="maxRoomSize"
                    className="form-select"
                    value={maxRoomSize}
                    onChange={(e) => setMaxRoomSize(Number(e.target.value))}
                  >
                    <option value={2}>2 Users</option>
                    <option value={5}>5 Users</option>
                    <option value={10}>10 Users</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateRoomModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    console.log('OK button clicked in modal');
                    handleCreateRoom();
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="d-none"
      />
      <Button onClick={() => fileInputRef.current.click()} />
      <ChatBox 
        peers={peers} 
        chatMessages={chatMessages} 
        onSendMessage={sendChatMessage} 
        userNames={userNames}
      />
      {showModal && receivedFiles[showModal] && (
        <div>
          <FileModal
            file={receivedFiles[showModal]}
            onAccept={() => handleAccept(showModal)}
            onReject={() => handleReject(showModal)}
          />
          {progress[showModal] > 0 && <ProgressBar progress={progress[showModal]} />}
        </div>
      )}
      <PeerList peers={connectedPeerIds} onSendFile={sendFile} userNames={userNames} />
      <Notifications socket={socket} />

      {/* Exit Button in Bottom-Right Corner */}
      {currentRoom && (
        <button
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#dc3545', // Bootstrap red (btn-danger)
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 1000,
          }}
          onClick={handleExitRoom}
        >
          Exit
        </button>
      )}
    </div>
  );
};

export default Room;
