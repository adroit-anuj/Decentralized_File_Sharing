const PeerList = ({ peers, onSendFile, userNames }) => {
  return (
    <div className="peer-list mt-4">
      <h3>Connected Peers</h3>
      <ul className="list-group">
        {peers.map((peerId) => (
          <li key={peerId} className="list-group-item d-flex justify-content-between align-items-center">
            {userNames[peerId] || 'Unknown'}
            <button
              className="btn btn-success btn-sm"
              onClick={() => onSendFile(peerId)}
            >
              Send File
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PeerList;