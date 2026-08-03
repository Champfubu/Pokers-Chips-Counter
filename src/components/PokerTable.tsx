import React from 'react';
import { Player } from '../types';
import { Coins, Flame, Award } from 'lucide-react';

interface PokerTableProps {
  pot: number;
  currentHighestBet: number;
  players: Player[];
  activePlayerId: string;
  onSelectPlayer: (id: string) => void;
  onOpenAwardModal: () => void;
  handNumber: number;
}

export const PokerTable: React.FC<PokerTableProps> = ({
  pot,
  currentHighestBet,
  players,
  activePlayerId,
  onSelectPlayer,
  onOpenAwardModal,
  handNumber,
}) => {
  const activePlayersCount = players.filter((p) => !p.isFolded).length;

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#161616] via-zinc-900 to-[#0f0f0f] p-4 border-2 border-zinc-800 shadow-2xl overflow-hidden">
      {/* Felt Grid Pattern Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
        <span className="font-semibold tracking-widest text-zinc-500 uppercase text-[10px]">
          HAND #{handNumber}
        </span>
        <span className="bg-zinc-800/80 text-zinc-300 text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-700/60 font-medium">
          {activePlayersCount} / {players.length} Active
        </span>
      </div>

      {/* Center Pot Display */}
      <div className="relative z-10 my-2 flex flex-col items-center justify-center">
        <div className="relative w-full bg-gradient-to-b from-[#181818] to-[#111111] border border-zinc-800 rounded-2xl px-5 py-4 shadow-[0_0_20px_rgba(52,211,153,0.15)] flex flex-col items-center">
          <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            CURRENT POT TOTAL
          </span>
          <div className="text-4xl font-black text-emerald-400 tabular-nums my-1 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            {pot.toLocaleString()}
          </div>

          {currentHighestBet > 0 && (
            <div className="text-[11px] font-medium text-zinc-400 bg-zinc-900/90 px-3 py-0.5 rounded-full border border-zinc-800 mt-0.5">
              Current High Bet: <span className="font-bold text-emerald-300">{currentHighestBet.toLocaleString()}</span>
            </div>
          )}

          {/* Quick Award Pot Button */}
          {pot > 0 && (
            <button
              onClick={onOpenAwardModal}
              className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs py-2 px-4 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <Award className="w-4 h-4" />
              Award Pot to Winner
            </button>
          )}
        </div>
      </div>

      {/* Players Ring Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {players.map((player) => {
          const isActive = player.id === activePlayerId;

          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`relative text-left p-3 rounded-2xl transition-all duration-200 border cursor-pointer ${
                player.isFolded
                  ? 'bg-zinc-950/60 border-zinc-900 opacity-40 grayscale'
                  : isActive
                  ? 'bg-zinc-900/90 border-2 border-emerald-500/70 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Position Badges (Dealer, SB, BB) */}
              <div className="absolute -top-2 -left-1 flex items-center gap-1 z-10">
                {player.isDealer && (
                  <div className="bg-emerald-500 text-black font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-md" title="Dealer Button">
                    D
                  </div>
                )}
                {player.isSmallBlind && (
                  <div className="bg-amber-400 text-black font-black text-[10px] px-1.5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-md" title="Small Blind">
                    SB
                  </div>
                )}
                {player.isBigBlind && (
                  <div className="bg-cyan-400 text-black font-black text-[10px] px-1.5 h-5 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-md" title="Big Blind">
                    BB
                  </div>
                )}
              </div>

              {/* Active Badge */}
              {isActive && !player.isFolded && (
                <div className="absolute top-2 right-2">
                  <span className="text-[9px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.2 rounded uppercase">
                    ACTING
                  </span>
                </div>
              )}

              {/* Player Top Row: Avatar + Name */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow shrink-0"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className={`font-semibold text-xs truncate ${
                      isActive ? 'text-white' : 'text-zinc-300'
                    }`}
                  >
                    {player.name}
                  </span>
                </div>

                {/* Status Badges */}
                {player.isFolded && (
                  <span className="text-[9px] bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded font-semibold border border-red-900/50">
                    Folded
                  </span>
                )}
                {player.isAllIn && !player.isFolded && (
                  <span className="text-[9px] bg-emerald-500 text-black font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow">
                    <Flame className="w-3 h-3 fill-black" />
                    ALL-IN
                  </span>
                )}
              </div>

              {/* Chips Balance */}
              <div className="flex items-baseline justify-between pt-2 border-t border-zinc-800/80">
                <div className="flex flex-col">
                  <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">CHIPS</span>
                  <span className="text-sm font-bold text-white tabular-nums">
                    {player.chips.toLocaleString()}
                  </span>
                </div>

                {/* Current Round Bet */}
                {player.currentBet > 0 && (
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] text-emerald-400 font-medium uppercase">BET</span>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      +{player.currentBet.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Last Action Label */}
              {player.lastAction && (
                <div className="mt-1 text-[9px] font-medium text-zinc-400 truncate italic">
                  {player.lastAction}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
