import React from 'react';
import { HandRecord } from '../types';
import { History, Trophy, X, Calendar } from 'lucide-react';

interface HistoryModalProps {
  history: HandRecord[];
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ history, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-100 font-extrabold text-lg">
            <History className="w-5 h-5 text-emerald-400" />
            <span>Hand History</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs font-medium">
            No hands recorded yet. Play a round and award the pot to see history here!
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
            {history.map((record) => (
              <div
                key={record.id}
                className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-400">HAND #{record.handNumber}</span>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {record.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800 text-xs">
                  <span className="text-zinc-400">Total Pot:</span>
                  <span className="font-bold text-white tabular-nums">{record.potAmount.toLocaleString()} Chips</span>
                </div>

                <div className="flex flex-col gap-0.5 mt-0.5">
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-400" />
                    Winner(s):
                  </span>
                  {record.winners.map((w, idx) => (
                    <div key={idx} className="text-xs font-bold text-zinc-200 pl-4 flex justify-between">
                      <span>• {w.name}</span>
                      <span className="text-emerald-400 font-mono">+{w.amountWon.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
