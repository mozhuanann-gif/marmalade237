
// 使用闭包变量存储当前活动的回调
let _activePeer = null;
let _activeConnections = [];
let _onDataCallback = null;
let _onStatusCallback = null;

const generateId = () => 'SESSION-' + Math.random().toString(36).substr(2, 9).toUpperCase();

export const initNetwork = (id, isHost, callbacks) => {
  _onDataCallback = callbacks.onMessage;
  _onStatusCallback = callbacks.onStatusChange;

  if (_activePeer) {
    try { _activePeer.destroy(); } catch(e) {}
  }

  if (_onStatusCallback) _onStatusCallback('CONNECTING', '正在初始化...');

  try {
    const peerId = isHost ? id : generateId();
    _activePeer = new window.Peer(peerId, {
      debug: 1,
      config: {
        'iceServers': [
          { 'urls': 'stun:stun.l.google.com:19302' },
          { 'urls': 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    _activePeer.on('open', (openedId) => {
      if (_onStatusCallback) _onStatusCallback('READY', openedId);
    });

    _activePeer.on('error', (err) => {
      console.error('Peer Error:', err.type);
      if (_onStatusCallback) {
        if (err.type === 'browser-incompatible') _onStatusCallback('ERROR', '存储受阻');
        else if (err.type === 'id-taken' && isHost) initNetwork(id + '-' + Math.floor(Math.random()*100), true, callbacks);
        else _onStatusCallback('ERROR', err.type);
      }
    });

    if (isHost) {
      _activePeer.on('connection', (conn) => {
        conn.on('open', () => {
          _activeConnections.push(conn);
          if (_onStatusCallback) _onStatusCallback('PLAYER_JOINED', conn.peer);
        });
        conn.on('data', (data) => _onDataCallback && _onDataCallback(data, conn));
        conn.on('close', () => {
          _activeConnections = _activeConnections.filter(c => c !== conn);
          if (_onStatusCallback) _onStatusCallback('PLAYER_LEFT', conn.peer);
        });
      });
    }
  } catch (error) {
    if (_onStatusCallback) _onStatusCallback('ERROR', 'FATAL');
  }
};

export const connectToHost = (hostId, callbacks) => {
  // 保存回调引用
  _onDataCallback = callbacks.onMessage;
  _onStatusCallback = callbacks.onStatusChange;

  const performPeerConnect = (targetId) => {
    if (_onStatusCallback) _onStatusCallback('CONNECTING', targetId);
    
    const conn = _activePeer.connect(targetId, { reliable: true });
    
    const timeout = setTimeout(() => {
      if (!conn.open && _onStatusCallback) {
        _onStatusCallback('ERROR', '连接超时');
        conn.close();
      }
    }, 15000);

    conn.on('open', () => {
      clearTimeout(timeout);
      _activeConnections = [conn];
      if (_onStatusCallback) _onStatusCallback('CONNECTED_TO_HOST', targetId);
    });
    
    conn.on('data', (data) => _onDataCallback && _onDataCallback(data, conn));
    conn.on('close', () => {
      if (_onStatusCallback) _onStatusCallback('OFFLINE');
      _activeConnections = [];
    });
    conn.on('error', () => {
       if (_onStatusCallback) _onStatusCallback('ERROR', '连接异常');
    });
  };

  // 如果 Peer 未就绪，先初始化
  if (!_activePeer || _activePeer.destroyed) {
    initNetwork(null, false, {
      onMessage: _onDataCallback,
      onStatusChange: (status, detail) => {
        if (status === 'READY') {
          performPeerConnect(hostId);
        } else {
          // 这里不再自调用，而是直接调用传入的原始回调
          callbacks.onStatusChange(status, detail);
        }
      }
    });
  } else {
    performPeerConnect(hostId);
  }
};

export const broadcast = (data) => {
  _activeConnections.forEach(conn => {
    if (conn && conn.open) {
      try { conn.send(data); } catch(e) {}
    }
  });
};

export const sendToHost = (data) => {
  const hostConn = _activeConnections[0];
  if (hostConn && hostConn.open) {
    try { hostConn.send(data); } catch(e) {}
  }
};
