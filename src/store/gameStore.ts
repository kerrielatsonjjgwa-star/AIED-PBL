import { create } from 'zustand';
import { GameState, GridCell, GridCellType, AgentId, GamePhase, Metrics, ChatMessage, NewsItem } from '../types';
import { createId } from '../utils/id';

interface GameActions {
  setPhase: (phase: GamePhase) => void;
  updateGridCell: (id: string, newType: GridCellType) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMetrics: (delta: Partial<Metrics>) => void;
  updateBudget: (delta: number) => void;
  nextTurn: () => void;
  setSelectedAgent: (agentId: AgentId | null) => void;
  addNews: (news: Omit<NewsItem, 'id' | 'timestamp'>) => void;
  commitSimulationSnapshot: () => void;
  resetGame: () => void;
}

const INITIAL_METRICS: Metrics = {
  satisfaction: 40,
  economy: 30,
  environment: 30,
};

const INITIAL_BUDGET = 1000;
const MAX_TURNS = 5;

const generateInitialGrid = (): GridCell[] => {
  const grid: GridCell[] = [];
  const size = 5;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let type: GridCellType = 'empty';
      if (y === 0) type = 'residential';
      if (y === 1 && x < 3) type = 'residential';
      if (y === 4 && x === 4) type = 'factory';
      if (x === 2 && y === 2) type = 'park';

      grid.push({
        id: `${x}-${y}`,
        x,
        y,
        type,
      });
    }
  }
  return grid;
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  turn: 1,
  maxTurns: MAX_TURNS,
  budget: INITIAL_BUDGET,
  metrics: INITIAL_METRICS,
  phase: 'investigation',
  grid: generateInitialGrid(),
  lastSimulatedGrid: generateInitialGrid(),
  messages: [],
  news: [],
  selectedAgentId: null,

  setPhase: (phase) => set({ phase }),
  
  updateGridCell: (id, newType) => set((state) => ({
    grid: state.grid.map((cell) => cell.id === id ? { ...cell, type: newType } : cell)
  })),

  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: createId(),
        timestamp: Date.now(),
        ...message,
      }
    ]
  })),

  updateMetrics: (delta) => set((state) => ({
    metrics: {
      satisfaction: Math.max(0, Math.min(100, state.metrics.satisfaction + (delta.satisfaction || 0))),
      economy: Math.max(0, Math.min(100, state.metrics.economy + (delta.economy || 0))),
      environment: Math.max(0, Math.min(100, state.metrics.environment + (delta.environment || 0))),
    }
  })),

  updateBudget: (delta) => set((state) => ({
    budget: state.budget + delta
  })),

  nextTurn: () => set((state) => {
    const newTurn = state.turn + 1;
    return {
      turn: newTurn,
      phase: newTurn > state.maxTurns ? 'ended' : 'investigation',
    };
  }),

  setSelectedAgent: (agentId) => set({ selectedAgentId: agentId }),

  addNews: (news) => set((state) => ({
    news: [
      {
        id: createId(),
        timestamp: Date.now(),
        ...news,
      },
      ...state.news
    ]
  })),

  commitSimulationSnapshot: () => set((state) => ({
    lastSimulatedGrid: state.grid,
  })),

  resetGame: () => set({
    turn: 1,
    budget: INITIAL_BUDGET,
    metrics: INITIAL_METRICS,
    phase: 'investigation',
    grid: generateInitialGrid(),
    lastSimulatedGrid: generateInitialGrid(),
    messages: [],
    news: [],
    selectedAgentId: null,
  })
}));
