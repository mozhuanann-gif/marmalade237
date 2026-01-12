
export const rollDice = (formula = '1d100') => {
  let f = formula.toLowerCase().trim();
  // 处理 .r23 这种直接跟数字的情况
  if (/^\d+$/.test(f)) f = `1d${f}`;
  if (f.startsWith('d')) f = '1' + f;
  
  // 匹配 NdM+X 或 NdM-X 或 NdM
  const match = f.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  
  if (!match) {
    // 降级逻辑：如果只是纯数字，当做 1d[数字]
    if (/^\d+$/.test(f)) {
      const sides = parseInt(f);
      const r = Math.floor(Math.random() * sides) + 1;
      return { total: r, detail: `1d${sides}` };
    }
    return { total: Math.floor(Math.random() * 100) + 1, detail: '1d100' };
  }

  const count = parseInt(match[1]) || 1;
  const sides = parseInt(match[2]);
  const modifier = parseInt(match[3]) || 0;

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  total += modifier;

  const detail = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;
  return { total, detail };
};

export const getSuccessLevel = (roll, target) => {
  if (roll === 1) return 'CRITICAL';
  if (roll === 100) return 'FUMBLE';
  if (target < 50 && roll >= 96) return 'FUMBLE';
  
  if (roll <= Math.floor(target / 5)) return 'EXTREME';
  if (roll <= Math.floor(target / 2)) return 'HARD';
  if (roll <= target) return 'SUCCESS';
  
  return 'FAILURE';
};

export const generateCoCAttributes = () => {
  const r3d6 = () => (rollDice('3d6').total) * 5;
  const r2d6 = () => (rollDice('2d6+6').total) * 5;
  const pow = r3d6();
  return { 
    STR: r3d6(), CON: r3d6(), DEX: r3d6(), APP: r3d6(), 
    POW: pow, LUCK: r3d6(), SIZ: r2d6(), INT: r2d6(), 
    EDU: r2d6(), SAN: pow 
  };
};

export const parseDeck = (template) => {
  let result = template.replace(/\[(.*?)\]/g, (match, contents) => {
    const choices = contents.split(',').map(s => s.trim());
    return choices[Math.floor(Math.random() * choices.length)];
  });
  return result.replace(/(\d*d\d+([+-]\d+)?)/gi, (match) => rollDice(match).total.toString());
};

export const getJrrp = (email) => {
  const today = new Date().toISOString().split('T')[0];
  let hash = 0;
  const seed = today + email;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  return Math.abs(hash % 100) + 1;
};
