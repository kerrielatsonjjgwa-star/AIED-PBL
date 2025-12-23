import React, { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { AGENTS } from '../data/agents';
import { getEvidenceByIds } from '../data/evidence';
import { EvidenceDoc } from '../types';
import { FileText, Copy, Plus, X } from 'lucide-react';
import clsx from 'clsx';

interface EvidencePanelProps {
  onUseEvidence?: (text: string) => void;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ onUseEvidence }) => {
  const { selectedAgentId, phase } = useGameStore();
  const [openDocId, setOpenDocId] = useState<string | null>(null);

  const agent = AGENTS.find((a) => a.id === selectedAgentId) ?? null;
  const docs = useMemo(() => (agent ? getEvidenceByIds(agent.evidenceIds) : []), [agent]);
  const openDoc = useMemo<EvidenceDoc | null>(
    () => docs.find((d) => d.id === openDocId) ?? null,
    [docs, openDocId],
  );

  const canUse = phase === 'proposal' || phase === 'approval';

  const buildQuote = (doc: EvidenceDoc) =>
    `证据引用：《${doc.title}》\n来源：${agent?.name ?? doc.sourceAgentId}\n摘要：${doc.summary}\n要点：\n${doc.content.trim()}\n`;

  const handleCopy = async (doc: EvidenceDoc) => {
    const text = buildQuote(doc);
    await navigator.clipboard.writeText(text);
  };

  if (!agent) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300">
        选择一个角色查看其证据文件
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col relative">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-gray-700">证据文件</h3>
      </div>

      <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-md p-3 mb-3">
        <div className="font-semibold text-gray-800">{agent.name}（{agent.role}）</div>
        <div className="mt-1">公开立场：{agent.publicStance}</div>
        <div className="mt-1">隐性偏好：{agent.hiddenPreference}</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {docs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setOpenDocId(doc.id)}
            className={clsx(
              "w-full text-left p-3 rounded-md border transition-colors",
              openDocId === doc.id ? "border-indigo-300 bg-indigo-50" : "border-gray-200 hover:bg-gray-50",
            )}
          >
            <div className="text-sm font-semibold text-gray-800">{doc.title}</div>
            <div className="text-xs text-gray-600 mt-1">{doc.summary}</div>
            <div className="text-[10px] text-gray-400 mt-2">{doc.tags.join(' · ')}</div>
          </button>
        ))}
      </div>

      {openDoc && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 max-h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div className="text-sm font-bold text-gray-800">{openDoc.title}</div>
            <button 
              onClick={() => setOpenDocId(null)}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-gray-600 mb-2">{openDoc.summary}</div>
          <pre className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 whitespace-pre-wrap flex-1 overflow-y-auto">
            {openDoc.content.trim()}
          </pre>
          <div className="mt-3 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleCopy(openDoc)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 text-sm"
            >
              <Copy className="w-4 h-4" />
              复制引用
            </button>
            <button
              type="button"
              onClick={() => onUseEvidence?.(buildQuote(openDoc))}
              disabled={!canUse}
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="w-4 h-4" />
              用于提案
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidencePanel;
