import React, { useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import {
  RotateCw,
  Coins,
  Award,
  Play,
  Check,
  X,
  Plus,
  Flame,
  ChevronDown,
  ArrowUpRight,
  Shield,
  Zap,
  ArrowRight
} from 'lucide-react';

interface SplitScreenViewProps {
  players: Player[];
  p1Index: number;
  p2Index: number;
  activePlayerIndex: number;
  currentHighestBet: number;
  pot: number;
  handNumber: number;
  effectiveSB: number;
  effectiveBB: number;
  blindMultiplier: number;
  street?: string;
  onSetBlindMultiplier: (mult: number) => void;
  onShiftDealer: () => void;
  onCheck: (playerIndex: number) => void;
  onCall: (playerIndex: number) => void;
  onRaise: (playerIndex: number, amount: number) => void;
  onFold: (playerIndex: number) => void;
  onAllIn: (playerIndex: number) => void;
  onNextStreet?: () => void;
  onOpenAwardModal: () => void;
  onNewHand: () => void;
  onChangeP1Index?: (index: number) => void;
  onChangeP2Index?: (index: number) => void;
}

export const SplitScreenView: React.FC<SplitScreenViewProps> = ({
  players,
  p1Index,
  p2Index,
  activePlayerIndex,
  currentHighestBet,
  pot,
  handNumber,
  effectiveSB,
  effectiveBB,
  blindMultiplier,
  street = 'preflop',
  onSetBlindMultiplier,
  onShiftDealer,
  onCheck,
  onCall,
  onRaise,
  onFold,
  onAllIn,
  onNextStreet,
  onOpenAwardModal,
  onNewHand,
  onChangeP1Index,
  onChangeP2Index,
}) => {
  // Independent rotations for Left (P1) and Right (P2) so iPad can lay flat between 2 players
  const [rotateP1, setRotateP1] = useState(false);
  const [rotateP2, setRotateP2] = useState(false);

  const player1 = players[p1Index] || players[0];
  const player2 = players[p2Index] || players[1] || players[0];

  const minRaiseP1 = Math.max(
    currentHighestBet > 0 ? currentHighestBet * 2 : effectiveBB,
    player1 ? player1.currentBet + 10 : 10
  );
  const minRaiseP2 = Math.max(
    currentHighestBet > 0 ? currentHighestBet * 2 : effectiveBB,
    player2 ? player2.currentBet + 10 : 10
  );

  const [raiseP1, setRaiseP1] = useState<number>(minRaiseP1);
  const [raiseP2, setRaiseP2] = useState<number>(minRaiseP2);

  if (!player1 || !player2) return null;

  // Helper to render one player's controller panel
  const renderPlayerPanel = (
    player: Player,
    pIdx: number,
    isLeft: boolean,
    raiseVal: number,
    setRaiseVal: (val: number) => void,
    minRaise: number,
    isRotated: boolean,
    onToggleRotate: () => void
  ) => {
    const isCurrentTurn = activePlayerIndex === pIdx;
    const callAmount = Math.max(0, currentHighestBet - player.currentBet);
    const canCheck = currentHighestBet === 0 || player.currentBet === currentHighestBet;

    return (
      <div
        className={`flex-1 flex flex-col justify-between p-3.5 sm:p-4 md:p-5 rounded-3xl transition-all duration-300 relative border ${
          isRotated ? 'rotate-180' : ''
        } ${
          player.isFolded
            ? 'bg-zinc-950/80 border-zinc-900 opacity-50 grayscale'
            : isCurrentTurn
            ? 'bg-gradient-to-b from-[#181818] via-zinc-900 to-[#111111] border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/50'
            : 'bg-[#121212] border-zinc-800/90 hover:border-zinc-700'
        }`}
      >
        {/* Top Header Row of Player Panel */}
        <div>
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
            {/* Avatar, Player Name & Badges */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-white text-base shadow shrink-0"
                style={{ backgroundColor: player.avatarColor }}
              >
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-extrabold text-base md:text-lg text-white leading-tight">
                    {player.name}
                  </span>

                  {/* Position Badges */}
                  {player.isDealer && (
                    <span className="bg-emerald-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center justify-center shadow" title="Dealer">
                      D
                    </span>
                  )}
                  {player.isSmallBlind && (
                    <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center justify-center shadow" title="Small Blind">
                      SB
                    </span>
                  )}
                  {player.isBigBlind && (
                    <span className="bg-cyan-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full flex items-center justify-center shadow" title="Big Blind">
                      BB
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                  Stack:{' '}
                  <span className="text-emerald-400 font-bold tabular-nums text-sm">
                    {player.chips.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Top Right Controls: Rotation & Switcher */}
            <div className="flex items-center gap-1.5">
              {/* Rotate button for this side */}
              <button
                onClick={onToggleRotate}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isRotated
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white border-zinc-700'
                }`}
                title="Rotate this side 180°"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Player Selector if >2 players */}
              {players.length > 2 && (
                <div className="relative">
                  <select
                    value={pIdx}
                    onChange={(e) => {
                      const newIdx = Number(e.target.value);
                      if (isLeft && onChangeP1Index) onChangeP1Index(newIdx);
                      if (!isLeft && onChangeP2Index) onChangeP2Index(newIdx);
                    }}
                    className="bg-zinc-800 text-zinc-200 text-xs font-bold py-1.5 px-2.5 pr-6 rounded-xl border border-zinc-700 appearance-none focus:outline-none cursor-pointer"
                  >
                    {players.map((p, i) => (
                      <option
                        key={p.id}
                        value={i}
                        disabled={i === (isLeft ? p2Index : p1Index)}
                      >
                        {p.name} ({p.chips})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-1.5 top-2.5 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Turn Indicator & Status Badge */}
          <div className="mt-2.5 flex items-center justify-between">
            {isCurrentTurn && !player.isFolded ? (
              <div className="w-full bg-emerald-500 text-black font-extrabold text-xs py-1 px-3 rounded-xl uppercase tracking-wider text-center shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse">
                ► YOUR TURN TO ACT
              </div>
            ) : player.isFolded ? (
              <div className="w-full bg-red-950/80 text-red-400 font-bold text-xs py-1 px-3 rounded-xl border border-red-900/50 uppercase text-center">
                FOLDED THIS HAND
              </div>
            ) : player.isAllIn ? (
              <div className="w-full bg-emerald-950 text-emerald-400 font-extrabold text-xs py-1 px-3 rounded-xl border border-emerald-800 uppercase text-center flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-emerald-400" />
                ALL-IN ({player.chips + player.currentBet} CHIPS)
              </div>
            ) : (
              <div className="w-full text-zinc-500 text-[11px] font-semibold tracking-wider text-center py-0.5 uppercase">
                WAITING FOR ACTION
              </div>
            )}
          </div>

          {/* Current Bet Box */}
          <div className="mt-2.5 bg-zinc-900/90 p-2.5 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Current Bet:
            </span>
            <span className="font-mono font-black text-emerald-400 text-base md:text-lg tabular-nums">
              {player.currentBet > 0 ? `+${player.currentBet.toLocaleString()}` : '0'}
            </span>
          </div>
        </div>

        {/* Action Controls Section */}
        {player.isFolded ? (
          <div className="my-6 text-center text-xs text-zinc-500 font-medium italic">
            Waiting for next hand...
          </div>
        ) : player.isAllIn ? (
          <div className="my-6 text-center text-xs text-emerald-400 font-bold bg-emerald-950/30 p-3 rounded-2xl border border-emerald-500/20">
            Player is All-In! No further actions required.
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {/* Quick Blind-Based & Chip Bet Buttons */}
            <div className="flex flex-col gap-1.5 bg-zinc-950/60 p-2 rounded-2xl border border-zinc-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Quick Bets (Blind Based):
              </span>
              <div className="grid grid-cols-4 gap-1">
                {/* Post SB */}
                <button
                  disabled={player.chips < effectiveSB}
                  onClick={() => {
                    sound.playChip();
                    onRaise(pIdx, player.currentBet + effectiveSB);
                  }}
                  className="bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 disabled:opacity-30 font-extrabold text-[11px] py-1.5 rounded-xl border border-amber-700/50 cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                >
                  <span>ลง SB</span>
                  <span className="text-[9px] opacity-80">+{effectiveSB}</span>
                </button>

                {/* Post BB */}
                <button
                  disabled={player.chips < effectiveBB}
                  onClick={() => {
                    sound.playChip();
                    onRaise(pIdx, player.currentBet + effectiveBB);
                  }}
                  className="bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 disabled:opacity-30 font-extrabold text-[11px] py-1.5 rounded-xl border border-cyan-700/50 cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                >
                  <span>ลง BB</span>
                  <span className="text-[9px] opacity-80">+{effectiveBB}</span>
                </button>

                {/* Raise 2x BB */}
                <button
                  disabled={player.chips < effectiveBB * 2 - player.currentBet}
                  onClick={() => {
                    sound.playChip();
                    onRaise(pIdx, effectiveBB * 2);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 disabled:opacity-30 font-extrabold text-[11px] py-1.5 rounded-xl border border-zinc-700 cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                >
                  <span>Raise 2x</span>
                  <span className="text-[9px] text-zinc-400">{effectiveBB * 2}</span>
                </button>

                {/* Raise 3x BB */}
                <button
                  disabled={player.chips < effectiveBB * 3 - player.currentBet}
                  onClick={() => {
                    sound.playChip();
                    onRaise(pIdx, effectiveBB * 3);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 disabled:opacity-30 font-extrabold text-[11px] py-1.5 rounded-xl border border-zinc-700 cursor-pointer active:scale-95 transition-all flex flex-col items-center justify-center leading-tight"
                >
                  <span>Raise 3x</span>
                  <span className="text-[9px] text-zinc-400">{effectiveBB * 3}</span>
                </button>
              </div>

              {/* Quick Chip Additions (+10, +50, +100, +500) */}
              <div className="grid grid-cols-4 gap-1 mt-0.5">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    disabled={player.chips < val}
                    onClick={() => {
                      sound.playChip();
                      const newTarget = Math.max(currentHighestBet, player.currentBet + val);
                      onRaise(pIdx, newTarget);
                    }}
                    className="bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 font-bold text-[10px] py-1 rounded-lg border border-zinc-800 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5 text-emerald-400" />
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider & Raise Input Box */}
            <div className="bg-zinc-950/90 p-2 rounded-2xl border border-zinc-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Custom Target:</span>
                <span className="text-emerald-400 font-black text-sm tabular-nums">
                  {raiseVal.toLocaleString()}{' '}
                  <span className="text-[10px] text-zinc-500 font-normal">Chips</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={minRaise}
                  max={Math.max(minRaise, player.chips + player.currentBet)}
                  step={10}
                  value={Math.min(raiseVal, player.chips + player.currentBet)}
                  onChange={(e) => setRaiseVal(Number(e.target.value))}
                  className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <button
                  disabled={player.chips <= 0}
                  onClick={() => {
                    sound.playChip();
                    onRaise(pIdx, raiseVal);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all shrink-0 uppercase tracking-wider disabled:opacity-40 shadow flex items-center gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Raise
                </button>
              </div>
            </div>

            {/* Large Tactile Buttons: Check/Call vs Fold */}
            <div className="grid grid-cols-3 gap-2">
              {/* Check or Call */}
              {canCheck ? (
                <button
                  onClick={() => {
                    sound.playCheck();
                    onCheck(pIdx);
                  }}
                  className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm md:text-base py-3 px-3 rounded-2xl border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all uppercase tracking-wider shadow"
                >
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>CHECK</span>
                </button>
              ) : (
                <button
                  disabled={player.chips === 0}
                  onClick={() => {
                    sound.playChip();
                    onCall(pIdx);
                  }}
                  className="col-span-2 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-sm md:text-base py-3 px-3 rounded-2xl border border-zinc-700 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all uppercase tracking-wider disabled:opacity-40 shadow"
                >
                  <span>CALL</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800/40">
                    +{callAmount.toLocaleString()}
                  </span>
                </button>
              )}

              {/* Fold */}
              <button
                onClick={() => {
                  sound.playFold();
                  onFold(pIdx);
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-black text-xs md:text-sm py-3 px-2 rounded-2xl border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
              >
                <X className="w-4 h-4 text-red-400" />
                <span>FOLD</span>
              </button>
            </div>

            {/* All In Button */}
            <button
              disabled={player.chips === 0}
              onClick={() => {
                sound.playFold();
                onAllIn(pIdx);
              }}
              className="w-full bg-emerald-950/40 hover:bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 font-black text-xs py-2 rounded-2xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 uppercase tracking-widest italic disabled:opacity-40 shadow"
            >
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              ALL-IN ({player.chips.toLocaleString()} CHIPS)
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col gap-3 py-1">
      {/* Central HUD / Pot & Blind Controls Header */}
      <div className="w-full bg-gradient-to-r from-zinc-900 via-[#161616] to-zinc-900 border border-zinc-800 rounded-3xl p-3 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Pot Counter Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
              <span>HAND #{handNumber}</span>
              <span>•</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-black text-[9px]">
                {street.toUpperCase()}
              </span>
              <span>•</span>
              <span className="text-emerald-400">
                SB {effectiveSB} / BB {effectiveBB}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              {pot.toLocaleString()}{' '}
              <span className="text-xs font-normal text-zinc-500">Chips</span>
            </div>
          </div>
        </div>

        {/* Blind Multipliers & Shift Dealer Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          {onNextStreet && (
            <button
              onClick={onNextStreet}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-400 font-extrabold text-xs px-3 py-2 rounded-2xl border border-emerald-800 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              title="ขึ้นรอบถัดไป (Pre-flop -> Flop -> Turn -> River)"
            >
              <span>ขึ้นรอบ ({street})</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          )}

          {/* Shift Dealer / SB Button */}
          <button
            onClick={onShiftDealer}
            className="bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-extrabold text-xs px-3 py-2 rounded-2xl border border-amber-800/50 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="Shift Dealer & SB/BB to next player"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>ย้าย Dealer/SB</span>
          </button>
        </div>

        {/* Action Controls: Award Pot & New Hand */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewHand}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-2.5 px-3.5 rounded-2xl border border-zinc-700 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span className="hidden sm:inline">NEW HAND</span>
          </button>

          <button
            onClick={onOpenAwardModal}
            disabled={pot === 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs py-2.5 px-4 rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.4)] disabled:opacity-40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all uppercase tracking-wider"
          >
            <Award className="w-4 h-4" />
            <span>AWARD POT</span>
          </button>
        </div>
      </div>

      {/* Main Side-by-Side (Left-Right) Split Screen Grid for iPad & Tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1">
        {/* Left Side: Player 1 Controller */}
        {renderPlayerPanel(
          player1,
          p1Index,
          true,
          raiseP1,
          setRaiseP1,
          minRaiseP1,
          rotateP1,
          () => setRotateP1((prev) => !prev)
        )}

        {/* Right Side: Player 2 Controller */}
        {renderPlayerPanel(
          player2,
          p2Index,
          false,
          raiseP2,
          setRaiseP2,
          minRaiseP2,
          rotateP2,
          () => setRotateP2((prev) => !prev)
        )}
      </div>
    </div>
  );
};
