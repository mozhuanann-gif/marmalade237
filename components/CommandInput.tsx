import React, { useState } from 'react';

interface Props {
  onCommand: (cmd: string) => void;
  themeColor: string;
}

const CommandInput: React.FC<Props> = ({ onCommand, themeColor }) => {
  const [val, setVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim()) {
      onCommand(val.trim());
      setVal('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="输入 .r 1d100 力量 进行检定..."
        className="w-full bg-white/90 backdrop-blur border-2 border-transparent focus:border-indigo-400 rounded-2xl px-6 py-4 font-bold shadow-lg outline-none transition-all"
      />
      <button 
        type="submit"
        className="absolute right-2 top-2 bottom-2 px-6 rounded-xl text-white font-black text-sm transition-transform active:scale-95"
        style={{backgroundColor: themeColor}}
      >
        发送
      </button>
    </form>
  );
};

export default CommandInput;
