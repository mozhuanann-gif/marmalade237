
import { DEFAULT_CONFIG } from '../constants.js';

const STORAGE_KEY = 'coc_terminal_v1';

export const saveState = (state) => {
  const currentState = loadState();
  const newState = { ...currentState, ...state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  window.dispatchEvent(new Event('storage_update'));
};

export const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      history: [],
      decks: [],
      config: DEFAULT_CONFIG,
      users: []
    };
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return {
      history: [],
      decks: [],
      config: DEFAULT_CONFIG,
      users: []
    };
  }
};

export const deleteMessage = (id) => {
  const state = loadState();
  state.history = state.history.filter(m => m.id !== id);
  saveState(state);
};
