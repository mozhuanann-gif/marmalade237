
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
    const handleStorageChange = () => {
      const newState = loadState();
      setAppState(newState);
      if (user && newState.config.bannedEmails.includes(user.email)) {
        setUser(null);
        alert('你的账号已被 KP 封禁');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storage_update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage_update', handleStorageChange);
    };
  }, [user]);

  const handleCommand = useCallback((raw) => {
    if (!user) return;
    let normalizedInput = raw.trim();
    if (normalizedInput.startsWith('。')) normalizedInput = '.' + normalizedInput.slice(1);
    
    const lower = normalizedInput.toLowerCase();
    let content = '';
    let isHidden = false;
    let commandLabel = raw;

    if (lower.startsWith('.nn ')) {
      const newName = normalizedInput.slice(4).trim();
      if (newName) {
        const updatedUser = { ...user, nickname: newName };
        setUser(updatedUser);
        saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
        content = `系统：已更名为 ${newName}`;
      }
    } 
    else if (lower.startsWith('.r')) {
      isHidden = lower.startsWith('.rh');
      const formulaMatch = lower.match(/\.r(h)?\s*(.*)/);
      let formula = formulaMatch?.[2] || '1d100';
      if (/^\d+$/.test(formula)) formula = `1d${formula}`;
      
      const skillMatch = formula.match(/(.+?)\s+(\d+)/);
      if (skillMatch) {
        const target = parseInt(skillMatch[2]);
        const roll = rollDice('1d100');
        const level = getSuccessLevel(roll.total, target);
        content = (appState.config.templates[level] || '{user} 掷骰: {roll}')
          .replace('{user}', user.nickname)
          .replace('{roll}', `${roll.total}/${target}`);
      } else {
        const roll = rollDice(formula);
        content = `${user.nickname} 掷出了: ${roll.detail} = ${roll.total}`;
      }
    }
    else if (lower === '.jrrp') {
      content = appState.config.templates['jrrp'].replace('{user}', user.nickname).replace('{roll}', getJrrp(user.email));
    }
    else if (lower.startsWith('.coc')) {
      const attrs = generateCoCAttributes();
      const attrStr = Object.entries(attrs).filter(([k]) => k !== 'SAN').map(([k, v]) => `${k}:${v}`).join(' ');
      content = appState.config.templates['coc_gen'].replace('{user}', user.nickname).replace('{attributes}', attrStr);
      const updatedUser = { ...user, attributes: attrs };
      setUser(updatedUser);
      saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
    }
    else if (lower.startsWith('.draw ')) {
      const deckName = normalizedInput.slice(6).trim();
      const deck = appState.decks.find(d => d.name === deckName);
      if (deck) {
        const result = parseDeck(deck.content);
        content = appState.config.templates['draw'].replace('{user}', user.nickname).replace('{result}', result);
      } else {
        content = `系统：未找到牌堆 "${deckName}"`;
      }
    }
    else if (lower === '.help') {
      content = `可用指令：.r, .rh, .nn, .jrrp, .coc, .draw [牌堆名], .help`;
    }
    else {
      content = raw;
      commandLabel = '';
    }

    if (content) {
      const newMessage = { id: Date.now().toString(), userId: user.email, userNickname: user.nickname, userAvatar: user.avatar, content, command: commandLabel, timestamp: Date.now(), isHidden };
      saveState({ history: [...appState.history, newMessage] });
    }
  }, [user, appState]);

  const handleLogin = (u) => {
    const existing = appState.users.find(x => x.email === u.email);
    const updatedUser = existing ? { ...u, ...existing, nickname: u.nickname, avatar: u.avatar } : u;
    setUser(updatedUser);
    saveState({ users: existing ? appState.users.map(x => x.email === u.email ? updatedUser : x) : [...appState.users, updatedUser] });
  };

  if (!user) return html`<${Login} onLogin=${handleLogin} bannedEmails=${appState.config.bannedEmails} />`;

  const bgStyle = appState.config.backgroundImage ? { backgroundImage: `url(${appState.config.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

  return html`
    <div className="h-screen flex flex-col overflow-hidden bg-white" style=${bgStyle}>
      <header className="fixed top-0 w-full h-20 bg-white/70 backdrop-blur-xl z-30 px-8 flex items-center justify-between border-b border-amber-100">
        <div className="flex items-center gap-4">
          ${appState.config.logoImage ? 
            html`<img src=${appState.config.logoImage} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />` : 
            html`<div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-bold">锦</div>`
          }
          <div>
            <h1 className="font-bold text-gray-800">锦鲤终端</h1>
            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest opacity-50">Koi Terminal</p>
          </div>
        </div>
        <div className="flex gap-4">
          ${user.isKP && html`<button onClick=${() => setIsAdminOpen(!isAdminOpen)} className="px-4 py-2 bg-white border border-amber-100 rounded-xl text-xs font-bold text-amber-600 shadow-sm hover:bg-amber-50 transition-all">管理</button>`}
          <button onClick=${() => setUser(null)} className="p-2 text-amber-400 hover:bg-amber-50 rounded-xl transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>
      <${CharacterSheet} user=${user} />
      <${HistoryPanel} history=${appState.history} currentUser=${user} onDelete=${deleteMessage} />
      <${CommandInput} onCommand=${handleCommand} themeColor=${appState.config.themeColor} />
      ${isAdminOpen && html`
        <${AdminPanel} 
          config=${appState.config} 
          decks=${appState.decks} 
          users=${appState.users} 
          onUpdateConfig=${c => saveState({config: c})} 
          onUpdateDecks=${d => saveState({decks: d})} 
          onKick=${email => saveState({ config: { ...appState.config, bannedEmails: [...appState.config.bannedEmails, email] } })}
          onClose=${() => setIsAdminOpen(false)} 
        />
      `}
    </div>
  `;
};
export default App;
