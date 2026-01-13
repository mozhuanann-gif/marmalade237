
let _activePeer = null;
let _activeConnections = [];
let _onDataCallback = null;
let _onStatusCallback = null;

const generateId = () => 'KOI-' + Math.random().toString(36).substr(2, 6).toUpperCase();

export const initNetwork = (id, isHost, callbacks) => {
  _onDataCallback = callbacks.onMessage;
  _onStatusCallback = callbacks.onStatusChange;

  if (_activePeer) {
    try { _activePeer.destroy(); } catch(e) {}
  }

  if (_onStatusCallback) _onStatusCallback('CONNECTING', '接入信令中...');

  try {
    const peerId = isHost ? id : generateId();
    
    // 显式指定配置，尽量规避部分存储拦截导致的问题
    _activePeer = new window.Peer(peerId, {
      debug: 1,
      config: {
        'iceServers': [
          { 'urls': 'stun:stun.l.google.com:19302' },
          { 'urls': 'stun:stun1.l.google.com:19302' },
          { 'urls': 'stun:stun2.l.google.com:19302' },
          { 'urls': 'stun:stun.anyfirewall.com:3478' }
        ]
      }
    });

    _activePeer.on('open', (openedId) => {
      console.log('Signal connected:', openedId);
      if (_onStatusCallback) _onStatusCallback('READY', openedId);
    });

    _activePeer.on('error', (err) => {
      console.error('PeerJS Error:', err.type);
      let msg = err.type;
      if (err.type === 'peer-unavailable') msg = '房号不存在';
      else if (err.type === 'network') msg = '网络连接超时';
      else if (err.type === 'browser-incompatible') msg = '浏览器安全限制';
      
      if (_onStatusCallback) _onStatusCallback('ERROR', msg);
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
    if (_onStatusCallback) _onStatusCallback('ERROR', '初始化故障');
  }
};

export const connectToHost = (hostId, callbacks) => {
  _onDataCallback = callbacks.onMessage;
  _onStatusCallback = callbacks.onStatusChange;

  const performConnect = (targetId) => {
    if (_onStatusCallback) _onStatusCallback('CONNECTING', `建立隧道: ${targetId}`);
    
    const conn = _activePeer.connect(targetId, { 
      reliable: true,
      serialization: 'json'
    });
    
    const timeout = setTimeout(() => {
      if (!conn.open) {
        if (_onStatusCallback) _onStatusCallback('ERROR', 'P2P 握手超时');
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
  };

  if (!_activePeer || _activePeer.destroyed) {
    initNetwork(null, false, {
      onMessage: _onDataCallback,
      onStatusChange: (s, d) => {
        if (s === 'READY') performConnect(hostId);
        else callbacks.onStatusChange(s, d);
      }
    });
  } else {
    performConnect(hostId);
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
