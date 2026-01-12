
import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const CharacterSheet = ({ user }) => {
  const [isOpen, setIsOpen] = useState(true);
  if (!user) return null;

  const stats = user.attributes ? [
    { label: '力量', val: user.attributes.STR, code: 'STR' },
    { label: '体质', val: user.attributes.CON, code: 'CON' },
    { label: '敏捷', val: user.attributes.DEX, code: 'DEX' },
    { label: '外貌', val: user.attributes.APP, code: 'APP' },
    { label: '意志', val: user.attributes.POW, code: 'POW' },
    { label: '幸运', val: user.attributes.LUCK, code: 'LUC' },
    { label: '体型', val: user.attributes.SIZ, code: 'SIZ' },
    { label: '智力', val: user.attributes.INT, code: 'INT' },
    { label: '教育', val: user.attributes.EDU, code: 'EDU' },
  ] : [];

  return html`
    <div className=${`fixed top-24 left-6 z-40 transition-all duration-500 ${isOpen ? 'w-64' : 'w-12 overflow-hidden'}`}>
      <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-amber-100 p-1">
        <button onClick=${() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-amber-50 text-amber-500">
          ${isOpen ? '✕' : '📜'}
        </button>
        ${isOpen && html`
          <div className="p-4 pt-2">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-50">
              <img src=${user.avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-200" />
              <div>
                <div className="text-sm font-bold text-gray-800">${user.nickname}</div>
                <div className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Investigator</div>
              </div>
            </div>
            ${user.attributes ? html`
              <div className="grid grid-cols-3 gap-2 mb-6">
                ${stats.map(s => html`
                  <div key=${s.code} className="bg-amber-50/50 p-2 rounded-xl text-center border border-amber-100/50">
                    <div className="text-[9px] text-amber-600 font-bold mb-1">${s.label}</div>
                    <div className="text-sm font-bold text-gray-700">${s.val}</div>
                  </div>
                `)}
              </div>
            ` : html`
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 px-4 leading-relaxed">
                暂无数据，在指令行输入 <span className="font-mono font-bold text-amber-600">.coc</span> 抽取属性
              </div>
            `}
          </div>
        `}
      </div>
    </div>
  `;
};
export default CharacterSheet;
