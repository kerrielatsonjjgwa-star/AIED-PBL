import React, { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface TutorialStep {
  title: string;
  content: React.ReactNode;
  target: string | null;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '欢迎来到 CityPulse',
    content: '你现在是“老榕树街区”的城市规划师。你的任务是改造这个衰退的社区，平衡居民满意度、经济活力和环境指标。',
    target: null, // Center modal
  },
  {
    title: '第一步：调研',
    content: '点击左侧的【Stakeholders】列表，选择不同角色（如张大妈、李总）进行对话，了解他们的诉求。',
    target: 'sidebar',
  },
  {
    title: '第二步：收集证据',
    content: '在对话中，角色会提供“证据文件”（如《居民请愿书》）。这些文件会自动出现在右侧的面板中。',
    target: 'evidence-panel',
  },
  {
    title: '第三步：提案与规划',
    content: (
      <span>
        点击“进入提案”后，你可以点击地图格子修改用地类型，并在下方填写策略陈述。
        <br/><br/>
        <strong className="text-red-600">核心玩法：规划 District Map (Old Banyan Tree)</strong>
      </span>
    ),
    target: 'map-grid',
  },
  {
    title: '第四步：引用证据',
    content: '在填写策略时，点击右侧证据面板的“引用”按钮，把关键证据加入你的陈述中，这能显著提高审批通过率！',
    target: 'evidence-panel',
  },
  {
    title: '第五步：审批与模拟',
    content: '提交方案给“王科长”审批。如果合规，系统将模拟你的方案对城市指标的影响。',
    target: 'metrics-panel',
  },
];

export const TutorialOverlay: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { turn, phase } = useGameStore();

  // Only show on Turn 1, Investigation Phase
  if (!isVisible || turn !== 1 || phase !== 'investigation') return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
            新手引导 {currentStep + 1}/{TUTORIAL_STEPS.length}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
          <div className="text-gray-600 leading-relaxed">{step.content}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            {TUTORIAL_STEPS.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          
          <button
            onClick={() => {
              if (isLast) {
                setIsVisible(false);
              } else {
                setCurrentStep(prev => prev + 1);
              }
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            {isLast ? (
              <>开始工作 <Check className="w-4 h-4" /></>
            ) : (
              <>下一步 <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
