import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import { ArrowUpRight, Check, X, Flame, Plus, ChevronRight } from 'lucide-react';

interface ActionControlsProps {
  activePlayer: Player | null;
  currentHighestBet: number;
  pot: number;
  effectiveSB?: number;
  effectiveBB?: number;
  street?: string;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
  onFold: () => void;
  onAllIn: () => void;
  onNextTurn: () => void;
  onNextStreet?: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  activePlayer,
  currentHighestBet,
  pot,
  effectiveSB = 10,
  effectiveBB = 20,
  street = 'preflop',
  onCheck,
  onCall,
  onRaise,
  onFold,
  onAllIn,
  onNextTurn,
  onNextStreet,
}) => {
  if (!activePlayer) return null;

  const currentBet = activePlayer.currentBet;
  const callAmount = Math.max(0, currentHighestBet - currentBet);
  const canCheck = callAmount === 0;

  // Custom Raise Amount calculation
  const minRaise = currentHighestBet > 0 ? currentHighestBet * 2 : effectiveBB;
  const [raiseAmount, setRaiseAmount] = useState<number>(minRaise);

  // Update raise default when currentHighestBet changes
  useEffect(() => {
    const defaultVal = currentHighestBet > 0 ? Math.min(activePlayer.chips, currentHighestBet * 2) : Math.min(activePlayer.chips, effectiveBB * 2);
    setRaiseAmount(Math.max(defaultVal, currentHighestBet + 10));
  }, [currentHighestBet, activePlayer.chips, effectiveBB]);

  const addQuickAmount = (addVal: number) => {
    sound.playChip();
    setRaiseAmount((prev) => Math.min(activePlayer.chips, prev + addVal));
  };

  const handleRaiseSubmit = () => {
    if (raiseAmount <= currentBet) return;
    const addChips = raiseAmount - currentBet;
    if (addChips > activePlayer.chips) return;
    sound.playChip();
    onRaise(raiseAmount);
  };

  return (
    <div className="w-full bg-[#111111] border-t border-zinc-800 rounded-t-3xl p-4 shadow-2xl backdrop-blur-lg flex flex-col gap-3">
      {/* Active Turn Header */}
      <div className="flex items-center justify-between bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow shrink-0"
            style={{ backgroundColor: activePlayer.avatarColor }}
          >
            {activePlayer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase flex items-center gap-1.5">
              <span>CURRENT TURN</span>
              <span className="bg-emerald-950 text-emerald-400 font-black px-1.5 py-0.2 rounded border border-emerald-800 text-[9px]">
                {street.toUpperCase()}
              </span>
            </div>
            <div className="text-sm font-extrabold text-white flex items-center gap-1.5 flex-wrap">
              <span>{activePlayer.name}</span>

              {activePlayer.isDealer && (
                <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  D
                </span>
              )}
              {activePlayer.isSmallBlind && (
                <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  SB
                </span>
              )}
              {activePlayer.isBigBlind && (
                <span className="bg-cyan-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  BB
                </span>
              )}
              {activePlayer.isFolded && <span className="text-xs text-red-400 font-normal">(Folded)</span>}
            </div>
          </div>
        </div>

        {/* Turn & Street Action Buttons */}
        <div className="flex items-center gap-1.5">
          {onNextStreet && (
            <button
              onClick={onNextStreet}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700 text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="ขึ้นรอบถัดไป (Pre-flop -> Flop -> Turn -> River)"
            >
              <span>ขึ้นรอบ ({street})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onNextTurn}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <span>Next Turn</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {activePlayer.isFolded ? (
        <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 text-center text-xs text-red-400 font-medium">
          {activePlayer.name} has folded for this hand. Press "Next Turn" to switch.
        </div>
      ) : activePlayer.isAllIn ? (
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5">
          <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          {activePlayer.name} is ALL-IN! ({activePlayer.chips + activePlayer.currentBet} Chips)
        </div>
      ) : (
        <>
          {/* Quick Bet Buttons Bar (Blinds + Chips) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold text-zinc-500 uppercase shrink-0 mr-1 tracking-wider">
              Quick:
            </span>

            {/* SB Call / Equalize to BB Button (highlighted when SB or calling BB) */}
            {callAmount > 0 && (
              <button
                disabled={activePlayer.chips < callAmount}
                onClick={() => {
                  sound.playChip();
                  onCall();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs px-3 py-1.5 rounded-xl border border-emerald-400 shrink-0 cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Call ตาม BB (+{callAmount})</span>
              </button>
            )}

            {/* Post SB */}
            <button
              disabled={activePlayer.chips < effectiveSB}
              onClick={() => {
                sound.playChip();
                onRaise(activePlayer.currentBet + effectiveSB);
              }}
              className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 disabled:opacity-30 font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-amber-700/50 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              ลง SB ({effectiveSB})
            </button>

            {/* Post BB */}
            <button
              disabled={activePlayer.chips < effectiveBB}
              onClick={() => {
                sound.playChip();
                onRaise(activePlayer.currentBet + effectiveBB);
              }}
              className="bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 disabled:opacity-30 font-extrabold text-xs px-2.5 py-1.5 rounded-xl border border-cyan-700/50 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              ลง BB ({effectiveBB})
            </button>

            {/* Raise 2x BB */}
            <button
              disabled={activePlayer.chips < effectiveBB * 2 - activePlayer.currentBet}
              onClick={() => {
                sound.playChip();
                onRaise(effectiveBB * 2);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              Raise 2x ({effectiveBB * 2})
            </button>

            {/* Raise 3x BB */}
            <button
              disabled={activePlayer.chips < effectiveBB * 3 - activePlayer.currentBet}
              onClick={() => {
                sound.playChip();
                onRaise(effectiveBB * 3);
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-xs px-2.5 py-1.5 rounded-xl border border-zinc-700 shrink-0 cursor-pointer active:scale-95 transition-all"
            >
              Raise 3x ({effectiveBB * 3})
            </button>

            {[10, 50, 100, 500].map((val) => (
              <button
                key={val}
                onClick={() => addQuickAmount(val)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs px-3 py-1.5 rounded-xl border border-zinc-700 shrink-0 flex items-center gap-0.5 cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                {val}
              </button>
            ))}

            {/* Pot Fraction Preset */}
            {pot > 0 && (
              <button
                onClick={() => {
                  sound.playChip();
                  setRaiseAmount(Math.min(activePlayer.chips, Math.max(minRaise, pot)));
                }}
                className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                Pot ({pot.toLocaleString()})
              </button>
            )}
          </div>

          {/* Raise Adjustment Slider & Input */}
          <div className="bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-medium">Set Total Bet / Raise Target</span>
              <span className="text-emerald-400 font-black text-sm tabular-nums">
                {raiseAmount.toLocaleString()} <span className="text-[10px] text-zinc-500 font-normal">Chips</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={currentHighestBet > 0 ? currentHighestBet + 10 : 10}
                max={activePlayer.chips + currentBet}
                step={10}
                value={raiseAmount}
                onChange={(e) => setRaiseAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                onClick={handleRaiseSubmit}
                disabled={raiseAmount <= currentBet || raiseAmount - currentBet > activePlayer.chips}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs px-3 py-1.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none cursor-pointer shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1 active:scale-95 uppercase tracking-wider"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Raise
              </button>
            </div>
          </div>

          {/* Main Action Buttons Grid (Check, Call, Raise, Fold, All-In) */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* Check or Call */}
            {canCheck ? (
              <button
                onClick={() => {
                  sound.playCheck();
                  onCheck();
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 px-3 rounded-xl border border-zinc-700 shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-widest"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>CHECK</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playChip();
                  onCall();
                }}
                disabled={activePlayer.chips === 0}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 px-3 rounded-xl border border-zinc-700 shadow flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all disabled:opacity-40 uppercase tracking-widest"
              >
                <div className="flex items-center gap-1">
                  <span>CALL</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    +{callAmount.toLocaleString()}
                  </span>
                </div>
              </button>
            )}

            {/* Fold Button */}
            <button
              onClick={() => {
                sound.playFold();
                onFold();
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs py-3.5 px-3 rounded-xl border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-widest"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>FOLD</span>
            </button>
          </div>

          {/* All-In Secondary Button */}
          <button
            onClick={() => {
              sound.playAllIn();
              onAllIn();
            }}
            disabled={activePlayer.chips === 0}
            className="w-full bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 font-black text-xs py-2.5 px-3 rounded-xl shadow flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider italic"
          >
            <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
            ALL-IN ({activePlayer.chips.toLocaleString()} CHIPS)
          </button>
        </>
      )}
    </div>
  );
};
