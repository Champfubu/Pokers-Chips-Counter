import React, { useState } from 'react';
import { GameSettings } from '../types';
import { sound } from '../utils/audio';
import { SlidersHorizontal, ChevronDown, Check, Zap } from 'lucide-react';

interface QuickBlindSelectorProps {
  settings: GameSettings;
  blindMultiplier: number;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onSetBlindMultiplier: (mult: number) => void;
}

const PRESET_BLINDS = [
  { sb: 1, bb: 2 },
  { sb: 5, bb: 10 },
  { sb: 10, bb: 20 },
  { sb: 25, bb: 50 },
  { sb: 50, bb: 100 },
  { sb: 100, bb: 200 },
  { sb: 500, bb: 1000 },
];

export const QuickBlindSelector: React.FC<QuickBlindSelectorProps> = ({
  settings,
  blindMultiplier,
  onUpdateSettings,
  onSetBlindMultiplier,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customSB, setCustomSB] = useState<number>(settings.smallBlind);
  const [customBB, setCustomBB] = useState<number>(settings.bigBlind);

  const effectiveSB = settings.smallBlind * blindMultiplier;
  const effectiveBB = settings.bigBlind * blindMultiplier;

  const handleApplyCustom = () => {
    sound.playChip();
    onUpdateSettings({
      smallBlind: customSB,
      bigBlind: customBB,
    });
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-700/80 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
        title="Custom Blind Settings"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          Blinds: <strong className="text-emerald-400 font-mono">SB {effectiveSB} / BB {effectiveBB}</strong>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-[#141414] border border-zinc-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              ระบุขนาด Blind (Quick Blinds)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Current: {settings.smallBlind}/{settings.bigBlind}
            </span>
          </div>

          {/* Quick Preset Buttons Grid */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">Presets สำเร็จรูป:</span>
            <div className="grid grid-cols-4 gap-1">
              {PRESET_BLINDS.map((pair) => (
                <button
                  key={`${pair.sb}_${pair.bb}`}
                  onClick={() => {
                    sound.playChip();
                    setCustomSB(pair.sb);
                    setCustomBB(pair.bb);
                    onUpdateSettings({ smallBlind: pair.sb, bigBlind: pair.bb });
                  }}
                  className={`py-1 px-1.5 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer ${
                    settings.smallBlind === pair.sb && settings.bigBlind === pair.bb
                      ? 'bg-emerald-600 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {pair.sb}/{pair.bb}
                </button>
              ))}
            </div>
          </div>

          {/* Custom SB / BB Direct Input Fields */}
          <div className="flex flex-col gap-1 bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">กรอกระบุตัวเลขเอง (Custom SB/BB):</span>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-400">Small Blind (SB)</span>
                <input
                  type="number"
                  min={1}
                  value={customSB}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setCustomSB(val);
                    if (val * 2 > customBB) setCustomBB(val * 2);
                  }}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-zinc-400">Big Blind (BB)</span>
                <input
                  type="number"
                  min={2}
                  value={customBB}
                  onChange={(e) => {
                    const val = Math.max(2, Number(e.target.value));
                    setCustomBB(val);
                    if (Math.floor(val / 2) < customSB) setCustomSB(Math.max(1, Math.floor(val / 2)));
                  }}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              onClick={handleApplyCustom}
              className="mt-1.5 w-full bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 uppercase tracking-wider"
            >
              <Check className="w-3.5 h-3.5" />
              บันทึกขนาด Blind
            </button>
          </div>

          {/* Blind Multipliers Bar */}
          <div className="flex flex-col gap-1 border-t border-zinc-800 pt-2">
            <span className="text-[10px] text-zinc-400 font-semibold uppercase">ตัวคูณ Blind (Multiplier):</span>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((mult) => (
                <button
                  key={mult}
                  onClick={() => {
                    sound.playChip();
                    onSetBlindMultiplier(mult);
                  }}
                  className={`py-1 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                    blindMultiplier === mult
                      ? 'bg-emerald-600 border-emerald-500 text-black'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  x{mult}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
