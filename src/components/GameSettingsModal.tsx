import React, { useState } from 'react';
import { GameSettings } from '../types';
import { Settings, Volume2, VolumeX, RotateCcw, X, ShieldAlert, Check } from 'lucide-react';

interface GameSettingsModalProps {
  settings: GameSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetGame: () => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onResetGame,
}) => {
  if (!isOpen) return null;

  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    onResetGame();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-100 font-extrabold text-lg">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Game Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Initial Chips Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-zinc-400 font-medium">
            Initial Stack per Player:
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[500, 1000, 2000, 5000].map((val) => (
              <button
                key={val}
                onClick={() => onUpdateSettings({ initialChips: val })}
                className={`py-2 text-xs font-bold rounded-xl border cursor-pointer transition-all ${
                  settings.initialChips === val
                    ? 'bg-emerald-600 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Blinds Structure Settings (SB / BB) */}
        <div className="flex flex-col gap-2 p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <label className="text-xs text-zinc-200 font-bold flex items-center justify-between">
            <span>Blind Structure (ค่า Blind):</span>
            <span className="text-emerald-400 font-mono text-xs">
              SB {settings.smallBlind} / BB {settings.bigBlind}
            </span>
          </label>

          {/* Quick Preset Pairs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { sb: 5, bb: 10 },
              { sb: 10, bb: 20 },
              { sb: 25, bb: 50 },
              { sb: 50, bb: 100 },
            ].map((pair) => (
              <button
                key={pair.bb}
                onClick={() =>
                  onUpdateSettings({ smallBlind: pair.sb, bigBlind: pair.bb })
                }
                className={`py-1.5 text-[11px] font-extrabold rounded-xl border cursor-pointer transition-all ${
                  settings.smallBlind === pair.sb && settings.bigBlind === pair.bb
                    ? 'bg-emerald-600 border-emerald-500 text-black'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {pair.sb}/{pair.bb}
              </button>
            ))}
          </div>

          {/* Custom Small & Big Blind Inputs */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Small Blind (SB):</span>
              <input
                type="number"
                min={1}
                value={settings.smallBlind}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value));
                  onUpdateSettings({ smallBlind: val, bigBlind: Math.max(val * 2, settings.bigBlind) });
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-zinc-400">Big Blind (BB):</span>
              <input
                type="number"
                min={2}
                value={settings.bigBlind}
                onChange={(e) => {
                  const val = Math.max(2, Number(e.target.value));
                  onUpdateSettings({ bigBlind: val, smallBlind: Math.min(Math.floor(val / 2), settings.smallBlind) });
                }}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Auto Post Blinds Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 mt-1">
            <span className="text-[11px] text-zinc-300 font-medium">
              Auto-Deduct SB/BB on New Hand:
            </span>
            <button
              onClick={() => onUpdateSettings({ autoBlinds: !settings.autoBlinds })}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.autoBlinds ? 'bg-emerald-500' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.autoBlinds ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
            <span>Sound Effects</span>
          </div>

          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              settings.soundEnabled ? 'bg-emerald-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Reset Game Section */}
        <div className="border-t border-zinc-800 pt-3 flex flex-col gap-2">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Reset Entire Game:
          </span>

          {confirmReset ? (
            <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-2xl flex flex-col gap-2">
              <span className="text-[11px] text-red-300 font-medium">
                Are you sure? Reset all chips back to {settings.initialChips.toLocaleString()} and clear hand history!
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-zinc-800 text-zinc-300 font-bold text-xs py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs py-2 rounded-xl shadow"
                >
                  Yes, Reset All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-900/40 font-bold text-xs py-2.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Game to Initial Chips</span>
            </button>
          )}
        </div>

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
