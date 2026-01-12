
import React, { useState } from 'react';

const AdminPanel = ({ config, decks, users, onUpdateConfig, onUpdateDecks, onKick, onClose }) => {
  const [activeTab, setActiveTab] = useState('ui');
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckContent, setNewDeckContent] = useState('');

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateConfig({ ...config, backgroundImage: ev.target?.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdateConfig({ ...config, logoImage: ev.target?.result });
      };
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

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">KP 控制台 (237)</h2>
            <p className="text-xs text-gray-500">管理游戏环境、模板与牌堆</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="flex bg-gray-100 px-2 pt-2 gap-1">
          {['ui', 'templates', 'decks', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-t-lg text-sm font-bold transition-all ${activeTab === t ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'ui' ? '视觉定制' : t === 'templates' ? '话术模板' : t === 'decks' ? '牌堆管理' : '调查员管理'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {activeTab === 'ui' && (
            <>
              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">背景设定 (高清显示)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all text-sm text-gray-500">
                      上传本地背景图片
                      <input type="file" className="hidden" accept="image/*" onChange={handleBgUpload} />
                    </label>
                    {config.backgroundImage && (
                       <button onClick={() => onUpdateConfig({...config, backgroundImage: ''})} className="h-12 px-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">清除背景</button>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">锦鲤标志 (左上角 Logo)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-all text-sm text-gray-500">
                      上传自定义 Logo
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                    {config.logoImage && (
                       <button onClick={() => onUpdateConfig({...config, logoImage: ''})} className="h-12 px-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold">还原默认</button>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">主题配色</h3>
                <div className="grid grid-cols-4 gap-4">
                  {['#F59E0B', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#4b5563'].map(color => (
                    <div 
                      key={color} 
                      onClick={() => onUpdateConfig({...config, themeColor: color})}
                      className={`h-10 rounded-xl cursor-pointer transition-all ${config.themeColor === color ? 'ring-4 ring-offset-2 ring-amber-400 scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <p className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-100 italic">
                提示：可用变量包括 {'{user}'} (调查员名称)、{'{roll}'} (点数)、{'{attributes}'} (属性列表)、{'{result}'} (牌堆结果)。
              </p>
              {Object.entries(config.templates).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-tighter">{key.replace('_', ' ')}</label>
                  <textarea
                    value={value}
                    onChange={(e) => updateTemplate(key, e.target.value)}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none text-sm font-mono h-20"
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'decks' && (
            <div className="space-y-8">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="text-sm font-bold text-gray-700">新建牌堆</h4>
                <input 
                  placeholder="牌堆名称 (如: 掉落物)" 
                  value={newDeckName}
                  onChange={e => setNewDeckName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm"
                />
                <textarea 
                  placeholder="模板内容，例如: 你捡到了 [生锈的铁剑, 精致的匕首, 1d100金币]" 
                  value={newDeckContent}
                  onChange={e => setNewDeckContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none text-sm h-32"
                />
                <button 
                  onClick={addDeck}
                  className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                >
                  添加牌堆
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-700">现有牌堆</h4>
                {decks.map(deck => (
                  <div key={deck.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-gray-800">.draw {deck.name}</span>
                      <button onClick={() => deleteDeck(deck.id)} className="text-red-400 hover:text-red-600 text-xs font-bold">删除</button>
                    </div>
                    <p className="text-xs text-gray-500 whitespace-pre-wrap">{deck.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="text-xs font-bold text-gray-500">已记录的调查员</span>
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">{users.length}</span>
              </div>
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.email} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} className="w-8 h-8 rounded-full" alt="" />
                      <div>
                        <div className="text-sm font-bold text-gray-800">{u.nickname}</div>
                        <div className="text-[10px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    {!u.isKP && (
                      <button 
                        onClick={() => onKick(u.email)}
                        className="text-xs text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg font-bold border border-red-100"
                      >
                        封禁
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
