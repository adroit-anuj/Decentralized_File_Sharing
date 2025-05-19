import React from 'react';

const ProgressBar = ({ progress }) => {
  return (
    <div className="progress mt-2">
      <div
        className="progress-bar bg-primary"
        role="progressbar"
        style={{ width: `${Math.min(progress, 100)}%` }}
        aria-valuenow={progress}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  );
};

export default ProgressBar;
