
import React, { useState } from 'react';
import htm from 'htm';
import { AVATARS, ADMIN_EMAIL } from './constants.js';

const html = htm.bind(React.createElement);

const Login = ({ onLogin, onJoinRoom, bannedEmails }) => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (bannedEmails && bannedEmails.includes(email)) return alert('该凭证已被封禁');
    
    const user = { 
      email, 
      nickname, 
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], 
      isKP: email === ADMIN_EMAIL 
    };

    if (roomId && !user.isKP) {
      onJoinRoom(roomId.toUpperCase().trim());
    }
    onLogin(user);
  };

  return html`
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB] p-6">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-amber-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
      </div>
      
      <form onSubmit=${handleLogin} className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-amber-50 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-amber-50 rounded-3xl mb-4 text-4xl">🎏</div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">锦鲤终端 <span className="text-amber-500 font-mono text-sm ml-1 italic">LIVE</span></h1>
          <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-widest font-black">Investigator Access Point</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">凭证 / 邮箱</label>
            <input className="w-full p-4 mt-1 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-amber-400 transition-all text-sm" placeholder="yourname@koi.com" value=${email} onChange=${e => setEmail(e.target.value)} required />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">调查员称呼</label>
            <input className="w-full p-4 mt-1 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-amber-400 transition-all text-sm" placeholder="输入你的显示名称" value=${nickname} onChange=${e => setNickname(e.target.value)} required />
          </div>

          ${email !== ADMIN_EMAIL && html`
            <div className="pt-2 animate-in slide-in-from-top-2 duration-500">
              <label className="text-[10px] font-bold text-amber-500 uppercase ml-2 tracking-widest">联机房号 (可选)</label>
              <input className="w-full p-4 mt-1 bg-amber-50/50 border border-amber-100 rounded-2xl outline-none focus:border-amber-400 transition-all text-sm font-mono font-black placeholder:font-normal" placeholder="例如: KOI-1234" value=${roomId} onChange=${e => setRoomId(e.target.value)} />
              <p className="text-[9px] text-amber-400/60 mt-2 ml-2 italic">※ 留空则进入单机探索模式</p>
            </div>
          `}
        </div>

        <button className="w-full py-5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-xl shadow-amber-200 transition-all active:scale-95 mt-8">
          ${email === ADMIN_EMAIL ? '开启守秘人控制台' : '同步数据并接入'}
        </button>
        
        <div className="flex items-center justify-center gap-2 mt-8 opacity-20">
          <div className="h-[1px] w-8 bg-gray-400"></div>
          <span className="text-[9px] font-black uppercase tracking-widest">WebRTC Secure P2P</span>
          <div className="h-[1px] w-8 bg-gray-400"></div>
        </div>
      </form>
    </div>
  `;
};
export default Login;
