
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
    
    const parts = input.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    let content = '';
    let isHidden = cmd === '.rh';
    let commandLabel = raw;

    // 1. 掷骰逻辑 .r / .rh
    if (cmd === '.r' || cmd === '.rh' || cmd.startsWith('.r')) {
      let formula = args || '1d100';
      // 如果指令本身就是 .r20 这种形式
      if (cmd.length > 2 && /^\d+$/.test(cmd.slice(2))) {
        formula = cmd.slice(2);
      } else if (!args && cmd.length > 2) {
        formula = cmd.slice(2);
      }

      const roll = rollDice(formula);
      content = `🎲 ${user.nickname} 掷出了 ${roll.detail} = ${roll.total}`;
    } 
    // 2. 属性检定 .ra [属性] [值]
    else if (cmd === '.ra') {
      const match = args.match(/(.+?)\s+(\d+)/);
      if (match) {
        const name = match[1];
        const target = parseInt(match[2]);
        const roll = rollDice('1d100');
        const level = getSuccessLevel(roll.total, target);
        content = (appState.config.templates[level] || '{user} 进行 {name} 检定: {roll}')
          .replace('{user}', user.nickname)
          .replace('{name}', name)
          .replace('{roll}', `${roll.total}/${target}`);
      } else {
        content = `系统提示：.ra 正确语法为 ".ra 技能名 成功率"`;
      }
    }
    // 3. 人物生成 .coc
    else if (cmd === '.coc') {
      const attrs = generateCoCAttributes();
      const updatedUser = { ...user, attributes: attrs };
      setUser(updatedUser);
      saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
      const attrStr = Object.entries(attrs).filter(a => a[0] !== 'SAN').map(a => `${a[0]}:${a[1]}`).join(' ');
      content = appState.config.templates['coc_gen'].replace('{user}', user.nickname).replace('{attributes}', attrStr);
    }
    // 4. 今日运势 .jrrp
    else if (cmd === '.jrrp') {
      content = appState.config.templates['jrrp'].replace('{user}', user.nickname).replace('{roll}', getJrrp(user.email));
    }
    // 5. 牌堆抽卡 .draw
    else if (cmd === '.draw') {
      const deck = appState.decks.find(d => d.name === args);
      if (deck) {
        content = appState.config.templates['draw'].replace('{user}', user.nickname).replace('{result}', parseDeck(deck.content));
      } else {
        content = `系统提示：未找到名为 "${args}" 的牌堆。`;
      }
    }
    // 6. 帮助 .help
    else if (cmd === '.help' || cmd === '.帮助') {
      content = `【锦鲤终端 指令指南】\n` +
                `1. .r [公式] : 掷骰，如 .r1d100, .r3d6+4, .r20\n` +
                `2. .rh [公式] : 暗骰，结果仅 KP 可见\n` +
                `3. .ra [技能] [值] : 属性判定，如 .ra 侦察 50\n` +
                `4. .coc : 自动生成 CoC 7版 人物属性\n` +
                `5. .jrrp : 查看今日锦鲤运势\n` +
                `6. .draw [牌堆名] : 从 KP 设置的牌堆中抽卡\n` +
                `7. .nn [名字] : 修改调查员昵称\n` +
                `* 支持中文句号 "。" 作为前缀`;
    }
    else if (cmd === '.nn') {
       if (args) {
         const updatedUser = { ...user, nickname: args };
         setUser(updatedUser);
         saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
         content = `系统：调查员已更名为 ${args}`;
       }
    }
    else {
      content = raw;
      commandLabel = '';
    }

    const msg = { 
      id: Date.now().toString(), 
      userId: user.email, 
      userNickname: user.nickname, 
      userAvatar: user.avatar, 
      content, 
      command: commandLabel, 
      timestamp: Date.now(), 
      isHidden 
    };
    saveState({ history: [...appState.history, msg] });
  }, [user, appState]);

  if (!user) return html`<${Login} onLogin=${setUser} bannedEmails=${appState.config.bannedEmails} />`;

  const bgStyle = appState.config.backgroundImage ? { 
    backgroundImage: `url(${appState.config.backgroundImage})`, 
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed'
  } : {};

  return html`
    <div className="h-screen flex flex-col overflow-hidden bg-white transition-all duration-500" style=${bgStyle}>
      <header className="fixed top-0 w-full h-20 bg-white/80 backdrop-blur-xl z-30 px-8 flex items-center justify-between border-b border-amber-100">
        <div className="flex items-center gap-4">
          ${appState.config.logoImage ? 
            html`<img src=${appState.config.logoImage} className="w-10 h-10 rounded-2xl object-cover shadow-sm" />` : 
            html`<div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-bold">锦</div>`
          }
          <h1 className="font-bold text-gray-800 tracking-tight">锦鲤终端 <span className="text-amber-500 text-[10px] ml-1 opacity-50">KOI-v2</span></h1>
        </div>
        <div className="flex gap-4">
          ${user.isKP && html`<button onClick=${() => setIsAdminOpen(true)} className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100 hover:bg-amber-100 transition-all">管理者设置</button>`}
          <button onClick=${() => setUser(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all">登出</button>
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
          onClearHistory=${() => saveState({ history: [] })}
          onKick=${e => saveState({ config: { ...appState.config, bannedEmails: [...appState.config.bannedEmails, e] } })}
          onClose=${() => setIsAdminOpen(false)}
        />
      `}
    </div>
  `;
};
export default App;
