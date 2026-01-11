import React, { useState } from 'react';
import { Player } from '../types';

const AVATARS = ['🕵️', '📚', '🔫', '🩺', '🕯️', '🧪', '🎩', '🔦'];

interface Props {
  onLogin: (p: Player) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200">
        <h1 className="text-2xl font-black text-center mb-8">进入猜猜乐跑团</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">你的角色名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
              placeholder="例如：夏洛克"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">选择形象</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-3 rounded-xl border-2 transition-all ${avatar === a ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-slate-50'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => name && onLogin({ name, avatar, email: name, isAdmin: name === 'KP' })}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
          >
            开始跑团
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
