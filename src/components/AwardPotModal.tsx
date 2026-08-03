import React, { useState } from 'react';
import { Player } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Check, X, Users, Sparkles, AlertCircle } from 'lucide-react';

interface AwardPotModalProps {
  pot: number;
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  onAwardWinners: (winnerIds: string[]) => void;
}

export const AwardPotModal: React.FC<AwardPotModalProps> = ({
  pot,
  players,
  isOpen,
  onClose,
  onAwardWinners,
}) => {
  if (!isOpen) return null;

  // Filter non-folded players by default
  const activePlayers = players.filter((p) => !p.isFolded);
  const eligiblePlayers = activePlayers.length > 0 ? activePlayers : players;

  const [selectedWinnerIds, setSelectedWinnerIds] = useState<string[]>(
    eligiblePlayers.length === 1 ? [eligiblePlayers[0].id] : []
  );

  const toggleWinner = (id: string) => {
    setSelectedWinnerIds((prev) =>
      prev.includes(id) ? prev.filter((wId) => wId !== id) : [...prev, id]
    );
  };

  const handleConfirmAward = () => {
    if (selectedWinnerIds.length === 0) return;

    // Trigger confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#3b82f6', '#ffffff'],
      });
    } catch {
      // Ignore if confetti fails
    }

    sound.playWin();
    onAwardWinners(selectedWinnerIds);
    onClose();
  };

  const sharePerWinner =
    selectedWinnerIds.length > 0 ? Math.floor(pot / selectedWinnerIds.length) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
            <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
            <span>Award Pot</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pot Summary Box */}
        <div className="bg-gradient-to-b from-[#181818] to-[#101010] p-4 rounded-2xl border border-zinc-800 text-center shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
            TOTAL POT TO AWARD
          </div>
          <div className="text-3xl font-black text-emerald-400 my-1 tabular-nums drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            {pot.toLocaleString()} <span className="text-xs font-normal text-zinc-400">Chips</span>
          </div>

          {selectedWinnerIds.length > 1 && (
            <div className="mt-2 text-xs text-emerald-400 font-medium bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40 inline-block">
              Split Pot ({selectedWinnerIds.length} Winners):{' '}
              <span className="font-bold text-white">+{sharePerWinner.toLocaleString()} / winner</span>
            </div>
          )}
        </div>

        {/* Winner Selector Instructions */}
        <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Select the winning player(s):</span>
        </div>

        {/* Players List */}
        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
          {eligiblePlayers.map((player) => {
            const isSelected = selectedWinnerIds.includes(player.id);

            return (
              <button
                key={player.id}
                onClick={() => toggleWinner(player.id)}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xs">{player.name}</div>
                    <div className="text-[10px] text-zinc-500">
                      Current Balance: {player.chips.toLocaleString()} Chips
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    isSelected
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-zinc-700 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </button>
            );
          })}
        </div>

        {selectedWinnerIds.length === 0 && (
          <div className="text-[11px] text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Please select at least 1 winner to award the pot.</span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-3 rounded-2xl cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAward}
            disabled={selectedWinnerIds.length === 0}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs py-3 rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.4)] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider"
          >
            <Trophy className="w-4 h-4" />
            <span>Award Pot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
