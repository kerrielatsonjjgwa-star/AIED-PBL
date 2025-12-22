import { EvidenceDoc, EvidenceId } from '../types';

export const EVIDENCE_DOCS: EvidenceDoc[] = [
  {
    id: 'resident_petition',
    title: '居民联名请愿书（老榕树街区）',
    sourceAgentId: 'aunt_zhang',
    summary: '主要诉求：保留熟人社区、增加活动空间、改善照明与治安。',
    content:
      '请愿要点：\n' +
      '1) 施工期间控制夜间噪音与扬尘；\n' +
      '2) 保留部分老住宅与原住民回迁保障；\n' +
      '3) 建设社区活动中心/广场舞场地；\n' +
      '4) 增加路灯、无障碍设施与公共厕所；\n' +
      '5) 生活配套（菜市/小超市）不要被完全替代为高端商业。\n',
    tags: ['satisfaction', 'social', 'accessibility'],
  },
  {
    id: 'noise_complaints',
    title: '噪音与扰民投诉记录（近12个月）',
    sourceAgentId: 'aunt_zhang',
    summary: '投诉集中在夜间施工、货车鸣笛与临街餐饮油烟。',
    content:
      '统计摘要：\n' +
      '- 夜间噪音投诉占比 52%；\n' +
      '- 扬尘与道路占用占比 27%；\n' +
      '- 餐饮油烟与垃圾占比 21%；\n' +
      '建议：施工时段限制、噪声屏障、物流路线优化、油烟净化设备。\n',
    tags: ['satisfaction', 'environment', 'risk'],
  },
  {
    id: 'developer_roi_sheet',
    title: '开发商收益测算表（ROI/IRR摘要）',
    sourceAgentId: 'ceo_li',
    summary: '商业/办公增加可显著拉动经济，但对审批速度敏感。',
    content:
      '核心假设：\n' +
      '- 新增可租赁面积越高，经济活力越强；\n' +
      '- 若审批延迟超过 2 个回合，投资回报下降明显；\n' +
      '- 配套公共空间可降低舆情风险（间接提升入住/出租）。\n',
    tags: ['economy', 'budget', 'risk'],
  },
  {
    id: 'investor_term_sheet',
    title: '投资意向条款（Term Sheet 摘要）',
    sourceAgentId: 'ceo_li',
    summary: '附带条件：政策稳定、公共沟通机制、资金拨付节点。',
    content:
      '关键条款：\n' +
      '1) 政策与容积率边界明确；\n' +
      '2) 设立“社区沟通与投诉响应机制”；\n' +
      '3) 分阶段拨付：审批通过后释放首期资金；\n' +
      '4) 若出现重大环保违规或群体性事件，资金可暂停。\n',
    tags: ['economy', 'governance', 'risk'],
  },
  {
    id: 'carbon_assessment',
    title: '碳排放与能耗评估（基线+改造情景）',
    sourceAgentId: 'dr_chen',
    summary: '绿地与公共交通改善对长期环境指标贡献最大。',
    content:
      '结论摘要：\n' +
      '- 增加绿地与透水铺装可降低热岛效应；\n' +
      '- 旧厂房改造为创业园区时需配套能效提升；\n' +
      '- 高强度开发将提高交通与能耗压力。\n',
    tags: ['environment', 'metrics', 'long_term'],
  },
  {
    id: 'heat_island_report',
    title: '热岛效应监测简报（夏季高温周）',
    sourceAgentId: 'dr_chen',
    summary: '硬化地面比例高的区域体感温度更高，老年人风险突出。',
    content:
      '要点：\n' +
      '- 老年人活动高峰与高温重叠；\n' +
      '- 树荫、风廊与小微绿地可显著改善体感；\n' +
      '- 需保留通风廊道，避免“密不透风”的街谷。\n',
    tags: ['environment', 'health', 'satisfaction'],
  },
  {
    id: 'zoning_guidelines',
    title: '用地与审批指引（摘录版）',
    sourceAgentId: 'gov_officer',
    summary: '强调合规边界：用地性质、公共空间比例、消防与无障碍。',
    content:
      '合规清单（摘录）：\n' +
      '1) 公共空间比例不低于阈值；\n' +
      '2) 消防通道、疏散与建筑间距要求；\n' +
      '3) 无障碍连续性与老年友好设施；\n' +
      '4) 建设资金来源与预算可追溯。\n',
    tags: ['governance', 'compliance', 'risk'],
  },
  {
    id: 'budget_audit_note',
    title: '预算审计关注点备忘录',
    sourceAgentId: 'gov_officer',
    summary: '预算需可复核：单项成本、采购方式、阶段节点。',
    content:
      '审计关注点：\n' +
      '- 单项成本需要明细；\n' +
      '- 采购与招投标过程留痕；\n' +
      '- 阶段性验收与拨款挂钩；\n' +
      '- 舆情应对与安全预案成本不可缺失。\n',
    tags: ['budget', 'governance', 'risk'],
  },
];

export const getEvidenceById = (id: EvidenceId): EvidenceDoc | undefined =>
  EVIDENCE_DOCS.find((d) => d.id === id);

export const getEvidenceByIds = (ids: EvidenceId[]): EvidenceDoc[] =>
  ids.map(getEvidenceById).filter((d): d is EvidenceDoc => Boolean(d));

