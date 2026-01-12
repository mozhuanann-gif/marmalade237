
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const AdminPanel = ({ config, decks, users, onUpdateConfig, onUpdateDecks, onKick, onClose }) => {
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

  const deleteDeck = (id) => {
    onUpdateDecks(decks.filter(d => d.id !== id));
  };

  const translateKey = (key) => {
    const map = {
      CRITICAL: '大成功',
      EXTREME: '极难成功',
      HARD: '困难成功',
      SUCCESS: '成功',
      FAILURE: '失败',
      FUMBLE: '大失败',
      jrrp: '今日运势 (jrrp)',
      coc_gen: '人物属性生成',
      draw: '牌堆抽卡',
      sc_success: '理智检定成功',
      sc_failure: '理智检定失败'
    };
    return map[key] || key;
  };

  return html`
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick=${onClose}></div>
      <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">KP 控制台</h2>
            <p className="text-xs text-gray-500">管理环境与调查员</p>
          </div>
          <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
        </div>

        <div className="flex bg-gray-100 px-2 pt-2 gap-1">
          ${[
            { id: 'ui', label: '视觉' },
            { id: 'templates', label: '话术' },
            { id: 'decks', label: '牌堆' },
            { id: 'users', label: '调查员' }
          ].map(t => html`
            <button key=${t.id} onClick=${() => setActiveTab(t.id)} className=${`px-4 py-2 rounded-t-lg text-xs font-bold transition-all ${activeTab === t.id ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
              ${t.label}
            </button>
          `)}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          ${activeTab === 'ui' && html`
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">场景背景</h3>
                <input type="file" onChange=${handleBgUpload} className="block w-full text-xs" accept="image/*" />
              </section>
              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">Logo</h3>
                <input type="file" onChange=${handleLogoUpload} className="block w-full text-xs" accept="image/*" />
              </section>
            </div>
          `}

          ${activeTab === 'templates' && html`
            <div className="space-y-6">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 italic">
                提示：可以使用 {user} (玩家名), {roll} (点数), {attributes} (属性) 等占位符。
              </div>
              ${Object.entries(config.templates).map(([key, value]) => html`
                <div key=${key} className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">${translateKey(key)}</label>
                  <textarea 
                    value=${value} 
                    onChange=${e => updateTemplate(key, e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-amber-400 focus:bg-white outline-none text-sm min-h-[80px] transition-all"
                  ></textarea>
                </div>
              `)}
            </div>
          `}

          ${activeTab === 'decks' && html`
            <div className="space-y-4">
              <input placeholder="牌堆名" value=${newDeckName} onChange=${e => setNewDeckName(e.target.value)} className="w-full p-2 border rounded" />
              <textarea placeholder="内容 [A, B, C]" value=${newDeckContent} onChange=${e => setNewDeckContent(e.target.value)} className="w-full p-2 border rounded h-32"></textarea>
              <button onClick=${addDeck} className="w-full py-2 bg-amber-600 text-white rounded">添加</button>
              <div className="mt-4 space-y-2">
                ${decks.map(d => html`
                  <div key=${d.id} className="p-3 bg-gray-50 rounded border flex justify-between">
                    <span>${d.name}</span>
                    <button onClick=${() => deleteDeck(d.id)} className="text-red-500 text-xs">删除</button>
                  </div>
                `)}
              </div>
            </div>
          `}

          ${activeTab === 'users' && html`
            <div className="space-y-4">
              ${users.map(u => html`
                <div key=${u.email} className="flex items-center justify-between p-4 bg-white border rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src=${u.avatar} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <div className="text-sm font-bold">${u.nickname}</div>
                      <div className="text-[10px] text-gray-400">${u.email}</div>
                    </div>
                  </div>
                  ${!u.isKP && html`
                    <button 
                      onClick=${() => onKick(u.email)}
                      className=${`px-3 py-1 rounded-lg text-xs font-bold ${config.bannedEmails.includes(u.email) ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500'}`}
                    >
                      ${config.bannedEmails.includes(u.email) ? '已封禁' : '封禁'}
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
