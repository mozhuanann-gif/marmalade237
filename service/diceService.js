
export const rollDice = (formula = '1d100') => {
  let f = formula.toLowerCase().trim();
  if (f.startsWith('d')) f = '1' + f;
  
  const match = f.match(/(\d+)d(\d+)([+-]\d+)?/);
  if (!match) return { total: Math.floor(Math.random() * 100) + 1, detail: '1d100' };

  const count = parseInt(match[1]) || 1;
  const sides = parseInt(match[2]);
  const modifier = parseInt(match[3]) || 0;

  let total = 0;
  const rolls = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * sides) + 1;
    rolls.push(r);
    total += r;
  }
  total += modifier;

  const detail = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;
  return { total, detail };
};

export const getSuccessLevel = (roll, target) => {
  if (roll === 1) return 'CRITICAL';
  if (roll === 100) return 'FUMBLE';
  if (roll >= 96 && target < 50) return 'FUMBLE';
  
  if (roll <= Math.floor(target / 5)) return 'EXTREME';
  if (roll <= Math.floor(target / 2)) return 'HARD';
  if (roll <= target) return 'SUCCESS';
  
  return 'FAILURE';
};

export const generateCoCAttributes = () => {
  const roll3d6x5 = () => (rollDice('3d6').total) * 5;
  const roll2d6plus6x5 = () => (rollDice('2d6+6').total) * 5;

  const pow = roll3d6x5();
  return {
    STR: roll3d6x5(),
    CON: roll3d6x5(),
    DEX: roll3d6x5(),
    APP: roll3d6x5(),
    POW: pow,
    LUCK: roll3d6x5(),
    SIZ: roll2d6plus6x5(),
    INT: roll2d6plus6x5(),
    EDU: roll2d6plus6x5(),
    SAN: pow
  };
};

export const parseDeck = (template) => {
  // 1. Resolve choice brackets: [A, B, C]
  let result = template.replace(/\[(.*?)\]/g, (match, contents) => {
    const choices = contents.split(',').map(s => s.trim());
    const picked = choices[Math.floor(Math.random() * choices.length)];
    return picked;
  });

  // 2. Resolve dice rolls inside the text
  result = result.replace(/(\d*d\d+([+-]\d+)?)/gi, (match) => {
    return rollDice(match).total.toString();
  });

  return result;
};

export const getJrrp = (email) => {
  const today = new Date().toISOString().split('T')[0];
  const seed = today + email;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 100) + 1;
};
