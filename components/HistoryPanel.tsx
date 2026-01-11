import React from 'react';
import { Message, MessageType, Player } from '../types';

interface Props {
  history: Message[];
  currentUser: Player;
  onClear: () => void;
  onDeleteMessage: (id: string) => void;
  themeColor: string;
}

const HistoryPanel: React.FC<Props> = ({ history, currentUser, onClear, onDeleteMessage, themeColor }) => {
  return (
    <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white shadow-xl h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-black">会话日志</h2>
        {currentUser.isAdmin && (
          <button onClick={onClear} className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">清空</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {history.map((msg) => (
          <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-xl">
              {msg.playerAvatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{msg.playerName}</span>
                <span className="text-[9px] text-slate-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="bg-white/50 p-3 rounded-2xl border border-white/80 shadow-sm text-sm">
                {msg.type === MessageType.ROLL ? (
                  <div>
                    <div className="text-3xl font-black mb-1" style={{color: themeColor}}>{msg.rollData?.total}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{msg.rollData?.label} ({msg.rollData?.formula})</div>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
