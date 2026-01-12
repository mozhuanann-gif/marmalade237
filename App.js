
import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import { loadState, saveState, deleteMessage } from './storageService.js';
import { rollDice, getSuccessLevel, generateCoCAttributes, parseDeck, getJrrp } from './diceService.js';
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

  useEffect(() => {
    const handleUpdate = () => setAppState(loadState());
    window.addEventListener('storage_update', handleUpdate);
    return () => window.removeEventListener('storage_update', handleUpdate);
  }, []);

  const handleCommand = useCallback((raw) => {
    if (!user) return;
    let input = raw.trim();
    if (input.startsWith('。')) input = '.' + input.slice(1);
    const lower = input.toLowerCase();
    
    let content = '';
    let isHidden = false;

    if (lower.startsWith('.r')) {
      isHidden = lower.startsWith('.rh');
      const formula = input.split(/\s+/)[1] || '1d100';
      const roll = rollDice(formula);
      content = `${user.nickname} 掷出了 ${roll.detail} = ${roll.total}`;
    } else if (lower.startsWith('.coc')) {
      const attrs = generateCoCAttributes();
      const updatedUser = { ...user, attributes: attrs };
      setUser(updatedUser);
      saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
      content = `📜 ${user.nickname} 抽取的属性：${Object.entries(attrs).filter(a => a[0] !== 'SAN').map(a => `${a[0]}:${a[1]}`).join(' ')}`;
    } else if (lower === '.jrrp') {
      content = `🎏 ${user.nickname} 的今日运势是：${getJrrp(user.email)}`;
    } else {
      content = raw;
    }

    const msg = { id: Date.now().toString(), userId: user.email, userNickname: user.nickname, userAvatar: user.avatar, content, command: raw, timestamp: Date.now(), isHidden };
    saveState({ history: [...appState.history, msg] });
  }, [user, appState]);

  if (!user) return html`<${Login} onLogin=${setUser} bannedEmails=${appState.config.bannedEmails} />`;

  return html`
    <div className="h-screen flex flex-col overflow-hidden bg-white" style=${appState.config.backgroundImage ? { backgroundImage: `url(${appState.config.backgroundImage})`, backgroundSize: 'cover' } : {}}>
      <header className="fixed top-0 w-full h-20 bg-white/80 backdrop-blur-xl z-30 px-8 flex items-center justify-between border-b border-amber-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-bold">锦</div>
          <h1 className="font-bold text-gray-800">锦鲤终端</h1>
        </div>
        <div className="flex gap-4">
          ${user.isKP && html`<button onClick=${() => setIsAdminOpen(true)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100">管理</button>`}
          <button onClick=${() => setUser(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl">登出</button>
        </div>
      </header>
      <${CharacterSheet} user=${user} />
      <${HistoryPanel} history=${appState.history} currentUser=${user} onDelete=${deleteMessage} />
      <${CommandInput} onCommand=${handleCommand} themeColor=${appState.config.themeColor} />
      ${isAdminOpen && html`
        <${AdminPanel} 
          config=${appState.config} decks=${appState.decks} users=${appState.users}
          onUpdateConfig=${c => saveState({config: c})}
          onUpdateDecks=${d => saveState({decks: d})}
          onKick=${e => saveState({ config: { ...appState.config, bannedEmails: [...appState.config.bannedEmails, e] } })}
          onClose=${() => setIsAdminOpen(false)}
        />
      `}
    </div>
  `;
};
export default App;
