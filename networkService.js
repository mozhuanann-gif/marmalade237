
let peer = null;
let connections = [];
let onMessageReceived = null;
let onConnectionChanged = null;

// 生成一个纯内存 ID，完全不访问 localStorage
const generateSessionId = () => 'SESSION-' + Math.random().toString(36).substr(2, 9).toUpperCase();

export const initNetwork = (id, isHost, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (peer) {
    try { peer.destroy(); } catch(e) {}
  }

  onConnectionChanged('CONNECTING', '初始化信令...');

  try {
    // 强制指定一个随机的客户端 ID，避免 PeerJS 尝试访问被拦截的存储
    const peerId = isHost ? id : generateSessionId();
    
    peer = new window.Peer(peerId, {
      debug: 1, // 降低调试级别减少干扰
      config: {
        'iceServers': [
          { 'urls': 'stun:stun.l.google.com:19302' },
          { 'urls': 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (openedId) => {
      onConnectionChanged('READY', openedId);
    });

    peer.on('error', (err) => {
      console.warn('Network Error:', err.type);
      if (err.type === 'browser-incompatible') {
        onConnectionChanged('ERROR', '存储被拦截');
      } else if (err.type === 'id-taken') {
        // 如果 ID 冲突，主机模式尝试加随机后缀
        if (isHost) initNetwork(id + '-' + Math.floor(Math.random()*100), isHost, callbacks);
      } else {
        onConnectionChanged('ERROR', err.type);
      }
    });

    if (isHost) {
      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connections.push(conn);
          // 关键改进：一旦连接打开，主机立即通知 UI，UI 随后会触发广播
          onConnectionChanged('PLAYER_JOINED', conn.peer);
          // 主机收到新连接后，App.js 会捕捉到 PLAYER_JOINED 状态并发送 SYNC_STATE
        });
        conn.on('data', (data) => onMessageReceived(data, conn));
        conn.on('close', () => {
          connections = connections.filter(c => c !== conn);
          onConnectionChanged('PLAYER_LEFT', conn.peer);
        });
      });
    }
  } catch (error) {
    onConnectionChanged('ERROR', 'FAILED');
  }
};

export const connectToHost = (hostId, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (!peer || peer.destroyed) {
    initNetwork(null, false, {
      onMessage: onMessageReceived,
      onStatusChange: (s, d) => {
        if (s === 'READY') {
          performConnection(hostId);
        } else {
          onConnectionChanged(s, d);
        }
      }
    });
  } else {
    performConnection(hostId);
  }
};

const performConnection = (hostId) => {
  onConnectionChanged('CONNECTING', hostId);
  const conn = peer.connect(hostId, { reliable: true });

  const timeout = setTimeout(() => {
    if (!conn.open) {
      onConnectionChanged('ERROR', '连接超时');
      conn.close();
    }
  }, 10000);

  conn.on('open', () => {
    clearTimeout(timeout);
    connections = [conn];
    onConnectionChanged('CONNECTED_TO_HOST', hostId);
  });
  
  conn.on('data', (data) => onMessageReceived(data, conn));
  conn.on('close', () => {
    onConnectionChanged('OFFLINE');
    connections = [];
  });
  conn.on('error', () => onConnectionChanged('ERROR', '连接断开'));
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
