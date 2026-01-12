
import React, { useState, useRef } from 'react';
import { AVATARS, ADMIN_EMAIL } from '../constants.js';

const Login = ({ onLogin, bannedEmails }) => {
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatar(ev.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !nickname) {
      setError('请填入所有信息');
      return;
    }
    if (bannedEmails.includes(email)) {
      setError('此邮箱已被封禁');
      return;
    }

    onLogin({
      email,
      nickname,
      avatar,
      isKP: email === ADMIN_EMAIL
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBEB]">
      <div className="absolute top-20 left-20 w-64 h-64 bg-amber-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30"></div>

      <div className="relative bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(245,158,11,0.1)] w-full max-w-md border border-amber-50 animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <div className="inline-block p-4 bg-amber-50 rounded-2xl mb-4">
            <span className="text-4xl">🎏</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">锦鲤终端</h1>
          <p className="text-amber-500 text-sm font-medium mt-1 uppercase tracking-widest">Investigator Terminal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="group">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">电子邮箱 / 凭证</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all text-gray-700"
                placeholder="email@example.com"
              />
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-tighter">调查员昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-50 outline-none transition-all text-gray-700"
                placeholder="你的称呼"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-3 uppercase tracking-tighter">调查员形象</label>
            <div className="flex flex-wrap gap-3 justify-between items-center bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
              <div className="flex gap-2">
                {AVATARS.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="avatar"
                    onClick={() => setAvatar(url)}
                    className={`w-10 h-10 rounded-xl cursor-pointer transition-all ${avatar === url ? 'ring-2 ring-amber-500 scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white border border-gray-100 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 transition-all"
              >
                上传本地
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold italic">{error}</p>}

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all active:scale-95 mt-4"
          >
            开启锦鲤旅程
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
