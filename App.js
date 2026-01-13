
import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import { loadState, saveState, deleteMessage } from './storageService.js';
import { rollDice, getSuccessLevel, generateCoCAttributes, parseDeck, getJrrp } from './diceService.js';
import * as network from './networkService.js';
import Login from './Login.js';
import HistoryPanel from './HistoryPanel.js';
import CommandInput from './CommandInput.js';
import AdminPanel from './AdminPanel.js';
import CharacterSheet from './CharacterSheet.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [user, setUser] = useState(null);
  const [appState, setAppState] = useState(loadState());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [netStatus, setNetStatus] = useState({ status: 'OFFLINE', roomId: '' });

  const handleNetworkData = useCallback((data, conn) => {
    if (data.type === 'SYNC_STATE') {
      setAppState(prev => ({ ...prev, ...data.payload }));
      saveState(data.payload);
    } else if (data.type === 'PLAYER_COMMAND') {
      handleCommand(data.payload.raw, data.payload.user);
    } else if (data.type === 'INIT_REQ' && user?.isKP) {
      network.broadcast({ type: 'SYNC_STATE', payload: appState });
    }
  }, [user, appState]);

  const handleCommand = useCallback((raw, executor = user) => {
    if (!executor) return;

    if (netStatus.status === 'CONNECTED_TO_HOST' && !executor.isKP) {
      network.sendToHost({ type: 'PLAYER_COMMAND', payload: { raw, user: executor } });
      return;
    }

    let input = raw.trim();
    if (input.startsWith('。')) input = '.' + input.slice(1);
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let content = '';
    let isHidden = false;

    if (cmd.startsWith('.r')) {
      isHidden = cmd.startsWith('.rh');
      let formula = (isHidden ? cmd.slice(3) : cmd.slice(2)) || args || '1d100';
      const roll = rollDice(formula);
      content = `🎲 ${executor.nickname} 掷出了 ${roll.detail} = ${roll.total}`;
    } else if (cmd === '.ra') {
      const match = args.match(/(.+?)\s+(\d+)/);
      if (match) {
        const roll = rollDice('1d100');
        const level = getSuccessLevel(roll.total, parseInt(match[2]));
        content = (appState.config.templates[level] || '{user} 判定 {name}: {roll}')
          .replace('{user}', executor.nickname).replace('{name}', match[1]).replace('{roll}', `${roll.total}/${match[2]}`);
      }
    } else if (cmd === '.jrrp') {
      content = appState.config.templates['jrrp'].replace('{user}', executor.nickname).replace('{roll}', getJrrp(executor.email));
    } else if (cmd === '.coc') {
        const attrs = generateCoCAttributes();
        const attrStr = Object.entries(attrs).filter(([k])=>k!=='SAN').map(([k,v])=>`${k}:${v}`).join(' ');
        content = appState.config.templates['coc_gen'].replace('{user}', executor.nickname).replace('{attributes}', attrStr);
        if (executor.email === user.email) {
           setUser(prev => ({...prev, attributes: attrs}));
        }
    } else {
      content = raw;
    }

    if (content) {
      const msg = { 
        id: Date.now().toString(), 
        userId: executor.email, 
        userNickname: executor.nickname, 
        userAvatar: appState.config.logoImage || executor.avatar, 
        content, 
        command: raw, 
        timestamp: Date.now(), 
        isHidden 
      };
      const newState = { ...appState, history: [...appState.history, msg] };
      setAppState(newState);
      saveState(newState);
      if (user.isKP) network.broadcast({ type: 'SYNC_STATE', payload: newState });
    }
  }, [user, appState, netStatus]);

  const startHost = () => {
    const rid = `KOI-${Math.floor(1000 + Math.random() * 8999)}`;
    network.initNetwork(rid, true, {
      onMessage: handleNetworkData,
      onStatusChange: (s, detail) => setNetStatus({ status: s, roomId: detail })
    });
  };

  const joinRoom = (rid) => {
    network.connectToHost(rid, {
      onMessage: handleNetworkData,
      onStatusChange: (s, detail) => {
        setNetStatus({ status: s, roomId: rid });
        if (s === 'CONNECTED_TO_HOST') network.sendToHost({ type: 'INIT_REQ' });
      }
    });
  };

  if (!user) return html`<${Login} onLogin=${setUser} onJoinRoom=${joinRoom} bannedEmails=${appState.config.bannedEmails} />`;

  // 状态解析逻辑
  const getStatusColor = () => {
    if (netStatus.status === 'ERROR') return 'bg-red-500';
    if (netStatus.status.includes('CONNECTED') || netStatus.status === 'READY') return 'bg-green-500';
    return 'bg-gray-300';
  };

  const getStatusText = () => {
    if (netStatus.status === 'ERROR') return '插件受阻 (检查设置)';
    if (netStatus.status === 'OFFLINE') return 'OFFLINE MODE';
    return `ONLINE: ${netStatus.roomId}`;
  };

  const bgStyle = appState.config.backgroundImage ? { 
    backgroundImage: `url(${appState.config.backgroundImage})`, 
    backgroundSize: 'cover', backgroundPosition: 'center' 
  } : {};

  return html`
    <div className="h-screen flex flex-col overflow-hidden bg-white" style=${bgStyle}>
      <header className="fixed top-0 w-full h-20 bg-white/80 backdrop-blur-xl z-30 px-8 flex items-center justify-between border-b border-amber-100">
        <div className="flex items-center gap-4">
          ${appState.config.logoImage ? 
            html`<img src=${appState.config.logoImage} className="w-10 h-10 rounded-2xl object-cover" />` : 
            html`<div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-bold">锦</div>`
          }
          <div>
            <h1 className="font-bold text-gray-800 tracking-tight text-sm">锦鲤终端</h1>
            <div className="flex items-center gap-2">
              <span className=${`w-2 h-2 rounded-full ${getStatusColor()} ${netStatus.status !== 'OFFLINE' ? 'animate-pulse' : ''}`}></span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest font-mono">
                ${getStatusText()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          ${user.isKP && netStatus.status === 'OFFLINE' && html`<button onClick=${startHost} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-[10px] font-bold">开启联机</button>`}
          ${user.isKP && html`<button onClick=${() => setIsAdminOpen(true)} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-bold border border-gray-100">控制台</button>`}
          <button onClick=${() => window.location.reload()} className="p-2 text-gray-300 hover:text-amber-500 transition-colors text-xs">登出</button>
        </div>
      </header>
      <${CharacterSheet} user=${user} />
      <${HistoryPanel} history=${appState.history} currentUser=${user} onDelete=${id => { deleteMessage(id); if(user.isKP) network.broadcast({type:'SYNC_STATE', payload: loadState()}); }} />
      <${CommandInput} onCommand=${handleCommand} themeColor=${appState.config.themeColor} />
      ${isAdminOpen && html`
        <${AdminPanel} 
          config=${appState.config} decks=${appState.decks} users=${appState.users}
          onUpdateConfig=${c => { saveState({config: c}); if(user.isKP) network.broadcast({type:'SYNC_STATE', payload: loadState()}); }}
          onUpdateDecks=${d => { saveState({decks: d}); if(user.isKP) network.broadcast({type:'SYNC_STATE', payload: loadState()}); }}
          onImport=${data => { saveState(data); if(user.isKP) network.broadcast({type:'SYNC_STATE', payload: data}); }}
          onKick=${e => {
            const list = appState.config.bannedEmails || [];
            const newList = [...list, e];
            const nc = { ...appState.config, bannedEmails: newList };
            saveState({ config: nc });
            if(user.isKP) network.broadcast({type:'SYNC_STATE', payload: loadState()});
          }}
          onClose=${() => setIsAdminOpen(false)}
        />
      `}
    </div>
  `;
};
export default App;
