
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

  // 辅助函数：翻译模板 Key
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
            <p className="text-xs text-gray-500">管理模组环境与话术</p>
          </div>
          <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">✕</button>
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
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">场景背景 (高清)</h3>
                <div className="flex gap-4 items-center">
                  <label className="flex-1 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all text-xs text-gray-500">
                    点击上传图片
                    <input type="file" onChange=${handleBgUpload} className="hidden" accept="image/*" />
                  </label>
                  ${config.backgroundImage && html`<button onClick=${() => onUpdateConfig({...config, backgroundImage: ''})} className="px-4 py-2 text-xs text-red-500 font-bold bg-red-50 rounded-lg">清除</button>`}
                </div>
              </section>
              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase">锦鲤标志 (Logo)</h3>
                <input type="file" onChange=${handleLogoUpload} className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
              </section>
            </div>
          `}

          ${activeTab === 'templates' && html`
            <div className="space-y-6">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 italic">
                提示：可以使用 {`{user}`} (玩家名), {`{roll}`} (点数), {`{attributes}`} (属性) 等变量。
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
            <div className="space-y-8">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase">新建牌堆</h4>
                <input placeholder="牌堆名称 (如: 随机事件)" value=${newDeckName} onChange=${e => setNewDeckName(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm" />
                <textarea placeholder="内容，例如: [大雨, 狂风, 烈日]" value=${newDeckContent} onChange=${e => setNewDeckContent(e.target.value)} className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm h-24"></textarea>
                <button onClick=${addDeck} className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 active:scale-95 transition-all">添加牌堆</button>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-700 uppercase">现有牌堆</h4>
                ${decks.map(deck => html`
                  <div key=${deck.id} className="p-4 bg-white rounded-xl border border-gray-100 group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800 text-sm">.draw ${deck.name}</span>
                      <button onClick=${() => deleteDeck(deck.id)} className="text-red-400 hover:text-red-600 text-xs">删除</button>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">${deck.content}</p>
                  </div>
                `)}
              </div>
            </div>
          `}

          ${activeTab === 'users' && html`
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700">当前模组调查员 (${users.length})</h3>
              <div className="space-y-2">
                ${users.map(u => html`
                  <div key=${u.email} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all group">
                    <div className="flex items-center gap-3">
                      <img src=${u.avatar} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                      <div>
                        <div className="text-sm font-bold text-gray-800">${u.nickname}</div>
                        <div className="text-[10px] text-gray-400">${u.email}</div>
                      </div>
                    </div>
                    ${!u.isKP && html`
                      <button 
                        onClick=${() => onKick(u.email)}
                        className=${`px-3 py-1 rounded-lg text-xs font-bold transition-all ${config.bannedEmails.includes(u.email) ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100'}`}
                      >
                        ${config.bannedEmails.includes(u.email) ? '已封禁' : '封禁'}
                      </button>
                    `}
                    ${u.isKP && html`<span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">管理者</span>`}
                  </div>
                `)}
              </div>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};
export default AdminPanel;
