
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

  const addDeck = () => {
    if (!newDeckName) return;
    onUpdateDecks([...decks, { id: Date.now().toString(), name: newDeckName, content: newDeckContent }]);
    setNewDeckName('');
    setNewDeckContent('');
  };

  return html`
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick=${onClose}></div>
      <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div><h2 className="text-xl font-bold text-gray-800">KP 控制台</h2><p className="text-xs text-gray-500">管理环境</p></div>
          <button onClick=${onClose} className="p-2 hover:bg-gray-200 rounded-full">✕</button>
        </div>
        <div className="flex bg-gray-100 px-2 pt-2 gap-1">
          ${['ui', 'templates', 'decks', 'users'].map(t => html`
            <button key=${t} onClick=${() => setActiveTab(t)} className=${`px-4 py-2 rounded-t-lg text-sm font-bold ${activeTab === t ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>
              ${t.toUpperCase()}
            </button>
          `)}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          ${activeTab === 'ui' && html`
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold mb-4">背景图 (高清)</h3>
                <input type="file" onChange=${handleBgUpload} className="block w-full text-xs" />
                ${config.backgroundImage && html`<button onClick=${() => onUpdateConfig({...config, backgroundImage: ''})} className="mt-2 text-xs text-red-500">清除</button>`}
              </section>
              <section>
                <h3 className="text-sm font-bold mb-4">Logo</h3>
                <input type="file" onChange=${handleLogoUpload} className="block w-full text-xs" />
              </section>
            </div>
          `}
          ${activeTab === 'decks' && html`
             <div className="space-y-4">
                <input placeholder="牌堆名" value=${newDeckName} onChange=${e => setNewDeckName(e.target.value)} className="w-full p-2 border rounded" />
                <textarea placeholder="内容" value=${newDeckContent} onChange=${e => setNewDeckContent(e.target.value)} className="w-full p-2 border rounded h-32"></textarea>
                <button onClick=${addDeck} className="w-full py-2 bg-amber-600 text-white rounded">添加</button>
             </div>
          `}
        </div>
      </div>
    </div>
  `;
};
export default AdminPanel;
