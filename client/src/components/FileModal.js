import React from 'react';
import { motion } from 'framer-motion';

const FileModal = ({ file, onAccept, onReject }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">File Request</h5>
          </div>
          <div className="modal-body">
            <p>Do you accept this file?</p>
            <p>File: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
          </div>
          <div className="modal-footer">
            <button
              onClick={onAccept}
              className="btn btn-success"
            >
              Accept
            </button>
            <button
              onClick={onReject}
              className="btn btn-danger"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileModal;
