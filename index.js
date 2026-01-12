
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  // 使用纯 JS 方式启动 App
  root.render(React.createElement(React.StrictMode, null, React.createElement(App)));
}
