import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Newspaper } from 'lucide-react';
import clsx from 'clsx';

const NewsFeed: React.FC = () => {
  const { news } = useGameStore();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <Newspaper className="w-5 h-5 text-indigo-600" />
        <h3 className="font-bold text-gray-700">City News Feed</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {news.length === 0 ? (
          <p className="text-sm text-gray-400 text-center italic mt-4">No recent news...</p>
        ) : (
          news.map((item) => (
            <div key={item.id} className="p-3 bg-gray-50 rounded border-l-4 border-indigo-500">
              <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
              <p className="text-xs text-gray-600 mt-1">{item.content}</p>
              <div className="flex justify-between items-center mt-2">
                <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  item.sentiment === 'positive' ? "bg-green-100 text-green-700" :
                  item.sentiment === 'negative' ? "bg-red-100 text-red-700" :
                  "bg-gray-200 text-gray-600"
                )}>
                  {item.sentiment.toUpperCase()}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsFeed;
