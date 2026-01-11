import React, { useState, useEffect } from 'react';
import Gun from 'gun';
import CharacterSheet from './components/CharacterSheet';
import CommandInput from './components/CommandInput';
import HistoryPanel from './components/HistoryPanel';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { INITIAL_STATS } from './constants';
import { 
  CharacterStat, Message, MessageType, Player, 
  RollTemplates, AppConfig, SuccessLevel 
} from './types';
import { narrateRoll } from './services/geminiService';

// 初始化实时同步引擎，所有玩家的数据通过此网络实时共享
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun']);
const sharedRoom = gun.get('coc_global_room_v3_stable'); 

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Player | null>(() => {
    const saved = localStorage.getItem('coc_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState<Message[]>([]);
  const [stats, setStats] = useState<CharacterStat[]>(() => {
      const saved = localStorage.getItem('coc_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
  });
  const [config, setConfig] = useState<AppConfig>({
    backgroundUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1920',
    themeColor: '#4f46e5'
  });
  const [templates, setTemplates] = useState<RollTemplates>(/* ...默认模板... */);
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

  // 监听实时数据：消息历史、配置更新、玩家列表
  useEffect(() => {
    sharedRoom.get('history').map().on((data, id) => {
      if (!data) {
        setHistory(prev => prev.filter(m => m.id !== id));
        return;
      }
      setHistory(prev => {
        if (prev.find(m => m.id === id)) return prev;
        return [...prev, { ...data, id }].sort((a, b) => b.timestamp - a.timestamp);
      });
    });

    sharedRoom.get('config').on((data) => data && setConfig(data));

    if (currentUser) {
      sharedRoom.get('players').get(currentUser.email).put(currentUser as any);
    }
    sharedRoom.get('players').map().on((p, email) => {
      if (p) setPlayers(prev => [...prev.filter(x => x.email !== email), p as Player]);
    });
  }, [currentUser?.email]);

  // CoC 7版成功等级判定算法
  const getSuccessLevel = (roll: number, target: number): SuccessLevel => {
    if (roll === 1) return SuccessLevel.CRITICAL;
    if (roll === 100 || (target < 50 && roll >= 96)) return SuccessLevel.FUMBLE;
    if (roll <= target / 5) return SuccessLevel.EXTREME;
    if (roll <= target / 2) return SuccessLevel.HARD;
    if (roll <= target) return SuccessLevel.REGULAR;
    return SuccessLevel.FAILURE;
  };

  // 核心指令解析器
  const handleCommand = async (raw: string) => {
    if (!currentUser) return;
    const messageId = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    let content = raw;
    let type = MessageType.SYSTEM;
    let rollData: any = null;
    let isHidden = false;

    const args = raw.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();

    // 处理 .r (标准掷骰) 和 .rh (暗骰)
    if (cmd === '.r' || cmd === '.rh') {
      isHidden = cmd === '.rh';
      const label = args[2] || '检定';
      const total = Math.floor(Math.random() * 100) + 1;
      type = MessageType.ROLL;
      const targetStat = stats.find(s => label.includes(s.name) || s.id === label);
      const successLevel = targetStat ? getSuccessLevel(total, targetStat.value) : undefined;

      rollData = { label, formula: '1d100', total, successLevel, isVerified: true };

      // 如果是公开掷骰且有判定结果，调用 Gemini AI 生成克苏鲁风格的叙事
      if (!isHidden && successLevel) {
        rollData.templateContent = await narrateRoll({
            playerName: currentUser.name, label, formula: '1d100', total, 
            individualRolls: [total], skillValue: targetStat?.value, successLevel
        });
      }
    } else if (cmd === '.jrrp') {
      content = `今日人品：${Math.floor(Math.random() * 100) + 1}`;
    } else if (cmd === '.coc') {
      content = `新卡属性：\n${INITIAL_STATS.map(s => `${s.name}: ${Math.floor(Math.random() * 60) + 20}`).join('\n')}`;
    }

    // 将结果写入 Gun.js 分布式数据库
    sharedRoom.get('history').get(messageId).put({
      id: messageId, type, timestamp, playerName: currentUser.name, playerAvatar: currentUser.avatar,
      playerEmail: currentUser.email, content, isHidden, rollData
    } as any);
  };

  if (!currentUser) return <Login onLogin={(p) => setCurrentUser(p)} />;

  return (
    <div style={{ backgroundImage: `url(${config.backgroundUrl})`, backgroundSize: 'cover' }} className="min-h-screen p-6">
      {/* 界面结构 */}
      <header className="max-w-7xl mx-auto flex justify-between bg-white/50 backdrop-blur-xl p-6 rounded-3xl shadow-sm mb-10">
        <h1 className="text-2xl font-black">跑团终端</h1>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200">{currentUser.avatar} {currentUser.name}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <CommandInput onCommand={handleCommand} themeColor={config.themeColor} />
          <HistoryPanel history={history} currentUser={currentUser} onClear={() => sharedRoom.get('history').put(null as any)} onDeleteMessage={(id) => sharedRoom.get('history').get(id).put(null as any)} themeColor={config.themeColor} />
        </div>
        <div className="lg:col-span-4">
          <CharacterSheet stats={stats} onUpdateStat={(id, v) => setStats(s => s.map(x => x.id === id ? {...x, value: v} : x))} onCheckStat={(s) => handleCommand(`.r 1d100 ${s.name}`)} themeColor={config.themeColor} />
        </div>
      </main>
    </div>
  );
};

export default App;
