
let peer = null;
let connections = [];
let onMessageReceived = null;
let onConnectionChanged = null;

export const initNetwork = (id, isHost, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (peer) peer.destroy();

  // 使用默认的 PeerJS 公用服务器
  peer = new window.Peer(id, {
    debug: 1
  });

  peer.on('open', (openedId) => {
    onConnectionChanged('READY', openedId);
  });

  peer.on('error', (err) => {
    console.error('Peer Error:', err.type);
    onConnectionChanged('ERROR', err.type);
  });

  if (isHost) {
    peer.on('connection', (conn) => {
      conn.on('open', () => {
        connections.push(conn);
        onConnectionChanged('PLAYER_JOINED', conn.peer);
      });
      conn.on('data', (data) => onMessageReceived(data, conn));
      conn.on('close', () => {
        connections = connections.filter(c => c !== conn);
        onConnectionChanged('PLAYER_LEFT', conn.peer);
      });
    });
  }
};

export const connectToHost = (hostId, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (!peer) peer = new window.Peer();

  peer.on('open', () => {
    const conn = peer.connect(hostId);
    conn.on('open', () => {
      connections = [conn];
      onConnectionChanged('CONNECTED_TO_HOST', hostId);
    });
    conn.on('data', (data) => onMessageReceived(data, conn));
    conn.on('close', () => {
        onConnectionChanged('DISCONNECTED');
        connections = [];
    });
    conn.on('error', (err) => onConnectionChanged('ERROR', err));
  });
};

export const broadcast = (data) => {
  connections.forEach(conn => {
    if (conn && conn.open) {
      conn.send(data);
    }
  });
};

export const sendToHost = (data) => {
  const hostConn = connections[0];
  if (hostConn && hostConn.open) {
    hostConn.send(data);
  }
};
