export type MetricType = 'satisfaction' | 'economy' | 'environment';

export type GridCellType = 'residential' | 'factory' | 'park' | 'commercial' | 'empty';

export type AgentId = 'aunt_zhang' | 'ceo_li' | 'dr_chen' | 'gov_officer' | 'narrator';

export type GamePhase = 'investigation' | 'proposal' | 'approval' | 'simulation' | 'iteration' | 'ended';

export interface GridCell {
  id: string;
  x: number;
  y: number;
  type: GridCellType;
}

export interface Metrics {
  satisfaction: number;
  economy: number;
  environment: number;
}

export type EvidenceId =
  | 'resident_petition'
  | 'noise_complaints'
  | 'developer_roi_sheet'
  | 'investor_term_sheet'
  | 'carbon_assessment'
  | 'heat_island_report'
  | 'zoning_guidelines'
  | 'budget_audit_note';

export interface EvidenceDoc {
  id: EvidenceId;
  title: string;
  sourceAgentId: AgentId;
  summary: string;
  content: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  senderId: AgentId | 'user';
  senderName: string;
  channelId: AgentId;
  content: string;
  timestamp: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  timestamp: number;
}

export interface Agent {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  avatar: string;
  publicStance: string;
  hiddenPreference: string;
  evidenceIds: EvidenceId[];
}

export interface GameState {
  turn: number;
  maxTurns: number;
  budget: number;
  metrics: Metrics;
  phase: GamePhase;
  grid: GridCell[];
  lastSimulatedGrid: GridCell[];
  messages: ChatMessage[];
  news: NewsItem[];
  selectedAgentId: AgentId | null;
}
