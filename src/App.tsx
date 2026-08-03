import React, { useState, useEffect } from 'react';
import { Player, HandRecord, GameSettings } from './types';
import { sound } from './utils/audio';
import { calculatePlayerRoles } from './utils/pokerRules';
import { PokerTable } from './components/PokerTable';
import { ActionControls } from './components/ActionControls';
import { SplitScreenView } from './components/SplitScreenView';
import { AwardPotModal } from './components/AwardPotModal';
import { ManagePlayersModal } from './components/ManagePlayersModal';
import { GameSettingsModal } from './components/GameSettingsModal';
import { HistoryModal } from './components/HistoryModal';
import { QuickBlindSelector } from './components/QuickBlindSelector';
import {
  Coins,
  RotateCcw,
  Users,
  Settings,
  History,
  Trophy,
  Play,
  Clover,
  Columns2,
  LayoutGrid,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const DEFAULT_AVATAR_COLORS = [
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
];

const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Player 1', chips: 1000, currentBet: 0, isFolded: false, isAllIn: false, avatarColor: '#ef4444', isDealer: true, isSmallBlind: true },
  { id: 'p2', name: 'Player 2', chips: 1000, currentBet: 0, isFolded: false, isAllIn: false, avatarColor: '#3b82f6', isBigBlind: true },
  { id: 'p3', name: 'Player 3', chips: 1000, currentBet: 0, isFolded: false, isAllIn: false, avatarColor: '#10b981' },
  { id: 'p4', name: 'Player 4', chips: 1000, currentBet: 0, isFolded: false, isAllIn: false, avatarColor: '#f59e0b' },
];

const DEFAULT_SETTINGS: GameSettings = {
  initialChips: 1000,
  smallBlind: 10,
  bigBlind: 20,
  autoBlinds: false,
  soundEnabled: true,
};

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export default function App() {
  // Load initial state from LocalStorage if available
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('poker_chip_counter_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('poker_chip_counter_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });

  const [pot, setPot] = useState<number>(() => {
    const saved = localStorage.getItem('poker_chip_counter_pot');
    return saved ? JSON.parse(saved) : 0;
  });

  const [currentHighestBet, setCurrentHighestBet] = useState<number>(() => {
    const saved = localStorage.getItem('poker_chip_counter_highbet');
    return saved ? JSON.parse(saved) : 0;
  });

  const [dealerIndex, setDealerIndex] = useState<number>(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [handNumber, setHandNumber] = useState<number>(1);
  const [history, setHistory] = useState<HandRecord[]>([]);

  // Current Betting Round Street (Pre-flop, Flop, Turn, River)
  const [street, setStreet] = useState<Street>('preflop');

  // Blind Multiplier (x1, x2, x3, x4, x5)
  const [blindMultiplier, setBlindMultiplier] = useState<number>(1);

  // Effective Small Blind & Big Blind
  const effectiveSB = settings.smallBlind * blindMultiplier;
  const effectiveBB = settings.bigBlind * blindMultiplier;

  // Split View & Player Selectors State
  const [viewMode, setViewMode] = useState<'split' | 'table'>('split');
  const [p1Index, setP1Index] = useState<number>(0);
  const [p2Index, setP2Index] = useState<number>(1);

  // Modals state
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [isManagePlayersOpen, setIsManagePlayersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('poker_chip_counter_settings', JSON.stringify(settings));
    sound.enabled = settings.soundEnabled;
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('poker_chip_counter_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('poker_chip_counter_pot', JSON.stringify(pot));
  }, [pot]);

  useEffect(() => {
    localStorage.setItem('poker_chip_counter_highbet', JSON.stringify(currentHighestBet));
  }, [currentHighestBet]);

  // Keep player position roles (Dealer, SB, BB) synced
  useEffect(() => {
    if (players.length > 0) {
      const { sbIdx, bbIdx } = calculatePlayerRoles(players.length, dealerIndex);
      setPlayers((prev) =>
        prev.map((p, idx) => {
          const isD = idx === dealerIndex;
          const isSB = idx === sbIdx;
          const isBB = idx === bbIdx;
          if (p.isDealer === isD && p.isSmallBlind === isSB && p.isBigBlind === isBB) {
            return p;
          }
          return {
            ...p,
            isDealer: isD,
            isSmallBlind: isSB,
            isBigBlind: isBB,
          };
        })
      );
    }
  }, [dealerIndex, players.length]);

  // Current active player object
  const activePlayer = players[activePlayerIndex] || players[0] || null;

  // Shift Dealer & SB/BB to next player manually
  const handleShiftDealer = () => {
    sound.playChip();
    const nextDealerIdx = (dealerIndex + 1) % players.length;
    setDealerIndex(nextDealerIdx);

    const { sbIdx, bbIdx } = calculatePlayerRoles(players.length, nextDealerIdx);

    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        isDealer: idx === nextDealerIdx,
        isSmallBlind: idx === sbIdx,
        isBigBlind: idx === bbIdx,
      }))
    );
  };

  // Turn Navigation helper
  const nextTurnFrom = (fromIndex?: number) => {
    if (players.length === 0) return;
    const startIdx = fromIndex !== undefined ? fromIndex : activePlayerIndex;
    let nextIdx = (startIdx + 1) % players.length;

    // Skip folded or broke players if possible
    let attempts = 0;
    while (attempts < players.length && (players[nextIdx].isFolded || (players[nextIdx].chips === 0 && players[nextIdx].currentBet === 0))) {
      nextIdx = (nextIdx + 1) % players.length;
      attempts++;
    }

    setActivePlayerIndex(nextIdx);
  };

  const nextTurn = () => nextTurnFrom();

  // Actions
  const handleCheck = (playerIndex?: number) => {
    const targetIdx = playerIndex !== undefined ? playerIndex : activePlayerIndex;
    const targetPlayer = players[targetIdx];
    if (!targetPlayer) return;

    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === targetIdx ? { ...p, lastAction: 'Check (ผ่าน)' } : p
      )
    );
    nextTurnFrom(targetIdx);
  };

  const handleCall = (playerIndex?: number) => {
    const targetIdx = playerIndex !== undefined ? playerIndex : activePlayerIndex;
    const targetPlayer = players[targetIdx];
    if (!targetPlayer) return;

    const callAmount = Math.max(0, currentHighestBet - targetPlayer.currentBet);
    const actualAdd = Math.min(targetPlayer.chips, callAmount);

    setPot((prev) => prev + actualAdd);
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === targetIdx) {
          const newBet = p.currentBet + actualAdd;
          const newChips = p.chips - actualAdd;
          const isAllIn = newChips === 0;
          return {
            ...p,
            chips: newChips,
            currentBet: newBet,
            isAllIn,
            lastAction: isAllIn ? 'All-In (Call)' : `Call +${actualAdd}`,
          };
        }
        return p;
      })
    );
    nextTurnFrom(targetIdx);
  };

  const handleRaise = (targetTotalBet: number, playerIndex?: number) => {
    const targetIdx = playerIndex !== undefined ? playerIndex : activePlayerIndex;
    const targetPlayer = players[targetIdx];
    if (!targetPlayer) return;

    const chipsToAdd = targetTotalBet - targetPlayer.currentBet;
    if (chipsToAdd <= 0 || chipsToAdd > targetPlayer.chips) return;

    setPot((prev) => prev + chipsToAdd);
    setCurrentHighestBet(targetTotalBet);

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === targetIdx) {
          const newChips = p.chips - chipsToAdd;
          const isAllIn = newChips === 0;
          return {
            ...p,
            chips: newChips,
            currentBet: targetTotalBet,
            isAllIn,
            lastAction: isAllIn ? `All-In (${targetTotalBet})` : `Raise to ${targetTotalBet}`,
          };
        }
        return p;
      })
    );
    nextTurnFrom(targetIdx);
  };

  const handleFold = (playerIndex?: number) => {
    const targetIdx = playerIndex !== undefined ? playerIndex : activePlayerIndex;
    const targetPlayer = players[targetIdx];
    if (!targetPlayer) return;

    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === targetIdx ? { ...p, isFolded: true, lastAction: 'Fold (หมอบ)' } : p
      )
    );
    nextTurnFrom(targetIdx);
  };

  const handleAllIn = (playerIndex?: number) => {
    const targetIdx = playerIndex !== undefined ? playerIndex : activePlayerIndex;
    const targetPlayer = players[targetIdx];
    if (!targetPlayer) return;

    const allInChips = targetPlayer.chips;
    if (allInChips === 0) return;

    const newTotalBet = targetPlayer.currentBet + allInChips;
    setPot((prev) => prev + allInChips);

    if (newTotalBet > currentHighestBet) {
      setCurrentHighestBet(newTotalBet);
    }

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === targetIdx) {
          return {
            ...p,
            chips: 0,
            currentBet: newTotalBet,
            isAllIn: true,
            lastAction: `ALL-IN (${newTotalBet})`,
          };
        }
        return p;
      })
    );
    nextTurnFrom(targetIdx);
  };

  // Award pot to selected winner(s)
  const handleAwardWinners = (winnerIds: string[]) => {
    if (winnerIds.length === 0 || pot === 0) return;

    const share = Math.floor(pot / winnerIds.length);
    const winnersList: { id: string; name: string; amountWon: number }[] = [];

    setPlayers((prev) =>
      prev.map((p) => {
        if (winnerIds.includes(p.id)) {
          winnersList.push({ id: p.id, name: p.name, amountWon: share });
          return { ...p, chips: p.chips + share, lastAction: `Won +${share}` };
        }
        return p;
      })
    );

    // Save Hand Record
    const record: HandRecord = {
      id: Date.now().toString(),
      handNumber,
      potAmount: pot,
      winners: winnersList,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistory((prev) => [record, ...prev]);

    // Reset Pot & Bets
    setPot(0);
    setCurrentHighestBet(0);
    setStreet('preflop');
  };

  // Next Street (ขึ้นรอบถัดไป: Pre-flop -> Flop -> Turn -> River)
  const handleNextStreet = () => {
    sound.playChip();

    // Move to next street
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIdx = streetOrder.indexOf(street);
    const nextStreet = streetOrder[(currentIdx + 1) % streetOrder.length];
    setStreet(nextStreet);

    // Keep cumulative currentBet intact across streets for the hand
    setPlayers((prev) =>
      prev.map((p) => ({
        ...p,
        lastAction: p.isFolded ? 'Folded' : `Street: ${nextStreet.toUpperCase()}`,
      }))
    );

    // Find first non-folded player left of Dealer to act post-flop
    const { sbIdx } = calculatePlayerRoles(players.length, dealerIndex);
    let startSearch = sbIdx !== -1 ? sbIdx : (dealerIndex + 1) % players.length;
    let attempts = 0;
    while (attempts < players.length && (players[startSearch].isFolded || (players[startSearch].chips === 0 && players[startSearch].currentBet === 0))) {
      startSearch = (startSearch + 1) % players.length;
      attempts++;
    }
    setActivePlayerIndex(startSearch);
  };

  // Start "New Hand" (เริ่มรอบใหม่)
  const handleNewHand = () => {
    sound.playChip();
    setHandNumber((prev) => prev + 1);
    setStreet('preflop');

    // Move Dealer button to next player
    const nextDealerIdx = (dealerIndex + 1) % players.length;
    setDealerIndex(nextDealerIdx);

    const { sbIdx, bbIdx } = calculatePlayerRoles(players.length, nextDealerIdx);

    let initialPot = 0;
    let initialHighBet = 0;

    // Auto Blinds deduction if enabled in settings
    if (settings.autoBlinds && sbIdx !== -1 && bbIdx !== -1) {
      const sbPlayer = players[sbIdx];
      const bbPlayer = players[bbIdx];

      const sbPost = Math.min(sbPlayer.chips, effectiveSB);
      const bbPost = Math.min(bbPlayer.chips, effectiveBB);

      initialPot = sbPost + bbPost;
      initialHighBet = Math.max(sbPost, bbPost);

      setPlayers((prev) =>
        prev.map((p, idx) => {
          let currentBet = 0;
          let chips = p.chips;
          let lastAction: string | undefined = undefined;

          if (idx === sbIdx) {
            currentBet = sbPost;
            chips -= sbPost;
            lastAction = `Posted SB (${sbPost})`;
          } else if (idx === bbIdx) {
            currentBet = bbPost;
            chips -= bbPost;
            lastAction = `Posted BB (${bbPost})`;
          }

          return {
            ...p,
            chips,
            currentBet,
            isFolded: false,
            isAllIn: chips === 0 && currentBet > 0,
            lastAction,
            isDealer: idx === nextDealerIdx,
            isSmallBlind: idx === sbIdx,
            isBigBlind: idx === bbIdx,
          };
        })
      );
    } else {
      // Reset bets & status without auto deduction
      setPlayers((prev) =>
        prev.map((p, idx) => ({
          ...p,
          currentBet: 0,
          isFolded: false,
          isAllIn: false,
          lastAction: undefined,
          isDealer: idx === nextDealerIdx,
          isSmallBlind: idx === sbIdx,
          isBigBlind: idx === bbIdx,
        }))
      );
    }

    setPot(initialPot);
    setCurrentHighestBet(initialHighBet);

    // Set turn to player after BB (UTG), or SB in 2-player heads up
    if (players.length === 2) {
      setActivePlayerIndex(sbIdx);
    } else {
      setActivePlayerIndex((bbIdx + 1) % players.length);
    }
  };

  // Reset Game completely (Reset All)
  const handleResetGame = () => {
    sound.playFold();
    setPot(0);
    setCurrentHighestBet(0);
    setHandNumber(1);
    setDealerIndex(0);
    setActivePlayerIndex(0);
    setBlindMultiplier(1);
    setStreet('preflop');
    setHistory([]);

    const { sbIdx, bbIdx } = calculatePlayerRoles(INITIAL_PLAYERS.length, 0);

    setPlayers(
      INITIAL_PLAYERS.map((p, idx) => ({
        ...p,
        chips: settings.initialChips,
        currentBet: 0,
        isFolded: false,
        isAllIn: false,
        lastAction: undefined,
        isDealer: idx === 0,
        isSmallBlind: idx === sbIdx,
        isBigBlind: idx === bbIdx,
      }))
    );
  };

  // Player Management
  const handleAddPlayer = (name: string, startingChips: number) => {
    const newP: Player = {
      id: `p_${Date.now()}`,
      name,
      chips: startingChips,
      currentBet: 0,
      isFolded: false,
      isAllIn: false,
      avatarColor: DEFAULT_AVATAR_COLORS[players.length % DEFAULT_AVATAR_COLORS.length],
    };
    setPlayers((prev) => [...prev, newP]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setActivePlayerIndex(0);
  };

  const handleUpdatePlayerName = (id: string, newName: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const handleAddChipsToPlayer = (id: string, amount: number) => {
    sound.playChip();
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, chips: p.chips + amount } : p)));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col items-center justify-between font-sans selection:bg-emerald-500 selection:text-black">
      {/* Screen Shell Container (Supports iPad/Tablet Side-by-Side & Mobile) */}
      <div className="w-full max-w-md sm:max-w-2xl md:max-w-5xl lg:max-w-6xl min-h-screen flex flex-col justify-between bg-[#0a0a0a] shadow-2xl relative border-x border-zinc-800">
        
        {/* Top Navigation Bar */}
        <header className="px-3.5 py-2.5 bg-[#111111] border-b border-zinc-800 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(16,185,129,0.35)] font-bold shrink-0">
              <Clover className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="text-xs font-black tracking-tight text-white flex items-center gap-1">
                ELITE STACK
                <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1 py-0.2 rounded border border-emerald-800/60 uppercase">
                  {viewMode === 'split' ? '2P SPLIT' : 'RING TABLE'}
                </span>
              </h1>
              <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
                Blinds: SB {effectiveSB} / BB {effectiveBB}
              </p>
            </div>
          </div>

          {/* Quick Blind Selector & Custom Blind Trigger */}
          <QuickBlindSelector
            settings={settings}
            blindMultiplier={blindMultiplier}
            onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
            onSetBlindMultiplier={setBlindMultiplier}
          />

          {/* View Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-emerald-600 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Split Screen 2-Player Controls"
            >
              <Columns2 className="w-3 h-3" />
              <span>Split 2P</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-emerald-600 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Full Table Ring View"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Table</span>
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-emerald-400 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Hand History"
            >
              <History className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsManagePlayersOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-emerald-400 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Manage Players"
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-emerald-400 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Main Body Content */}
        {viewMode === 'split' ? (
          <main className="flex-1 p-2 flex flex-col overflow-y-auto">
            <SplitScreenView
              players={players}
              p1Index={p1Index}
              p2Index={p2Index}
              activePlayerIndex={activePlayerIndex}
              currentHighestBet={currentHighestBet}
              pot={pot}
              handNumber={handNumber}
              effectiveSB={effectiveSB}
              effectiveBB={effectiveBB}
              blindMultiplier={blindMultiplier}
              street={street}
              onSetBlindMultiplier={setBlindMultiplier}
              onShiftDealer={handleShiftDealer}
              onCheck={(idx) => handleCheck(idx)}
              onCall={(idx) => handleCall(idx)}
              onRaise={(idx, amt) => handleRaise(amt, idx)}
              onFold={(idx) => handleFold(idx)}
              onAllIn={(idx) => handleAllIn(idx)}
              onNextStreet={handleNextStreet}
              onOpenAwardModal={() => setIsAwardModalOpen(true)}
              onNewHand={handleNewHand}
              onChangeP1Index={setP1Index}
              onChangeP2Index={setP2Index}
            />
          </main>
        ) : (
          <>
            <main className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
              {/* Quick Blind Multipliers & Shift Dealer Toolbar for Table View */}
              <div className="bg-zinc-900/80 p-2 rounded-2xl border border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">
                    Street / รอบ:
                  </span>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 text-xs font-black uppercase rounded-lg">
                    {street}
                  </span>
                  <button
                    onClick={handleNextStreet}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black px-2.5 py-1 text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95 uppercase tracking-wider"
                    title="ขึ้นรอบถัดไป (Pre-flop -> Flop -> Turn -> River)"
                  >
                    <span>ขึ้นรอบถัดไป (Next Street)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleShiftDealer}
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs px-2.5 py-1 rounded-xl border border-amber-800/40 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                  title="Shift Dealer & SB/BB to next player"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>ย้าย Dealer/SB</span>
                </button>
              </div>

              {/* Poker Felt Table Representation */}
              <PokerTable
                pot={pot}
                currentHighestBet={currentHighestBet}
                players={players}
                activePlayerId={activePlayer?.id || ''}
                onSelectPlayer={(id) => {
                  const idx = players.findIndex((p) => p.id === id);
                  if (idx !== -1) setActivePlayerIndex(idx);
                }}
                onOpenAwardModal={() => setIsAwardModalOpen(true)}
                handNumber={handNumber}
              />

              {/* Quick Hand Action Row: New Hand & Award Pot */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleNewHand}
                  className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs py-2.5 px-3 rounded-2xl border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span>NEW HAND (เริ่มมือใหม่)</span>
                </button>

                <button
                  onClick={() => setIsAwardModalOpen(true)}
                  disabled={pot === 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs py-2.5 px-3 rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.4)] transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 uppercase tracking-wider"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>AWARD POT ({pot.toLocaleString()})</span>
                </button>
              </div>
            </main>

            {/* Bottom Action Console Panel */}
            <footer className="sticky bottom-0 z-30 w-full">
              <ActionControls
                activePlayer={activePlayer}
                currentHighestBet={currentHighestBet}
                pot={pot}
                effectiveSB={effectiveSB}
                effectiveBB={effectiveBB}
                street={street}
                onCheck={() => handleCheck()}
                onCall={() => handleCall()}
                onRaise={(amt) => handleRaise(amt)}
                onFold={() => handleFold()}
                onAllIn={() => handleAllIn()}
                onNextTurn={nextTurn}
                onNextStreet={handleNextStreet}
              />
            </footer>
          </>
        )}
      </div>

      {/* Modals */}
      <AwardPotModal
        pot={pot}
        players={players}
        isOpen={isAwardModalOpen}
        onClose={() => setIsAwardModalOpen(false)}
        onAwardWinners={handleAwardWinners}
      />

      <ManagePlayersModal
        players={players}
        isOpen={isManagePlayersOpen}
        onClose={() => setIsManagePlayersOpen(false)}
        onAddPlayer={handleAddPlayer}
        onRemovePlayer={handleRemovePlayer}
        onUpdatePlayerName={handleUpdatePlayerName}
        onAddChipsToPlayer={handleAddChipsToPlayer}
        initialChips={settings.initialChips}
      />

      <GameSettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onResetGame={handleResetGame}
      />

      <HistoryModal
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
