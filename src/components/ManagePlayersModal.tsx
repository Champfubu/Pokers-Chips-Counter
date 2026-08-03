import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus, Trash2, PlusCircle, X, Edit3, Check, Users } from 'lucide-react';

interface ManagePlayersModalProps {
  players: Player[];
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (name: string, chips: number) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayerName: (id: string, newName: string) => void;
  onAddChipsToPlayer: (id: string, amount: number) => void;
  initialChips: number;
}

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'
];

export const ManagePlayersModal: React.FC<ManagePlayersModalProps> = ({
  players,
  isOpen,
  onClose,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerName,
  onAddChipsToPlayer,
  initialChips,
}) => {
  if (!isOpen) return null;

  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddPlayer(newPlayerName.trim(), initialChips);
    setNewPlayerName('');
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      onUpdatePlayerName(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#111111] border border-zinc-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-zinc-100 font-extrabold text-lg">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Manage Players</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Player Form */}
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Player Name..."
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs px-3 py-2.5 rounded-xl disabled:opacity-40 flex items-center gap-1 cursor-pointer shrink-0 transition-all uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4 text-black" />
            <span>Add</span>
          </button>
        </form>

        {/* Player List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 max-h-60">
          {players.map((player) => (
            <div
              key={player.id}
              className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>

                {editingId === player.id ? (
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-zinc-900 border border-emerald-500 text-xs text-white px-2 py-1 rounded w-full focus:outline-none"
                    />
                    <button
                      onClick={() => saveEdit(player.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-xs truncate text-zinc-200 flex items-center gap-1">
                      {player.name}
                      <button
                        onClick={() => startEdit(player)}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium tabular-nums">
                      {player.chips.toLocaleString()} Chips
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Rebuy (+500 / +1000) & Delete */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAddChipsToPlayer(player.id, 500)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-bold text-[10px] px-2 py-1 rounded-lg border border-zinc-700 flex items-center gap-0.5 cursor-pointer transition-colors"
                  title="Rebuy +500 Chips"
                >
                  <PlusCircle className="w-3 h-3 text-emerald-400" />
                  +500
                </button>

                {players.length > 2 && (
                  <button
                    onClick={() => onRemovePlayer(player.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg cursor-pointer transition-colors"
                    title="Remove Player"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Done Button */}
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
