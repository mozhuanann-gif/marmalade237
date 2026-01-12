
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const AdminPanel = ({ config, decks, users, onUpdateConfig, onUpdateDecks, onClearHistory, onKick, onClose }) => {
  const [activeTab, setActiveTab] = useState('ui');
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckContent, setNewDeckContent] = useState('');

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onUpdateConfig({ ...config, backgroundImage: ev.target?.result });
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => onUpdateConfig({ ...config, logoImage: ev.target?.result });
      reader.readAsDataURL(file);
    }
  };

  const updateTemplate = (key, val) => {
    onUpdateConfig({
      ...config,
      templates: { ...config.templates, [key]: val }
    });
  };

  const addDeck = () => {
    if (!newDeckName) return;
    onUpdateDecks([...decks, { id: Date.now().toString(), name: newDeckName, content: newDeckContent }]);
    setNewDeckName('');
    setNewDeckContent('');
  };

  const translateKey = (key) => {
    const map = {
      CRITICAL: '大成功', EXTREME: '极难成功', HARD: '困难成功',
      SUCCESS: '成功', FAILURE: '失败', FUMBLE: '大失败',
      jrrp: '今日运势', coc_gen: '人物属性生成', draw: '牌堆抽卡'
    };
    return map[key] || key;
  };

  return html`
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick=${onClose}></div>
      <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">KP 控制中心</h2>
            <p className="text-xs text-gray-500 tracking-tighter uppercase font-bold text-amber-600/50">Koi Terminal Control</p>
          </div>
          <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all text-xl">✕</button>
        </div>

        <div className="flex bg-gray-100 px-2 pt-2 gap-1 overflow-x-auto">
          ${[
            { id: 'ui', label: '视觉' },
            { id: 'templates', label: '话术' },
            { id: 'decks', label: '牌堆' },
            { id: 'users', label: '调查员' }
          ].map(t => html`
            <button key=${t.id} onClick=${() => setActiveTab(t.id)} className=${`px-5 py-2 whitespace-nowrap rounded-t-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              ${t.label}
            </button>
          `)}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          ${activeTab === 'ui' && html`
            <div className="space-y-6">
              <section>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">场景背景图</h3>
                <div className="flex gap-4 items-center">
                  <input type="file" onChange=${handleBgUpload} className="block w-full text-xs" accept="image/*" />
                  ${config.backgroundImage && html`<button onClick=${() => onUpdateConfig({...config, backgroundImage: ''})} className="text-red-500 text-xs font-bold">移除</button>`}
                </div>
              </section>
              <section>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">系统 Logo</h3>
                <div className="flex gap-4 items-center">
                  <input type="file" onChange=${handleLogoUpload} className="block w-full text-xs" accept="image/*" />
                  ${config.logoImage && html`<button onClick=${() => onUpdateConfig({...config, logoImage: ''})} className="text-red-500 text-xs font-bold">还原</button>`}
                </div>
              </section>
              <section className="pt-4 border-t border-gray-100">
                <button onClick=${() => { if(confirm('确定清空所有记录？此操作不可撤销。')) onClearHistory(); }} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all">
                  清空历史聊天
                </button>
              </section>
            </div>
          `}

          ${activeTab === 'templates' && html`
            <div className="space-y-6">
              ${Object.entries(config.templates).map(([key, value]) => html`
                <div key=${key} className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">${translateKey(key)}</label>
                  <textarea 
                    value=${value} 
                    onChange=${e => updateTemplate(key, e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-amber-400 outline-none text-sm min-h-[70px]"
                  ></textarea>
                </div>
              `)}
            </div>
          `}

          ${activeTab === 'decks' && html`
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                <input placeholder="牌堆名" value=${newDeckName} onChange=${e => setNewDeckName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-sm" />
                <textarea placeholder="内容 [A, B, C]" value=${newDeckContent} onChange=${e => setNewDeckContent(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 text-sm h-24"></textarea>
                <button onClick=${addDeck} className="w-full py-2 bg-amber-600 text-white rounded-xl font-bold">添加</button>
              </div>
              <div className="space-y-2">
                ${decks.map(d => html`
                  <div key=${d.id} className="p-3 bg-white border border-gray-100 rounded-xl flex justify-between items-center group">
                    <span className="text-sm font-bold">.draw ${d.name}</span>
                    <button onClick=${() => onUpdateDecks(decks.filter(deck => deck.id !== d.id))} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                  </div>
                `)}
              </div>
            </div>
          `}

          ${activeTab === 'users' && html`
            <div className="space-y-3">
              ${users.map(u => html`
                <div key=${u.email} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src=${u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="text-sm font-bold">${u.nickname}</div>
                      <div className="text-[10px] text-gray-400 font-mono">${u.email}</div>
                    </div>
                  </div>
                  ${!u.isKP && html`
                    <button 
                      onClick=${() => onKick(u.email)} 
                      className=${`px-4 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${config.bannedEmails.includes(u.email) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-red-50 border-red-100 text-red-500'}`}
                    >
                      ${config.bannedEmails.includes(u.email) ? '解除封禁' : '强制踢出'}
                    </button>
                  `}
                </div>
              `)}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};
export default AdminPanel;
