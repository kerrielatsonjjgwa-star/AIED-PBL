import React from 'react';
import { useGameStore } from '../store/gameStore';
import { AGENTS } from '../data/agents';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { selectedAgentId, setSelectedAgent } = useGameStore();

  return (
    <div className="bg-white shadow-md rounded-lg p-4 h-full">
      <h3 className="font-bold text-gray-700 mb-4">角色</h3>
      <div className="space-y-3">
        {AGENTS.filter(a => a.id !== 'narrator').map((agent) => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent.id)}
            className={clsx(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
              selectedAgentId === agent.id
                ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300 shadow-sm"
                : "hover:bg-gray-50 border border-transparent"
            )}
          >
            <span className="text-2xl">{agent.avatar}</span>
            <div>
              <div className="font-semibold text-sm text-gray-800">{agent.name}</div>
              <div className="text-xs text-gray-500">{agent.role}</div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-bold text-blue-800 text-sm mb-1">提示</h4>
        <p className="text-xs text-blue-600">
          先对话收集诉求与证据，再进入提案与审批，能显著提高通过率。
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
