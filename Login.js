
import React from 'react';
import htm from 'htm';
import { AVATARS, ADMIN_EMAIL } from './constants.js';

const html = htm.bind(React.createElement);

const Login = ({ onLogin, bannedEmails }) => {
  const [email, setEmail] = React.useState('');
  const [nickname, setNickname] = React.useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (bannedEmails.includes(email)) return alert('已封禁');
    onLogin({ email, nickname, avatar: AVATARS[0], isKP: email === ADMIN_EMAIL });
  };

  return html`
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <form onSubmit=${handleLogin} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">进入锦鲤终端</h1>
        <input className="w-full p-4 mb-4 bg-gray-50 rounded-xl" placeholder="邮箱" value=${email} onChange=${e => setEmail(e.target.value)} />
        <input className="w-full p-4 mb-8 bg-gray-50 rounded-xl" placeholder="昵称" value=${nickname} onChange=${e => setNickname(e.target.value)} />
        <button className="w-full py-4 bg-amber-500 text-white font-bold rounded-xl shadow-lg">登录</button>
      </form>
    </div>
  `;
};
export default Login;
