import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { AGENTS } from '../data/agents';
import { Send } from 'lucide-react';
import clsx from 'clsx';
import { generateAgentReply } from '../services/agentEngine';

const ChatInterface: React.FC = () => {
  const { selectedAgentId, messages, addMessage, phase } = useGameStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedAgentId, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId || isTyping) return;

    const userText = input.trim();
    addMessage({
      senderId: 'user',
      senderName: '规划咨询师',
      channelId: selectedAgentId,
      content: userText,
    });

    setInput('');
    setIsTyping(true);

    try {
      const state = useGameStore.getState();
      const reply = await generateAgentReply(selectedAgentId, userText, state);
      const agent = AGENTS.find((a) => a.id === selectedAgentId);
      addMessage({
        senderId: selectedAgentId,
        senderName: agent?.name ?? selectedAgentId,
        channelId: selectedAgentId,
        content: reply.content,
      });
    } catch (error) {
      console.error(error);
      addMessage({
        senderId: selectedAgentId,
        senderName: selectedAgent?.name ?? '系统',
        channelId: selectedAgentId,
        content: '（连接中断，请重试）',
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!selectedAgentId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        选择一个角色开始协商
      </div>
    );
  }
  
  if (!selectedAgent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        角色加载失败
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
        <span className="text-2xl">{selectedAgent.avatar}</span>
        <div>
          <h3 className="font-bold text-gray-800">{selectedAgent.name}</h3>
          <p className="text-xs text-gray-500">{selectedAgent.role}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => {
           const inChannel = msg.channelId === selectedAgentId;
           const isNarrator = msg.senderId === 'narrator';
           if (!inChannel && !isNarrator) return null;

           const isUser = msg.senderId === 'user';
           return (
            <div key={msg.id} className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
              <div className={clsx(
                "max-w-[90%] rounded-lg p-3 text-sm leading-relaxed",
                isUser ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-800 shadow-sm"
              )}>
                {!isUser && <p className="text-xs font-bold text-gray-500 mb-1">{msg.senderName}</p>}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <span className="text-[10px] opacity-70 mt-1 block text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
           );
        })}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={`和 ${selectedAgent.name} 对话...`}
          disabled={phase !== 'investigation' && phase !== 'approval' && phase !== 'iteration' || isTyping}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none h-20 text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || (phase !== 'investigation' && phase !== 'approval' && phase !== 'iteration') || isTyping}
          className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed h-20 flex items-center justify-center w-14"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
