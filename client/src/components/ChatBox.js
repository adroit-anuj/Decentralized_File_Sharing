import { useState, useEffect, useRef } from 'react';

const ChatBox = ({ peers, chatMessages, onSendMessage, userNames }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const shortenUserName = (userName) => {
    if (!userName) return 'Unknown';
    return userName.replace('User-', 'U-');
  };

  return (
    <div className="chat-box mt-4">
      <h3>Chat</h3>
      <div className="messages" style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {chatMessages.map((msg, index) => (
          <div key={index}>
            <strong>{shortenUserName(userNames[msg.peerId])}</strong>: {msg.message} <small>({new Date(msg.timestamp).toLocaleTimeString()})</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-group mt-2">
        <input
          type="text"
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button className="btn btn-primary" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;