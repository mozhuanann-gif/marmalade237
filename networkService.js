
let peer = null;
let connections = [];
let onMessageReceived = null;
let onConnectionChanged = null;

// 生成一个随机短 ID 作为备用
const generateId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

export const initNetwork = (id, isHost, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  if (peer) {
    try { peer.destroy(); } catch(e) {}
  }

  onConnectionChanged('CONNECTING', '正在初始化...');

  try {
    // 强制配置：不使用本地存储持久化 ID，防止被跟踪保护拦截
    peer = new window.Peer(id, {
      debug: 2,
      config: {
        'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('open', (openedId) => {
      onConnectionChanged('READY', openedId);
    });

    peer.on('error', (err) => {
      console.error('PeerJS Error:', err.type, err);
      // 如果 ID 冲突，尝试加后缀重试
      if (err.type === 'id-taken') {
        initNetwork(id + '-' + generateId(), isHost, callbacks);
      } else if (err.type === 'browser-incompatible' || err.type === 'unavailable-id') {
        onConnectionChanged('ERROR', '插件受阻');
      } else {
        onConnectionChanged('ERROR', err.type);
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
    onConnectionChanged('ERROR', 'INIT_FAILED');
  }
};

export const connectToHost = (hostId, callbacks) => {
  onMessageReceived = callbacks.onMessage;
  onConnectionChanged = callbacks.onStatusChange;

  onConnectionChanged('CONNECTING', hostId);

  // 客户端使用随机 ID 初始化 Peer，减少拦截概率
  if (!peer) {
    peer = new window.Peer();
  }

  peer.on('open', () => {
    const conn = peer.connect(hostId, {
      reliable: true
    });
    
    conn.on('open', () => {
      connections = [conn];
      onConnectionChanged('CONNECTED_TO_HOST', hostId);
    });
    
    conn.on('data', (data) => onMessageReceived(data, conn));
    
    conn.on('close', () => {
      onConnectionChanged('OFFLINE');
      connections = [];
    });

    conn.on('error', (err) => {
      onConnectionChanged('ERROR', '连接失败');
    });
  });

  peer.on('error', (err) => {
    onConnectionChanged('ERROR', '初始化失败');
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
