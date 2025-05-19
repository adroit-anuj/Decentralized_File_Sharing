import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = ({ socket }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on('newUserJoined', (peerId) => {
      addNotification(`User-${peerId.slice(0, 4)} joined the room`);
    });
    socket.on('userLeft', (peerId) => {
      addNotification(`User-${peerId.slice(0, 4)} left the room`);
    });

    return () => {
      socket.off('newUserJoined');
      socket.off('userLeft');
    };
  }, [socket]);

  const addNotification = (message) => {
    setNotifications((prev) => [...prev, { id: Date.now(), message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  };

  return (
    <div className="position-fixed top-4 end-4">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="alert alert-primary p-2 mb-2"
          >
            {notif.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
