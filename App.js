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

  // 核心：实时监听封禁状态和状态更新
  useEffect(() => {
    const handleUpdate = () => {
      const newState = loadState();
      setAppState(newState);
      
      // 如果当前登录的用户在封禁列表中，立即踢出
      if (user && newState.config.bannedEmails.includes(user.email)) {
        alert('由于违反规则，你已被管理员移出终端。');
        setUser(null);
      }
    };
    window.addEventListener('storage_update', handleUpdate);
    window.addEventListener('storage', handleUpdate); // 兼容多标签页
    return () => {
      window.removeEventListener('storage_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  const handleCommand = useCallback((raw) => {
    if (!user) return;
    let input = raw.trim();
    if (input.startsWith('。')) input = '.' + input.slice(1);
    
    const parts = input.split(/\s+/);
    const cmdInput = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    
    let content = '';
    let isHidden = false;
    let commandLabel = raw;

    // 1. 掷骰逻辑修复 (.r23, .r 1d20, .rh 1d100)
    if (cmdInput.startsWith('.r')) {
      isHidden = cmdInput.startsWith('.rh');
      let formula = '';
      
      // 如果指令是 .r23 这种紧凑型
      if (!isHidden && cmdInput.length > 2 && /^\d+$/.test(cmdInput.slice(2))) {
        formula = cmdInput.slice(2);
      } else if (isHidden && cmdInput.length > 3 && /^\d+$/.test(cmdInput.slice(3))) {
        formula = cmdInput.slice(3);
      } else {
        formula = args || '1d100';
      }

      const roll = rollDice(formula);
      content = `🎲 ${user.nickname} 掷出了 ${roll.detail} = ${roll.total}`;
    } 
    // 2. 属性检定 .ra [技能名] [成功率]
    else if (cmdInput === '.ra') {
      const match = args.match(/(.+?)\s+(\d+)/);
      if (match) {
        const name = match[1];
        const target = parseInt(match[2]);
        const roll = rollDice('1d100');
        const level = getSuccessLevel(roll.total, target);
        content = (appState.config.templates[level] || '{user} 的 {name} 检定: {roll}')
          .replace('{user}', user.nickname)
          .replace('{name}', name)
          .replace('{roll}', `${roll.total}/${target}`);
      } else {
        content = `系统提示：.ra 正确语法为 ".ra 技能名 成功率"，例如 ".ra 侦察 50"`;
      }
    }
    // 3. 帮助指令 .help
    else if (cmdInput === '.help' || cmdInput === '.帮助') {
      content = `【锦鲤终端 - 指令手册】\n` +
                `--------------------------\n` +
                `.r [公式/数字]  : 普通掷骰 (如 .r20, .r3d6+4)\n` +
                `.rh [公式]      : 暗骰 (结果仅 KP 可见)\n` +
                `.ra [技能] [值] : 成功率检定 (如 .ra 侦察 45)\n` +
                `.coc            : 生成 CoC 7版 人物属性\n` +
                `.jrrp           : 抽取今日锦鲤值\n` +
                `.draw [牌堆名]  : 从指定牌堆抽取内容\n` +
                `.nn [新名字]    : 快速修改你的调查员称呼\n` +
                `* 全指令支持中文句号 "。" 作为前缀`;
    }
    // 4. 其他功能
    else if (cmdInput === '.jrrp') {
      content = appState.config.templates['jrrp'].replace('{user}', user.nickname).replace('{roll}', getJrrp(user.email));
    } else if (cmdInput === '.coc') {
      const attrs = generateCoCAttributes();
      const updatedUser = { ...user, attributes: attrs };
      setUser(updatedUser);
      saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
      const attrStr = Object.entries(attrs).filter(a => a[0] !== 'SAN').map(a => `${a[0]}:${a[1]}`).join(' ');
      content = appState.config.templates['coc_gen'].replace('{user}', user.nickname).replace('{attributes}', attrStr);
    } else if (cmdInput === '.nn') {
       if (args) {
         const updatedUser = { ...user, nickname: args };
         setUser(updatedUser);
         saveState({ users: appState.users.map(u => u.email === user.email ? updatedUser : u) });
         content = `系统：调查员名称已更新为「${args}」`;
       }
    } else if (cmdInput === '.draw') {
      const deck = appState.decks.find(d => d.name === args);
      if (deck) {
        content = appState.config.templates['draw'].replace('{user}', user.nickname).replace('{result}', parseDeck(deck.content));
      } else {
        content = `系统提示：未找到牌堆「${args}」。`;
      }
    } else {
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
          <h1 className="font-bold text-gray-800 tracking-tight">锦鲤终端 <span className="text-amber-500 text-[10px] ml-1 opacity-50 uppercase tracking-widest font-mono">猜猜乐 V2</span></h1>
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
          onKick=${e => {
            const list = appState.config.bannedEmails || [];
            const newList = list.includes(e) ? list.filter(item => item !== e) : [...list, e];
            saveState({ config: { ...appState.config, bannedEmails: newList } });
          }}
          onClose=${() => setIsAdminOpen(false)}
        />
      `}
    </div>
  `;
};
export default App;
