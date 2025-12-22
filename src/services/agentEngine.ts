import { AgentId, EvidenceId, GameState, GridCell } from '../types';
import { AGENTS } from '../data/agents';
import { getEvidenceByIds } from '../data/evidence';
import { callLLM, LLMMessage } from './llm';
import { weightsByType } from './simulation';

export interface AgentReply {
  content: string;
  evidenceIds: EvidenceId[];
}

const agentById = (id: AgentId) => {
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) throw new Error(`Unknown agent: ${id}`);
  return agent;
};

// Keep keyword-based evidence picking for reliability, but we could also ask LLM.
// For now, let's use this to "suggest" evidence to the LLM to include in its response.
const pickEvidence = (agentId: AgentId, userText: string): EvidenceId[] => {
  const agent = agentById(agentId);
  const t = userText.toLowerCase();

  if (agentId === 'aunt_zhang') {
    if (t.includes('噪') || t.includes('noise') || t.includes('扰民')) return ['noise_complaints'];
    return ['resident_petition'];
  }
  if (agentId === 'ceo_li') {
    if (t.includes('roi') || t.includes('回报') || t.includes('投资') || t.includes('收益')) return ['developer_roi_sheet'];
    return ['investor_term_sheet'];
  }
  if (agentId === 'dr_chen') {
    if (t.includes('热岛') || t.includes('高温') || t.includes('健康')) return ['heat_island_report'];
    return ['carbon_assessment'];
  }
  if (agentId === 'gov_officer') {
    if (t.includes('预算') || t.includes('审计') || t.includes('招标')) return ['budget_audit_note'];
    return ['zoning_guidelines'];
  }

  return [];
};

const summarizeContext = (state: GameState) => {
  const { satisfaction, economy, environment } = state.metrics;
  return `当前游戏状态：满意度${satisfaction}，经济${economy}，环境${environment}；剩余预算${state.budget}k；当前回合${state.turn}/${state.maxTurns}。`;
};

export const generateAgentReply = async (agentId: AgentId, userText: string, state: GameState): Promise<AgentReply> => {
  const agent = agentById(agentId);
  const evidenceIds = pickEvidence(agentId, userText);
  const evidence = getEvidenceByIds(evidenceIds);
  
  // Construct prompt
  const systemPrompt = `你正在扮演一个城市改造模拟游戏中的角色。
你的名字：${agent.name}
你的身份：${agent.role}
你的性格描述：${agent.description}
你的公开立场：${agent.publicStance}
你的隐性偏好（只有你自己知道）：${agent.hiddenPreference}

${summarizeContext(state)}

请根据玩家（城市规划师）的输入，以你的角色口吻进行回复。
回复要求：
1. 必须符合你的人设，语气要像${agent.name}。
2. 结合当前的游戏指标（如预算紧张、满意度低等）进行吐槽或建议。
3. 如果有相关的“证据文件”可以提供，请在回复中自然地提到它们。
   本回合你手边可用的证据文件有：${evidence.map(e => `《${e.title}》（摘要：${e.summary}）`).join('、')}。
   如果你觉得合适，请明确告诉玩家“我可以提供《xxx》给你看”。
4. 回复长度控制在100字以内。
`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userText }
  ];

  try {
    const content = await callLLM(messages);
    return {
      content: content || `${agent.name}: (沉默中...)`,
      evidenceIds
    };
  } catch (e) {
    console.error("LLM Error", e);
    return {
      content: `${agent.name}: (系统繁忙，请稍后再试)`,
      evidenceIds: []
    };
  }
};

export interface ApprovalResult {
  approved: boolean;
  reasons: string[];
  requiredEvidenceIds: EvidenceId[];
}

// Calculate projected budget cost from grid changes
const calculateProjectedCost = (currentGrid: GridCell[], lastGrid: GridCell[]) => {
    let cost = 0;
    // Map of cell ID to type
    const lastMap = new Map(lastGrid.map(c => [c.id, c.type]));
    
    for (const cell of currentGrid) {
        const lastType = lastMap.get(cell.id);
        if (lastType && lastType !== cell.type) {
             // Change detected.
             // If building new (not empty), add cost (negative budget)
             // If demolishing (to empty), add refund/small cost (positive budget)
             if (cell.type !== 'empty') {
                 cost += Math.abs(weightsByType[cell.type].budget);
             } else {
                 // Demolition cost is small refund in this model
                 cost -= weightsByType['empty'].budget; 
             }
        }
    }
    return cost; // Positive number representing expense
};

export const evaluateApproval = async (strategyText: string, state: GameState): Promise<ApprovalResult> => {
  // 1. Hard Constraints Check (Rule-based)
  const reasons: string[] = [];
  
  // Constraint A: Budget
  const projectedCost = calculateProjectedCost(state.grid, state.lastSimulatedGrid);
  if (state.budget - projectedCost < 0) {
      reasons.push(`预算不足：当前方案预计花费 ${projectedCost}k，但剩余预算仅 ${state.budget}k。请减少建设或拆除项目。`);
  }

  // Constraint B: Residential Count (Cannot decrease)
  const currentResidential = state.grid.filter(c => c.type === 'residential').length;
  const initialResidential = state.lastSimulatedGrid.filter(c => c.type === 'residential').length; // Or initial grid
  // Note: strict rule says "cannot decrease", but maybe we compare to start of turn?
  // Let's compare to lastSimulatedGrid (start of turn).
  if (currentResidential < initialResidential) {
      reasons.push(`违反红线：居民区数量不得减少（当前${currentResidential}，原有${initialResidential}）。请恢复居民区或选择其他区域改造。`);
  }

  // If hard constraints fail, return immediately without LLM cost
  if (reasons.length > 0) {
      return {
          approved: false,
          reasons,
          requiredEvidenceIds: ['budget_audit_note', 'resident_petition']
      };
  }

  // 2. Soft Constraints Check (LLM) - RELAXED
  const systemPrompt = `你是一名政府审批官员（王科长）。请根据以下策略陈述，判断是否批准该城市改造方案进入下一阶段。

审批标准（仅作为参考，无需过度死扣字眼）：
1. **合理性**：方案是否有清晰的逻辑？（例如：建公园是为了环境，建工厂是为了经济）
2. **完整性**：策略陈述是否大致解释了地图上的变动？

如果玩家的陈述完全为空、胡言乱语或明显反人类（如“把所有人都赶走”），请拒绝。
否则，只要玩家表达了合理的规划意图，请**批准**通过。我们鼓励玩家在实践中学习，不要在文书上过于刁难。

请以 JSON 格式返回结果：
{
  "approved": boolean, // 是否批准
  "reasons": string[], // 评价或拒绝理由
  "missing_points": string[] // 建议补充的点（可选）
}
`;

  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `策略陈述：${strategyText}` }
  ];

  try {
    const content = await callLLM(messages, 0.1, true); // Use JSON mode if supported or low temp
    const result = JSON.parse(content);
    
    // Map missing points to evidence IDs (Optional help)
    const requiredEvidenceIds: EvidenceId[] = [];
    if (result.missing_points) {
        if (result.missing_points.some((p: string) => p.includes('compliance'))) requiredEvidenceIds.push('zoning_guidelines');
        if (result.missing_points.some((p: string) => p.includes('risk'))) requiredEvidenceIds.push('noise_complaints');
    }

    return {
      approved: result.approved,
      reasons: result.reasons || ['审批通过。'],
      requiredEvidenceIds
    };

  } catch (e) {
    console.error("Approval LLM Error", e);
    // Fallback to local logic - Relaxed
    if (strategyText.length < 5) {
        return {
            approved: false,
            reasons: ['策略陈述过于简短，请简要描述你的规划意图。'],
            requiredEvidenceIds: []
        };
    }
    
    return {
        approved: true,
        reasons: ['人工复核通过（系统连线中断）。'],
        requiredEvidenceIds: []
    };
  }
};
