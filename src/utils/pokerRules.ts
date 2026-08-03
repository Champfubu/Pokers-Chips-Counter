export function calculatePlayerRoles(totalPlayers: number, dealerIndex: number) {
  if (totalPlayers < 2) {
    return { dealerIdx: dealerIndex, sbIdx: -1, bbIdx: -1 };
  }
  if (totalPlayers === 2) {
    return {
      dealerIdx: dealerIndex,
      sbIdx: dealerIndex, // In heads up, Dealer is SB
      bbIdx: (dealerIndex + 1) % 2, // Other player is BB
    };
  }
  return {
    dealerIdx: dealerIndex,
    sbIdx: (dealerIndex + 1) % totalPlayers,
    bbIdx: (dealerIndex + 2) % totalPlayers,
  };
}
