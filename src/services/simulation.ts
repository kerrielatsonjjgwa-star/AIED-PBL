import { GridCell, GridCellType, Metrics } from '../types';
import { callLLM, LLMMessage } from './llm';

export interface SimulationInput {
  currentGrid: GridCell[];
  lastSimulatedGrid: GridCell[];
  strategyText: string;
}

export interface SimulationOutput {
  metricDelta: Partial<Metrics>;
  budgetDelta: number;
  narrative: string;
  news: Array<{ title: string; content: string; sentiment: 'positive' | 'negative' | 'neutral' }>;
}

const countByType = (grid: GridCell[]): Record<GridCellType, number> => {
  const counts: Record<GridCellType, number> = {
    residential: 0,
    factory: 0,
    park: 0,
    commercial: 0,
    empty: 0,
  };

  for (const cell of grid) counts[cell.type] += 1;
  return counts;
};

// Export weights for UI previews
export const weightsByType: Record<
  GridCellType,
  { satisfaction: number; economy: number; environment: number; budget: number; label: string }
> = {
  residential: { satisfaction: 2, economy: 0, environment: -1, budget: -15, label: '居民区' },
  factory: { satisfaction: -2, economy: 3, environment: -3, budget: -25, label: '工厂' },
  park: { satisfaction: 2, economy: 0, environment: 4, budget: -30, label: '公园' },
  commercial: { satisfaction: -1, economy: 4, environment: -2, budget: -35, label: '商业区' },
  empty: { satisfaction: -1, economy: -1, environment: 0, budget: 5, label: '空地' }, // Demolition refunds a bit
};

const clampDelta = (n: number) => Math.max(-15, Math.min(15, n));

const strategyHeuristics = (text: string): Partial<Metrics> => {
  const t = text.toLowerCase();
  let satisfaction = 0;
  let economy = 0;
  let environment = 0;

  if (t.includes('noise') || t.includes('噪') || t.includes('扰民')) satisfaction += 2;
  if (t.includes('elder') || t.includes('养老') || t.includes('无障碍') || t.includes('老年')) satisfaction += 2;
  if (t.includes('roi') || t.includes('招商') || t.includes('创业') || t.includes('就业')) economy += 2;
  if (t.includes('carbon') || t.includes('碳') || t.includes('热岛') || t.includes('绿地') || t.includes('透水'))
    environment += 2;

  return { satisfaction, economy, environment };
};

export const runSimulation = async (input: SimulationInput): Promise<SimulationOutput> => {
  const current = countByType(input.currentGrid);
  const previous = countByType(input.lastSimulatedGrid);

  const deltaCounts: Record<GridCellType, number> = {
    residential: current.residential - previous.residential,
    factory: current.factory - previous.factory,
    park: current.park - previous.park,
    commercial: current.commercial - previous.commercial,
    empty: current.empty - previous.empty,
  };

  let satisfaction = 0;
  let economy = 0;
  let environment = 0;
  let budget = -10; // Operating cost per turn

  for (const [type, delta] of Object.entries(deltaCounts) as Array<[GridCellType, number]>) {
    const w = weightsByType[type];
    if (delta > 0) {
      // New construction
      satisfaction += delta * w.satisfaction;
      economy += delta * w.economy;
      environment += delta * w.environment;
      budget += delta * w.budget;
    } else if (delta < 0) {
      // Demolition/Removal (reverse impact, but maybe cost is sunk)
      // Simplification: Removing factory improves environment, removes economy gain
      satisfaction -= delta * w.satisfaction; // e.g. -(-2) = +2
      economy -= delta * w.economy;
      environment -= delta * w.environment;
      budget += delta * 5; // Demolition cost is small (simulated as small refund relative to build)
    }
  }

  const heuristic = strategyHeuristics(input.strategyText);
  satisfaction += heuristic.satisfaction ?? 0;
  economy += heuristic.economy ?? 0;
  environment += heuristic.environment ?? 0;

  const metricDelta: Partial<Metrics> = {
    satisfaction: clampDelta(satisfaction),
    economy: clampDelta(economy),
    environment: clampDelta(environment),
  };

  // Generate Narrative & News via LLM
  let narrative = `本回合变更对指标的影响（可复现）：满意度 ${metricDelta.satisfaction ?? 0}，` +
    `经济 ${metricDelta.economy ?? 0}，环境 ${metricDelta.environment ?? 0}；预算变化 ${budget}。`;
  
  const news: SimulationOutput['news'] = [];

  const systemPrompt = `你是一个城市规划模拟器的解说员。请根据模拟器计算出的指标变化数据，生成一段生动的新闻简报和总结。

**输入数据**：
1. 区域变更：
   - 住宅变动：${deltaCounts.residential}
   - 工厂变动：${deltaCounts.factory}
   - 公园变动：${deltaCounts.park}
   - 商业变动：${deltaCounts.commercial}
2. 指标变化（Delta）：
   - 满意度：${metricDelta.satisfaction}
   - 经济：${metricDelta.economy}
   - 环境：${metricDelta.environment}
3. 玩家策略：${input.strategyText || "无额外策略"}

**输出要求（JSON格式）**：
{
  "narrative": "一段简短的总结，解释为什么指标会发生这些变化（例如：‘拆除了工厂虽然改善了环境，但短期内影响了就业…’）。不超过80字。",
  "news": [
    { "title": "新闻标题1", "content": "新闻内容", "sentiment": "positive" | "negative" | "neutral" },
    { "title": "新闻标题2", "content": "新闻内容", "sentiment": "positive" | "negative" | "neutral" }
  ]
}
生成两条新闻：一条关注民生/舆情，一条关注经济/政策。
`;

  const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt }
  ];

  try {
      const content = await callLLM(messages, 0.7, true);
      const result = JSON.parse(content);
      if (result.narrative) narrative = result.narrative;
      if (result.news && Array.isArray(result.news)) {
          // Validate sentiment
          result.news.forEach((n: any) => {
              if (!['positive', 'negative', 'neutral'].includes(n.sentiment)) n.sentiment = 'neutral';
              news.push(n);
          });
      }
  } catch (e) {
      console.error("Simulation LLM Error", e);
      // Fallback logic
      if ((metricDelta.economy ?? 0) >= 5) {
        news.push({
          title: '资本市场信心回升',
          content: '投资者认为改造计划具备产业带动潜力。',
          sentiment: 'positive',
        });
      }
      if ((metricDelta.satisfaction ?? 0) <= -5) {
        news.push({
          title: '居民舆情升温',
          content: '部分居民对施工扰民与搬迁安排表达担忧。',
          sentiment: 'negative',
        });
      }
      if (news.length === 0) {
        news.push({
          title: '改造推进中',
          content: '计划进入执行阶段，影响尚在发酵。',
          sentiment: 'neutral',
        });
      }
  }

  return { metricDelta, budgetDelta: budget, narrative, news };
};
