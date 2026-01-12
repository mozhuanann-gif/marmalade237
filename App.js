
import React, { useState, useEffect, useCallback } from 'react';
import htm from 'htm';
import { loadState, saveState, deleteMessage } from './services/storageService.js';
import { rollDice, getSuccessLevel, generateCoCAttributes, parseDeck, getJrrp } from './services/diceService.js';
import Login from './components/Login.js';
import HistoryPanel from './components/HistoryPanel.js';
import CommandInput from './components/CommandInput.js';
import AdminPanel from './components/AdminPanel.js';
import CharacterSheet from './components/CharacterSheet.js';

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
    if (normalizedInput.startsWith('。')) {
      normalizedInput = '.' + normalizedInput.slice(1);
    }
    
    const lower = normalizedInput.toLowerCase();
    let content = '';
    let isHidden = false;
    let commandLabel = raw;

    if (lower.startsWith('.nn ')) {
      const newName = normalizedInput.slice(4).trim();
      if (newName) {
        const updatedUser = { ...user, nickname: newName };
        setUser(updatedUser);
        const newState = { ...appState, users: appState.users.map(u => u.email === user.email ? updatedUser : u) };
        saveState(newState);
        content = `系统：已更名为 ${newName}`;
      }
    } 
    else if (lower.startsWith('.r') || lower.startsWith('.rd')) {
      isHidden = lower.startsWith('.rh');
      const formulaMatch = lower.match(/\.r(h)?\s*(.*)/);
      let formula = formulaMatch?.[2] || '1d100';
      
      if (/^\d+$/.test(formula)) {
        formula = `1d${formula}`;
      } else if (!formula) {
        formula = '1d100';
      }

      const skillMatch = formula.match(/(.+?)\s+(\d+)/);
      if (skillMatch) {
        const skillName = skillMatch[1];
        const target = parseInt(skillMatch[2]);
        const roll = rollDice('1d100');
        const level = getSuccessLevel(roll.total, target);
        content = appState.config.templates[level]
          .replace('{user}', user.nickname)
          .replace('{roll}', `${roll.total}/${target} (${skillName})`);
      } else {
        const roll = rollDice(formula);
        content = `${user.nickname} 掷出了: ${roll.detail} = ${roll.total}`;
      }
    }
    else if (lower === '.jrrp') {
      const luck = getJrrp(user.email);
      content = appState.config.templates['jrrp']
        .replace('{user}', user.nickname)
        .replace('{roll}', luck.toString());
    }
    else if (lower.startsWith('.coc')) {
      const attrs = generateCoCAttributes();
      const attrStr = Object.entries(attrs)
        .filter(([k]) => k !== 'SAN')
        .map(([k, v]) => `${k}:${v}`).join(' ');
      content = appState.config.templates['coc_gen']
        .replace('{user}', user.nickname)
        .replace('{attributes}', attrStr);
      
      const updatedUser = { ...user, attributes: attrs };
      setUser(updatedUser);
      saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
    }
    else if (lower.startsWith('.draw ')) {
      const deckName = normalizedInput.slice(6).trim();
      const deck = appState.decks.find(d => d.name === deckName);
      if (deck) {
        const result = parseDeck(deck.content);
        content = appState.config.templates['draw']
          .replace('{user}', user.nickname)
          .replace('{result}', result);
      } else {
        content = `系统：未找到牌堆 "${deckName}"`;
      }
    }
    else if (lower === '.help' || lower === '.帮助') {
      content = `可用指令：.r [公式], .rh [暗骰], .r [技能] [值], .nn [改名], .jrrp, .coc, .draw [牌堆], .help (支持使用中文句号 "。" 作为前缀)`;
    }
    else {
      content = raw;
      commandLabel = '';
    }

    if (content) {
      const newMessage = {
        id: Date.now().toString(),
        userId: user.email,
        userNickname: user.nickname,
        userAvatar: user.avatar,
        content,
        command: commandLabel,
        timestamp: Date.now(),
        isHidden
      };
      saveState({ history: [...appState.history, newMessage] });
    }
  }, [user, appState]);

  const handleLogin = (u) => {
    const existingUsers = loadState().users;
    const existing = existingUsers.find(x => x.email === u.email);
    const updatedUser = existing ? { ...u, ...existing, nickname: u.nickname, avatar: u.avatar } : u;
    setUser(updatedUser);
    saveState({ users: existing ? existingUsers.map(x => x.email === u.email ? updatedUser : x) : [...existingUsers, updatedUser] });
  };

  if (!user) {
    return html`<${Login} onLogin=${handleLogin} bannedEmails=${appState.config.bannedEmails} />`;
  }

  const bgStyle = appState.config.backgroundImage ? {
    backgroundImage: `url(${appState.config.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};

  return html`
    <div className="h-screen flex flex-col transition-all duration-700 overflow-hidden bg-[#FFFFFF]" style=${bgStyle}>
      <div className=${`absolute inset-0 pointer-events-none ${appState.config.backgroundImage ? 'bg-black/10' : 'bg-[#FFFFFF]'}`}>
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-50/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-amber-50/20 to-transparent"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-xl z-30 px-8 flex items-center justify-between border-b border-amber-100/30 transition-all">
        <div className="flex items-center gap-4">
          ${appState.config.logoImage ? 
            html`<img src=${appState.config.logoImage} className="w-10 h-10 rounded-2xl object-cover shadow-lg shadow-amber-200/50" alt="Logo" />` : 
            html`<div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-200/50">锦</div>`
          }
          <div>
            <h1 className="font-bold text-gray-800 tracking-tight">你是谁？请支持猜猜乐！</h1>
            <p className="text-[10px] font-bold text-amber-500 tracking-[0.3em] uppercase opacity-60">Koi Investigator Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          ${user.isKP && html`
            <button 
              onClick=${() => setIsAdminOpen(!isAdminOpen)}
              className="px-6 py-2 bg-white/80 hover:bg-amber-50 text-amber-600 text-xs font-bold rounded-2xl border border-amber-100 shadow-sm transition-all flex items-center gap-2"
            >
              管理者设置
            </button>
          `}
          <button onClick=${() => setUser(null)} className="p-2 hover:bg-amber-50 rounded-xl transition-all text-amber-400">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </header>

      <${CharacterSheet} user=${user} />
      <${HistoryPanel} history=${appState.history} currentUser=${user} onDelete=${deleteMessage} />
      <${CommandInput} onCommand=${handleCommand} themeColor=${appState.config.themeColor} />

      ${isAdminOpen && html`
        <${AdminPanel} 
          config=${appState.config} decks=${appState.decks} users=${appState.users}
          onUpdateConfig=${(c) => saveState({ config: c })}
          onUpdateDecks=${(d) => saveState({ decks: d })}
          onKick=${(email) => saveState({ config: { ...appState.config, bannedEmails: [...appState.config.bannedEmails, email] } })}
          onClose=${() => setIsAdminOpen(false)}
        />
      `}
    </div>
  `;
};

export default App;
