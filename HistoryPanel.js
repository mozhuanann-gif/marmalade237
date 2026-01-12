
import React, { useRef, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const HistoryPanel = ({ history, currentUser, onDelete }) => {
  const listEndRef = useRef(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return html`
    <div className="flex-1 overflow-y-auto pt-32 pb-40 px-6 space-y-8">
      ${history.length === 0 ? html`
        <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
          <span className="text-8xl mb-4">🎏</span>
          <p className="font-bold tracking-[1em] text-gray-400">锦鲤祈愿</p>
        </div>
      ` : history.map((msg) => {
        const isMe = currentUser && msg.userId === currentUser.email;
        const isVisible = !msg.isHidden || (currentUser && (currentUser.isKP || isMe));
        if (!isVisible) return null;

        return html`
          <div key=${msg.id} className=${`flex group max-w-4xl mx-auto ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
            <img src=${msg.userAvatar} className="w-12 h-12 rounded-2xl shadow-sm object-cover flex-shrink-0 border border-white" />
            <div className=${`mx-4 space-y-1 ${isMe ? 'text-right' : 'text-left'} flex-1`}>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold px-1 uppercase tracking-tighter">
                ${isMe && html`<span className="text-amber-500">You</span>`}
                <span>${msg.userNickname}</span>
                <span className="font-normal opacity-50">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                ${currentUser?.isKP && html`
                  <button onClick=${() => onDelete(msg.id)} className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 p-1">Delete</button>
                `}
              </div>
              <div className=${`relative px-5 py-4 rounded-2xl inline-block max-w-[85%] text-sm leading-relaxed ${isMe ? 'bg-amber-50 text-gray-800 rounded-tr-none border border-amber-100' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'}`}>
                ${msg.command && html`<div className="text-[10px] text-amber-500/50 mb-2 border-b border-amber-500/10 pb-1 font-mono italic">${msg.command}</div>`}
                <div className="whitespace-pre-wrap font-medium">${msg.content}</div>
                ${msg.isHidden && html`<div className="mt-2 pt-2 border-t border-red-50 text-[10px] font-bold text-red-400 uppercase">🔒 Hidden Roll (KP Visible)</div>`}
              </div>
            </div>
          </div>
        `;
      })}
      <div ref=${listEndRef} />
    </div>
  `;
};
export default HistoryPanel;
