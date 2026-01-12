
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // 使用 createElement 替代 <App /> 标签，确保 .js 文件在无编译环境下运行
  root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
}
