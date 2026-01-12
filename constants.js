
export const ADMIN_EMAIL = '237';

export const DEFAULT_CONFIG = {
  themeColor: '#F59E0B',
  backgroundImage: '', 
  logoImage: '',
  isWhiteMode: true,
  bannedEmails: [],
  templates: {
    CRITICAL: '✨ {user} 掷出了 {roll}！大成功！锦鲤附体！',
    EXTREME: '🔥 {user} 掷出了 {roll}！极难成功！',
    HARD: '💎 {user} 掷出了 {roll}！困难成功！',
    SUCCESS: '✅ {user} 掷出了 {roll}！成功！',
    FAILURE: '❌ {user} 掷出了 {roll}！失败。',
    FUMBLE: '💀 {user} 掷出了 {roll}！大失败！厄运降临...',
    'jrrp': '🎏 {user} 今日的锦鲤值是：{roll}',
    'sc_success': '🧠 {user} 理智检定成功！损失 {loss} 点理智。当前：{current}',
    'sc_failure': '🌑 {user} 理智检定失败！损失 {loss} 点理智。当前：{current}',
    'coc_gen': '📜 {user} 抽取了一组锦鲤属性：\n{attributes}',
    'draw': '🃏 {user} 抽到了：{result}',
    'rh_notify': '🔒 {user} 进行了一次暗骰。'
  }
};

export const AVATARS = [
  'https://api.dicebear.com/7.x/shapes/svg?seed=koi1&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/shapes/svg?seed=koi2&backgroundColor=fbbf24',
  'https://api.dicebear.com/7.x/shapes/svg?seed=koi3&backgroundColor=f97316',
  'https://api.dicebear.com/7.x/shapes/svg?seed=koi4&backgroundColor=fef3c7',
  'https://api.dicebear.com/7.x/shapes/svg?seed=koi5&backgroundColor=fffbeb'
];
