
import React, { useState, useEffect, useRef } from 'react';

const CommandInput = ({ onCommand, themeColor }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onCommand(input.trim());
    setInput('');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 z-50">
      <div className="max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute inset-0 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] border border-amber-100 group-focus-within:border-amber-400 group-focus-within:ring-8 group-focus-within:ring-amber-50 transition-all duration-300"></div>
          <div className="relative flex items-center px-6 py-4">
            <span className="text-amber-400 terminal-text mr-4 font-bold text-lg select-none">›</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-gray-700 text-lg terminal-text placeholder:text-gray-300 font-medium"
              placeholder="输入指令..."
            />
            <button
              type="submit"
              className="ml-4 w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommandInput;
