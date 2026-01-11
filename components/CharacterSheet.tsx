import React from 'react';
import { CharacterStat } from '../types';

interface Props {
  stats: CharacterStat[];
  onUpdateStat: (id: string, value: number) => void;
  onCheckStat: (stat: CharacterStat) => void;
  themeColor: string;
}

const CharacterSheet: React.FC<Props> = ({ stats, onUpdateStat, onCheckStat, themeColor }) => {
  return (
    <div className="bg-white/80 backdrop-blur p-6 rounded-3xl border border-white shadow-xl">
      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        <span style={{color: themeColor}}>👤</span> 调查员档案
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.name}</span>
              <button onClick={() => onCheckStat(stat)} className="text-xs hover:scale-125 transition-transform">🎲</button>
            </div>
            <input
              type="number"
              value={stat.value}
              onChange={(e) => onUpdateStat(stat.id, parseInt(e.target.value) || 0)}
              className="w-full bg-transparent text-xl font-black focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CharacterSheet;
