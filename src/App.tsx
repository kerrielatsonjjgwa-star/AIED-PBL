import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Sidebar from './components/Sidebar';
import MapGrid from './components/MapGrid';
import ChatInterface from './components/ChatInterface';
import MetricBar from './components/MetricBar';
import NewsFeed from './components/NewsFeed';
import EvidencePanel from './components/EvidencePanel';
import { TutorialOverlay } from './components/TutorialOverlay';
import { Coins, Hourglass, Activity, AlertTriangle } from 'lucide-react';
import { runSimulation } from './services/simulation';
import { evaluateApproval } from './services/agentEngine';
import { GridCellType } from './types';
import { weightsByType } from './services/simulation';

function App() {
  const { 
    turn, 
    maxTurns, 
    budget, 
    phase, 
    setPhase, 
    nextTurn,
    updateGridCell,
    addMessage,
    addNews,
    updateMetrics,
    updateBudget,
    lastSimulatedGrid,
    commitSimulationSnapshot,
    setSelectedAgent,
    grid
  } = useGameStore();

  const [strategy, setStrategy] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Hard constraints check for UI warning
  const currentResidential = grid.filter(c => c.type === 'residential').length;
  const initialResidential = lastSimulatedGrid.filter(c => c.type === 'residential').length;
  
  const calculateProjectedCost = () => {
    let cost = 0;
    const lastMap = new Map(lastSimulatedGrid.map(c => [c.id, c.type]));
    for (const cell of grid) {
        const lastType = lastMap.get(cell.id);
        if (lastType && lastType !== cell.type) {
             if (cell.type !== 'empty') {
                 cost += Math.abs(weightsByType[cell.type].budget);
             } else {
                 cost -= weightsByType['empty'].budget; 
             }
        }
    }
    return cost;
  };
  
  const projectedCost = calculateProjectedCost();
  const remainingBudget = budget - projectedCost;

  const hasErrors = phase === 'proposal' && (remainingBudget < 0 || currentResidential < initialResidential);

  useEffect(() => {
    if (turn === 1 && phase === 'investigation') {
      addMessage({
        senderId: 'narrator',
        senderName: '系统旁白',
        channelId: 'narrator',
        content: '欢迎来到“老榕树街区”。这里正经历衰退：经济低迷、居民老龄化、环境问题突出。请先与各方角色对话，收集诉求与证据。'
      });
    }
  }, []);

  const handleNextPhase = () => {
    if (phase === 'investigation') {
      setPhase('proposal');
    } else if (phase === 'proposal') {
      if (hasErrors) {
          alert("方案存在红线问题（预算不足或居民区减少），请修正后再提交。");
          return;
      }
      setPhase('approval');
      setSelectedAgent('gov_officer');
    } else if (phase === 'approval') {
      handleApproval();
    } else if (phase === 'iteration') {
      nextTurn();
      setStrategy('');
    }
  };

  const handleApproval = async () => {
    setIsProcessing(true);
    try {
        const result = await evaluateApproval(strategy, useGameStore.getState());
        
        if (!result.approved) {
          addMessage({
            senderId: 'gov_officer',
            senderName: '王科长',
            channelId: 'gov_officer',
            content: `审批未通过：\n- ${result.reasons.join('\n- ')}\n建议你补充相关证据与表述后再提交。`,
          });
          addNews({
            title: '审批提示',
            content: '方案需要补充合规与预算要点后再进入施工模拟。',
            sentiment: 'neutral',
          });
          setIsProcessing(false);
          return;
        }

        addMessage({
          senderId: 'gov_officer',
          senderName: '王科长',
          channelId: 'gov_officer',
          content: '审批通过：合规与预算要点齐全，允许进入施工模拟。',
        });

        await handleSimulation();
    } catch (e) {
        console.error(e);
        setIsProcessing(false);
    }
  };

  const handleSimulation = async () => {
    setPhase('simulation');
    
    // UI needs to update to show simulation phase before we start the async work
    // Use a small timeout to let React render the phase change if needed, but here it's fine.
    
    try {
        const result = await runSimulation({
          currentGrid: grid,
          lastSimulatedGrid,
          strategyText: strategy,
        });

        updateMetrics(result.metricDelta);
        updateBudget(result.budgetDelta);
        commitSimulationSnapshot();

        addMessage({
          senderId: 'narrator',
          senderName: '系统旁白',
          channelId: 'narrator',
          content: result.narrative,
        });

        addNews({
          title: '提案进入执行',
          content: strategy ? `本回合策略：${strategy}` : '本回合未填写策略陈述。',
          sentiment: 'neutral',
        });

        for (const item of result.news) {
          addNews(item);
        }

        setPhase('iteration');
    } catch (e) {
        console.error(e);
        setPhase('iteration'); // Fallback
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans flex flex-col h-screen">
      <TutorialOverlay />
      <header className="bg-white shadow-sm border-b border-gray-200 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold">CP</div>
            <h1 className="text-xl font-bold text-gray-800">CityPulse <span className="text-gray-400 font-normal text-sm">| Urban Renewal Simulator</span></h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
              <Hourglass className="w-4 h-4" />
              <span className="font-mono font-bold">Turn {turn}/{maxTurns}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${remainingBudget < 0 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
              <Coins className="w-4 h-4" />
              <span className="font-mono font-bold">
                 ${remainingBudget}k
                 {phase === 'proposal' && projectedCost > 0 && <span className="text-xs opacity-75"> (-{projectedCost})</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Activity className="w-4 h-4" />
              <span className="uppercase font-bold text-xs tracking-wider">{phase}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4 overflow-hidden w-full">
        
        <div className="col-span-2 h-full overflow-hidden">
          <Sidebar />
        </div>

        <div className="col-span-7 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Map Grid - Fixed height, no shrink */}
          <div className="shrink-0">
            <MapGrid onCellClick={(id) => {
               const types: GridCellType[] = ['residential', 'factory', 'park', 'commercial', 'empty'];
               const currentType = useGameStore.getState().grid.find(c => c.id === id)?.type ?? 'empty';
               const nextType = types[(types.indexOf(currentType) + 1) % types.length];
               updateGridCell(id, nextType);
            }} />
          </div>

          {/* Interaction Area - Fills remaining height */}
          <div className="flex-1 min-h-0 flex flex-col">
             {phase === 'proposal' ? (
               <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col overflow-auto">
                 <div className="flex justify-between items-center mb-4 shrink-0">
                   <h3 className="text-lg font-bold">提案阶段</h3>
                   {hasErrors && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-bold bg-red-50 px-3 py-1 rounded-full">
                        <AlertTriangle className="w-4 h-4" />
                        {remainingBudget < 0 ? "预算不足" : "违反红线：居民区减少"}
                      </div>
                   )}
                 </div>
                 
                 <p className="text-sm text-gray-500 mb-2 shrink-0">填写策略陈述，并在右侧引用证据文件。</p>
                 <textarea 
                   className="w-full flex-1 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none min-h-[100px]"
                   placeholder="例如：将废弃工厂改为创业园区带动经济，同时新增口袋公园降低热岛并安抚居民。"
                   value={strategy}
                   onChange={(e) => setStrategy(e.target.value)}
                 />
                 <div className="mt-4 flex justify-end shrink-0">
                    <button 
                      onClick={handleNextPhase}
                      disabled={hasErrors}
                      className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                        hasErrors 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      提交审批
                    </button>
                 </div>
               </div>
             ) : phase === 'simulation' || isProcessing ? (
               <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                 <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                 <p>{phase === 'approval' ? '政府审批审核中...' : '城市模拟推演中...'}</p>
               </div>
             ) : phase === 'approval' ? (
               <div className="h-full flex flex-col gap-3">
                 <div className="bg-white p-4 rounded-lg shadow-md shrink-0">
                   <div className="flex items-center justify-between gap-3">
                     <h3 className="text-base font-bold text-gray-800">审批补充说明</h3>
                     <div className="flex gap-2">
                       <button
                         type="button"
                         onClick={() => setPhase('proposal')}
                         className="px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm"
                         disabled={isProcessing}
                       >
                         返回提案
                       </button>
                       <button
                         type="button"
                         onClick={handleNextPhase}
                         className="px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-semibold disabled:bg-indigo-400"
                         disabled={isProcessing}
                       >
                         {isProcessing ? '审核中...' : '提交审批'}
                       </button>
                     </div>
                   </div>
                   <textarea
                     className="mt-3 w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-24 text-sm"
                     placeholder="补充合规、预算、扰民控制等要点（可从右侧证据复制引用）。"
                     value={strategy}
                     onChange={(e) => setStrategy(e.target.value)}
                     disabled={isProcessing}
                   />
                 </div>
                 <div className="flex-1 min-h-0 overflow-hidden">
                   <ChatInterface />
                 </div>
               </div>
             ) : (
               <div className="h-full overflow-hidden">
                 <ChatInterface />
               </div>
             )}
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="shrink-0">
            <MetricBar metrics={useGameStore((s) => s.metrics)} />
          </div>
          <div className="h-[300px] shrink-0">
            <EvidencePanel
              onUseEvidence={(text) => {
                setStrategy((prev) => (prev ? `${prev}\n\n${text}` : text));
              }}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
             <NewsFeed />
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-indigo-500 shrink-0">
             <h4 className="font-bold text-gray-700 mb-2">Current Phase: {phase.toUpperCase()}</h4>
             <p className="text-xs text-gray-500 mb-4">
               {phase === 'investigation' && "调研：与各方对话，收集诉求与证据。"}
               {phase === 'proposal' && "提案：编辑地图并写策略陈述。"}
               {phase === 'approval' && "审批：与政府审批官沟通，补齐合规与预算要点。"}
               {phase === 'simulation' && "模拟：根据网格变更与策略进行指标仿真。"}
               {phase === 'iteration' && "迭代：查看反馈，准备下一回合。"}
             </p>
             {phase !== 'proposal' && phase !== 'simulation' && phase !== 'ended' && !isProcessing && (
               <button 
                 onClick={handleNextPhase}
                 className="w-full bg-gray-900 text-white py-2 rounded-md font-bold hover:bg-gray-800"
               >
                 {phase === 'investigation' ? '进入提案' : phase === 'approval' ? '提交审批' : '下一回合'}
               </button>
             )}
             {phase === 'ended' && (
               <div className="text-center text-sm text-gray-500">
                 回合结束
               </div>
             )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
