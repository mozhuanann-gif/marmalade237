
let peer = null;
let connections = [];
let onMessageReceived = null;
let onConnectionChanged = null;

export const initNetwork = (id, isHost, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (peer) {
    try { peer.destroy(); } catch(e) {}
  }

  // 核心修复：增加配置以减少对本地存储的依赖，并捕获初始化错误
  try {
    peer = new window.Peer(id, {
      debug: 1,
      config: {
        'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('open', (openedId) => {
      onConnectionChanged('READY', openedId);
    });

    peer.on('error', (err) => {
      console.error('PeerJS Error:', err.type);
      onConnectionChanged('ERROR', err.type);
      // 如果是因为存储被拦截，提示用户
      if (err.type === 'browser-incompatible') {
        alert('浏览器拦截了联机插件，请关闭“严格跟踪保护”或更换浏览器。');
      }
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
  } catch (error) {
    console.error('PeerJS Initialization Failed:', error);
    onConnectionChanged('ERROR', 'INIT_FAILED');
  }
};

export const connectToHost = (hostId, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (!peer) {
    try {
      peer = new window.Peer();
    } catch(e) {
      onConnectionChanged('ERROR', 'INIT_FAILED');
      return;
    }
  }

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
      try { conn.send(data); } catch(e) {}
    }
  });
};

export const sendToHost = (data) => {
  const hostConn = connections[0];
  if (hostConn && hostConn.open) {
    try { hostConn.send(data); } catch(e) {}
  }
};
