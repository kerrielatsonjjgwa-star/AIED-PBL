import { Agent } from '../types';

export const AGENTS: Agent[] = [
  {
    id: 'aunt_zhang',
    name: '张大妈',
    role: '社区代表 / 原住民',
    description: '保守、情绪化、关注生活琐事（噪音、菜价、广场舞）。',
    avatar: '👵',
    publicStance: '优先保障生活品质：安静的夜晚、便利的菜价、熟人社区的稳定。',
    hiddenPreference: '更想要稳定的活动室与更亮的路灯，方便晚间活动。',
    evidenceIds: ['resident_petition', 'noise_complaints']
  },
  {
    id: 'ceo_li',
    name: '李总',
    role: '房地产开发商 / 投资人',
    description: '贪婪、理性、数据驱动、说话直接，关注 ROI 与回报。',
    avatar: '💼',
    publicStance: '只在回报率与退出路径清晰的情况下投资。',
    hiddenPreference: '比起多赚一点，更在意政策确定性与审批速度。',
    evidenceIds: ['developer_roi_sheet', 'investor_term_sheet']
  },
  {
    id: 'dr_chen',
    name: '陈博士',
    role: '环保与城市专家',
    description: '严谨、学术、重视长期风险（碳排放、热岛效应）。',
    avatar: '🎓',
    publicStance: '优先可持续与公共空间，并用低碳基础设施降低长期风险。',
    hiddenPreference: '要可量化指标与监测方案，不要口号。',
    evidenceIds: ['carbon_assessment', 'heat_island_report']
  },
  {
    id: 'gov_officer',
    name: '王科长',
    role: '政府审批',
    description: '程序导向、风险厌恶，强调合规、公共利益与预算可追溯。',
    avatar: '🧾',
    publicStance: '不满足用地合规、安全与预算可审计，坚决不批。',
    hiddenPreference: '偏好投诉少、风险低、审计留痕清晰的方案。',
    evidenceIds: ['zoning_guidelines', 'budget_audit_note']
  },
  {
    id: 'narrator',
    name: '系统旁白',
    role: '旁白',
    description: '推进时间线与播报事件。',
    avatar: '📢',
    publicStance: '推动流程与反馈。',
    hiddenPreference: '无',
    evidenceIds: []
  }
];
