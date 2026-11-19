// Monte Carlo Simulator for Magical-Athlete-inspired Trick-Taking Game
// Run with: "C:\Program Files\nodejs\node.exe" sim.js

const COLORS = ['R', 'B', 'Y', 'G'];
const INF = 1e9;

function makeDeck() {
  return [
    // RED
    { id: 'Sprinter', color: 'R', base: 8, tags: ['pos', 'lead'] },
    { id: 'Bouncer', color: 'R', base: 4, tags: ['chaos', 'remove'] },
    { id: 'Saboteur', color: 'R', base: 3, tags: ['chaos', 'cancel'] },
    { id: 'Giant-Slayer', color: 'R', base: 2, tags: ['synergy', 'counter'] },
    { id: 'Blitz', color: 'R', base: 5, tags: ['tempo', 'early'] },
    { id: 'Rival', color: 'R', base: 4, tags: ['synergy', 'color'] },
    { id: 'Hothead', color: 'R', base: 9, tags: ['greedy', 'high'] },
    { id: 'Showboat', color: 'R', base: 7, tags: ['greedy', 'prize'] },
    { id: 'Martyr', color: 'R', base: 1, tags: ['chaos', 'punish'] },

    // BLUE
    { id: 'Mirror', color: 'B', base: 5, tags: ['chaos', 'swap'] },
    { id: 'Nullifier', color: 'B', base: 6, tags: ['chaos', 'cancel'] },
    { id: 'Frostbite', color: 'B', base: 5, tags: ['chaos', 'debuff'] },
    { id: 'Tactician', color: 'B', base: 4, tags: ['tempo', 'early'] },
    { id: 'Tide-Turner', color: 'B', base: 2, tags: ['tempo', 'lowprize'] },
    { id: 'Lone Wolf', color: 'B', base: 9, tags: ['greedy', 'color'] },
    { id: 'Anchor', color: 'B', base: 8, tags: ['tempo', 'last'] },
    { id: 'Pacifist', color: 'B', base: 9, tags: ['greedy', 'high'] },
    { id: 'Flipper', color: 'B', base: 6, tags: ['chaos', 'invert'] },

    // YELLOW
    { id: 'Kingmaker', color: 'Y', base: 3, tags: ['chaos', 'buff'] },
    { id: 'Infinity', color: 'Y', base: INF, tags: ['greedy', 'high'] },
    { id: 'High-Roller', color: 'Y', base: 4, tags: ['greedy', 'prize'] },
    { id: 'Gambler', color: 'Y', base: 0, tags: ['tempo', 'last'] },
    { id: 'Underdog', color: 'Y', base: 2, tags: ['synergy', 'low'] },
    { id: 'Tiebreaker', color: 'Y', base: 6, tags: ['tempo', 'tie'] },
    { id: 'Spoiler', color: 'Y', base: 2, tags: ['tempo', 'lead'] },
    { id: 'Midas', color: 'Y', base: 7, tags: ['tempo', 'lowprize'] },
    { id: 'Pickpocket', color: 'Y', base: 4, tags: ['chaos', 'punish'] },

    // GREEN
    { id: 'Copycat', color: 'G', base: 0, tags: ['synergy', 'copy'] },
    { id: 'Scapegoat', color: 'G', base: 1, tags: ['synergy', 'immune'] },
    { id: 'Leech', color: 'G', base: 3, tags: ['synergy', 'low'] },
    { id: 'Crowd-Surfer', color: 'G', base: 4, tags: ['synergy', 'color'] },
    { id: 'Tax Collector', color: 'G', base: 4, tags: ['synergy', 'low'] },
    { id: 'Late Bloomer', color: 'G', base: 2, tags: ['synergy', 'scale'] },
    { id: 'Vampire', color: 'G', base: 6, tags: ['synergy', 'remove'] },
    { id: 'Chameleon', color: 'G', base: 4, tags: ['synergy', 'color', 'chaos'] },
    { id: 'Middleman', color: 'G', base: 7, tags: ['tempo', 'mid'] },
  ];
}

function makePrizeDeck() {
  const deck = [];
  for (let v = 0; v <= 5; v++) {
    for (let k = 0; k < 3; k++) deck.push(v);
  }
  return deck;
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Fast seeded PRNG (Mulberry32)
function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function resolveTrick(plays, prizeVal, roundNum) {
  // plays: [{ player, card, handRemaining }]
  const n = plays.length;
  const entries = plays.map((p, idx) => ({
    player: p.player,
    card: p.card,
    effId: p.card.id,
    pos: idx,
    baseVal: p.card.base,
    effVal: p.card.base,
    colors: [p.card.color],
    removed: false,
    powerCanceled: false,
    modifiersCanceled: false,
    immune: p.card.id === 'Scapegoat',
    eligible: true,
    handRemaining: p.handRemaining,
    kingmakerBuff: 0,
  }));

  // --- STEP 1: DISRUPT ---
  // Copycat copies immediately preceding card's Base Value and Power (+1 bonus)
  for (let i = 0; i < n; i++) {
    const e = entries[i];
    if (e.effId === 'Copycat' && i > 0) {
      const prev = entries[i - 1];
      e.effId = prev.effId;
      e.baseVal = prev.baseVal >= INF ? INF : prev.baseVal + 1;
      e.effVal = e.baseVal;
      if (e.effId === 'Scapegoat') e.immune = true;
    }
  }

  // Saboteur cancels powers of all cards played BEFORE it;
  // Nullifier cancels powers of all cards played AFTER it (resolved in play order)
  for (let i = 0; i < n; i++) {
    const e = entries[i];
    if (e.effId === 'Saboteur' && !e.powerCanceled) {
      for (let j = 0; j < i; j++) {
        if (!entries[j].immune) entries[j].powerCanceled = true;
      }
    } else if (e.effId === 'Nullifier' && !e.powerCanceled) {
      for (let j = i + 1; j < n; j++) {
        if (!entries[j].immune) entries[j].powerCanceled = true;
      }
    }
  }

  // Mirror swaps baseVal with led card
  for (let i = 1; i < n; i++) {
    const e = entries[i];
    if (e.effId === 'Mirror' && !e.powerCanceled) {
      const lead = entries[0];
      const tmp = e.baseVal;
      e.baseVal = lead.baseVal;
      lead.baseVal = tmp;
    }
  }

  // Kingmaker buffs previous card by +4
  for (let i = 1; i < n; i++) {
    const e = entries[i];
    if (e.effId === 'Kingmaker' && !e.powerCanceled) {
      entries[i - 1].kingmakerBuff += 4;
    }
  }

  // Bouncer removes highest other non-removed, non-immune card
  let anyRemoved = false;
  for (let i = 0; i < n; i++) {
    const e = entries[i];
    if (e.effId === 'Bouncer' && !e.powerCanceled && !e.removed) {
      let bestIdx = -1;
      let bestVal = -1;
      for (let j = 0; j < n; j++) {
        if (j === i || entries[j].removed || entries[j].immune) continue;
        if (entries[j].baseVal > bestVal) {
          bestVal = entries[j].baseVal;
          bestIdx = j;
        }
      }
      if (bestIdx !== -1) {
        entries[bestIdx].removed = true;
        anyRemoved = true;
      }
    }
  }

  const active = entries.filter((e) => !e.removed);
  const globalModifiersCanceled = false;

  // Chameleon color expansion (counts as all 4 colors)
  for (const e of active) {
    if (e.effId === 'Chameleon' && !e.powerCanceled) {
      e.colors = ['R', 'B', 'Y', 'G'];
    }
  }

  // --- STEP 2: MODIFY VALUES ---
  for (const e of active) {
    e.effVal = e.baseVal;
  }

  if (!globalModifiersCanceled) {
    // Set replacement values first (Infinity, Giant-Slayer, Gambler)
    for (const e of active) {
      if (e.powerCanceled) continue;
      if (e.effId === 'Infinity') {
        e.effVal = INF;
      } else if (e.effId === 'Giant-Slayer') {
        if (active.some((o) => o.baseVal >= 8)) e.effVal = 11;
      } else if (e.effId === 'Gambler') {
        if (e.pos === n - 1) e.effVal = 10;
      }
    }

    // Additive modifiers
    let frostbiteCount = 0;
    for (const e of active) {
      if (e.effId === 'Frostbite' && !e.powerCanceled) frostbiteCount++;
    }

    for (const e of active) {
      if (e.effVal >= INF) continue; // Infinity stays Infinity

      e.effVal += e.kingmakerBuff;

      // Frostbite from other cards
      const otherFrost = frostbiteCount - (e.effId === 'Frostbite' && !e.powerCanceled ? 1 : 0);
      e.effVal -= 2 * otherFrost;

      if (!e.powerCanceled) {
        switch (e.effId) {
          case 'Blitz':
            if (e.pos <= 1) e.effVal += 3;
            break;
          case 'Rival':
            if (active.some((o) => o !== e && o.colors.includes('R'))) e.effVal += 4;
            break;
          case 'Tactician':
            e.effVal += 2 * e.handRemaining;
            break;
          case 'Tide-Turner':
            if (prizeVal <= 1) e.effVal += 4;
            break;
          case 'High-Roller':
            if (prizeVal >= 4) e.effVal += 4;
            break;
          case 'Leech': {
            const others = active.filter((o) => o !== e);
            if (others.length > 0) {
              const minOther = Math.min(...others.map((o) => (o.baseVal >= INF ? 10 : o.baseVal)));
              e.effVal += minOther;
            }
            break;
          }
          case 'Crowd-Surfer': {
            const matches = active.filter(
              (o) => o !== e && o.colors.some((c) => e.colors.includes(c))
            ).length;
            e.effVal += 3 * matches;
            break;
          }
          case 'Tax Collector': {
            const lows = active.filter((o) => o.baseVal <= 3).length;
            e.effVal += 3 * lows;
            break;
          }
          case 'Late Bloomer':
            e.effVal += 2 * (roundNum - 1);
            break;
          case 'Vampire':
            if (anyRemoved) e.effVal += 3;
            break;
        }
      }
      if (e.effVal < 0) e.effVal = 0;
    }
  }

  // --- STEP 3: ELIGIBILITY ---
  const minActiveBase = active.length ? Math.min(...active.map((o) => o.baseVal)) : 0;
  for (const e of active) {
    if (e.powerCanceled) continue;
    switch (e.effId) {
      case 'Sprinter':
        if (e.pos !== 0) e.eligible = false;
        break;
      case 'Hothead':
        if (active.some((o) => o !== e && o.colors.includes('B'))) e.eligible = false;
        break;
      case 'Lone Wolf':
        if (active.some((o) => o !== e && o.colors.some((c) => e.colors.includes(c)))) {
          e.eligible = false;
        }
        break;
      case 'Anchor':
        if (e.pos !== n - 1) e.eligible = false;
        break;
      case 'Pacifist':
        if (active.some((o) => o !== e && o.baseVal <= 3)) e.eligible = false;
        break;
      case 'Underdog': {
        const strictlyLowest = active.every((o) => o === e || o.baseVal > e.baseVal);
        if (!strictlyLowest) e.eligible = false;
        break;
      }
      case 'Middleman':
        if (e.pos === 0 || e.pos === n - 1) e.eligible = false;
        break;
      case 'Infinity':
        if (active.some((o) => o !== e && o.baseVal <= 2)) e.eligible = false;
        break;
    }
  }

  // --- STEP 4: COMPARE & TIEBREAK ---
  const lowestWins = active.some((e) => e.effId === 'Flipper' && !e.powerCanceled);
  const eligible = active.filter((e) => e.eligible);

  let winnerEntry = null;
  let deadlockReason = null;

  if (eligible.length === 0) {
    deadlockReason = 'none_eligible';
  } else {
    const targetVal = lowestWins
      ? Math.min(...eligible.map((e) => e.effVal))
      : Math.max(...eligible.map((e) => e.effVal));
    const tied = eligible.filter((e) => e.effVal === targetVal);

    if (tied.length === 1) {
      winnerEntry = tied[0];
    } else {
      const tiebreakers = tied.filter((e) => e.effId === 'Tiebreaker' && !e.powerCanceled);
      if (tiebreakers.length === 1) {
        winnerEntry = tiebreakers[0];
      } else {
        deadlockReason = 'tie_cancel';
      }
    }
  }

  // Check Spoiler (if a Spoiler lost, its owner leads next)
  let nextLeader = winnerEntry ? winnerEntry.player : plays[0].player;
  if (winnerEntry) {
    const losingSpoilers = active.filter(
      (e) => e.effId === 'Spoiler' && !e.powerCanceled && e !== winnerEntry
    );
    if (losingSpoilers.length > 0) {
      nextLeader = losingSpoilers[losingSpoilers.length - 1].player;
    }
  }

  return {
    winner: winnerEntry ? winnerEntry.player : null,
    winnerCard: winnerEntry ? winnerEntry.card : null,
    winnerEffId: winnerEntry ? winnerEntry.effId : null,
    nextLeader,
    deadlockReason,
    activeEntries: active,
  };
}

// --- PLAYER PROFILES ---
// 'Shark': high base values, plays strongest on high prizes, dumps weak on low prizes
// 'Tactician': positional & lead-control, fights for 0-1 prizes if next prize is 4-5
// 'Chaos': disruption & steal/punish, saves disruptors for big prizes
// 'Synergy': color matching & scaling cards, plays combos together

function scoreDraftCard(card, hand, profile, rng) {
  const baseScore = card.base >= INF ? 10.5 : card.base;
  let s = baseScore + rng() * 0.4;

  if (profile === 'Shark') {
    if (card.tags.includes('greedy') || card.tags.includes('high')) s += 4.0;
    if (card.id === 'High-Roller' || card.id === 'Showboat') s += 2.5;
  } else if (profile === 'Tactician') {
    if (card.tags.includes('tempo') || card.tags.includes('lead') || card.tags.includes('last')) s += 4.0;
    if (card.id === 'Spoiler' || card.id === 'Sprinter' || card.id === 'Anchor') s += 3.0;
  } else if (profile === 'Chaos') {
    if (card.tags.includes('chaos') || card.tags.includes('punish') || card.tags.includes('remove')) s += 4.5;
    if (card.id === 'Bouncer' || card.id === 'Flipper' || card.id === 'Pickpocket') s += 3.0;
  } else if (profile === 'Synergy') {
    if (card.tags.includes('synergy') || card.tags.includes('scale')) s += 4.0;
    const sameColorCount = hand.filter((c) => c.color === card.color || c.id === 'Chameleon').length;
    s += sameColorCount * 1.8;
    if (card.id === 'Chameleon') s += 3.5;
  }
  return s;
}

function chooseCardToPlay(hand, profile, pos, nPlayers, roundNum, trickIdx, roundPrizes, playedSoFar, rng) {
  if (hand.length === 1) return 0;

  const curPrize = roundPrizes[trickIdx];
  const nextPrize = trickIdx + 1 < roundPrizes.length ? roundPrizes[trickIdx + 1] : 0;
  const isLead = pos === 0;
  const isLast = pos === nPlayers - 1;

  // Score each card in hand for this exact trick situation
  let bestIdx = 0;
  let bestScore = -1e9;

  for (let i = 0; i < hand.length; i++) {
    const c = hand[i];
    let val = c.base >= INF ? 12 : c.base;
    let s = 0;

    // Universal positional awareness (don't waste dead cards if avoidable)
    if (c.id === 'Sprinter' && !isLead) s -= 20;
    if (c.id === 'Sprinter' && isLead) s += 6;
    if (c.id === 'Anchor' && !isLast) s -= 20;
    if (c.id === 'Anchor' && isLast) s += 6;
    if (c.id === 'Middleman' && (isLead || isLast)) s -= 20;
    if (c.id === 'Middleman' && !isLead && !isLast) s += 5;
    if (c.id === 'Gambler' && !isLast) s -= 12;
    if (c.id === 'Gambler' && isLast) s += 7;
    if (c.id === 'Copycat' && isLead) s -= 15;
    if (c.id === 'Copycat' && !isLead && playedSoFar[pos - 1].card.base >= 7) s += 8;

    // Prize awareness
    const highPrize = curPrize >= 4;
    const lowPrize = curPrize <= 1;

    if (profile === 'Shark') {
      // Push hard on 4-5, dump low on 0-1
      s += highPrize ? val * 1.5 : lowPrize ? -val * 1.2 : val * 0.4;
      if (c.id === 'High-Roller' && highPrize) s += 8;
      if (c.id === 'Showboat' && curPrize >= 3) s += 6;
    } else if (profile === 'Tactician') {
      // Fight for 0-1 if next prize is 4-5 AND we have lead-loving cards (Sprinter/Blitz)
      const wantLeadForNext = lowPrize && nextPrize >= 4 && hand.some((h) => h.id === 'Sprinter' || h.id === 'Blitz');
      if (highPrize || wantLeadForNext) {
        s += val * 1.2;
      } else {
        s -= val * 0.8;
      }
      if (c.id === 'Tide-Turner' && lowPrize) s += 7;
      if (c.id === 'Tactician') s += (hand.length - 1) * 1.5;
      if (c.id === 'Spoiler' && lowPrize) s += 5;
    } else if (profile === 'Chaos') {
      // React to table: Bouncer if a big card was played, Flipper if high cards played, Pickpocket on high prize
      const maxPlayed = playedSoFar.length ? Math.max(...playedSoFar.map((p) => p.card.base)) : 0;
      if (c.id === 'Bouncer' && maxPlayed >= 8) s += 12;
      if (c.id === 'Flipper' && maxPlayed >= 7) s += 10;
      if (c.id === 'Giant-Slayer' && maxPlayed >= 8) s += 11;
      if (c.id === 'Pickpocket' && highPrize) s += 9;
      if (c.id === 'Martyr' && highPrize) s += 5;
      s += highPrize ? val * 0.9 : -val * 0.5;
    } else if (profile === 'Synergy') {
      // Play color-synergy when others already played matching color, or save Late Bloomer
      const colorMatches = playedSoFar.filter(
        (p) => p.card.color === c.color || p.card.id === 'Chameleon'
      ).length;
      if (c.id === 'Crowd-Surfer' || c.id === 'Rival') s += colorMatches * 4;
      if (c.id === 'Lone Wolf' && colorMatches > 0) s -= 15;
      if (c.id === 'Lone Wolf' && colorMatches === 0 && isLast) s += 9;
      if (c.id === 'Hothead' && playedSoFar.some((p) => p.card.color === 'B')) s -= 15;
      s += highPrize ? val * 1.1 : -val * 0.6;
    }

    s += rng() * 0.5;
    if (s > bestScore) {
      bestScore = s;
      bestIdx = i;
    }
  }

  return bestIdx;
}

function runSimulation(numGames = 10000, draftMode = 'winner_first') {
  const rng = makeRng(42);
  const profiles = ['Shark', 'Tactician', 'Chaos', 'Synergy'];
  const nPlayers = 4;

  const stats = {
    games: numGames,
    winsByProfile: { Shark: 0, Tactician: 0, Chaos: 0, Synergy: 0 },
    winsBySeat: [0, 0, 0, 0],
    r1WinnerWinsGame: 0,
    totalTricks: 0,
    deadlocks: 0,
    deadlockTieCancel: 0,
    deadlockNoneEligible: 0,
    roundTies: 0,
    cardDrafted: {},
    cardWonTrick: {},
    cardPlayedTrick: {},
    cardInWinningHand: {},
  };

  for (let g = 0; g < numGames; g++) {
    // Rotate seat assignments each game so seat order doesn't bias profiles
    const seatProfiles = [];
    const offset = g % nPlayers;
    for (let p = 0; p < nPlayers; p++) {
      seatProfiles.push(profiles[(p + offset) % nPlayers]);
    }

    const charDeck = shuffle(makeDeck(), rng);
    const hands = [[], [], [], []];
    for (let p = 0; p < nPlayers; p++) {
      const c = charDeck.pop();
      hands[p].push(c);
      stats.cardDrafted[c.id] = (stats.cardDrafted[c.id] || 0) + 1;
    }

    let roundLeader = Math.floor(rng() * nPlayers);
    let r1Winner = -1;
    let gameWinner = -1;

    for (let round = 1; round <= 5; round++) {
      const prizeDeck = shuffle(makePrizeDeck(), rng);
      const roundPrizes = prizeDeck.splice(0, round);

      // Copy hands for this round (players retain their cards after the round)
      const roundHands = hands.map((h) => [...h]);
      const wonPrizes = [[], [], [], []];

      let trickLeader = roundLeader;

      for (let t = 0; t < round; t++) {
        stats.totalTricks++;
        const prizeVal = roundPrizes[t];
        const plays = [];

        for (let k = 0; k < nPlayers; k++) {
          const p = (trickLeader + k) % nPlayers;
          const hand = roundHands[p];
          const idx = chooseCardToPlay(
            hand,
            seatProfiles[p],
            k,
            nPlayers,
            round,
            t,
            roundPrizes,
            plays,
            rng
          );
          const card = hand.splice(idx, 1)[0];
          stats.cardPlayedTrick[card.id] = (stats.cardPlayedTrick[card.id] || 0) + 1;
          plays.push({ player: p, card, handRemaining: hand.length });
        }

        const res = resolveTrick(plays, prizeVal, round);

        if (res.winner === null) {
          stats.deadlocks++;
          if (res.deadlockReason === 'tie_cancel') stats.deadlockTieCancel++;
          else stats.deadlockNoneEligible++;
          trickLeader = res.nextLeader;
        } else {
          const w = res.winner;
          stats.cardWonTrick[res.winnerCard.id] = (stats.cardWonTrick[res.winnerCard.id] || 0) + 1;

          // Midas: if wins 0, 1, or 2, discard and draw a replacement from Prize Deck
          let awarded = prizeVal;
          if (res.winnerEffId === 'Midas' && awarded <= 2 && prizeDeck.length > 0) {
            awarded = prizeDeck.pop();
          }
          wonPrizes[w].push(awarded);

          // Showboat: if wins non-0, draw 1 extra Prize Card from Prize Deck
          if (res.winnerEffId === 'Showboat' && prizeVal !== 0 && prizeDeck.length > 0) {
            wonPrizes[w].push(prizeDeck.pop());
          }

          // Post-trick loser effects: Martyr & Pickpocket
          for (const e of res.activeEntries) {
            if (e.player === w || e.powerCanceled) continue;
            if (e.effId === 'Martyr' && wonPrizes[w].length > 0) {
              // Winner discards lowest prize card of their choice
              let minIdx = 0;
              for (let x = 1; x < wonPrizes[w].length; x++) {
                if (wonPrizes[w][x] < wonPrizes[w][minIdx]) minIdx = x;
              }
              wonPrizes[w].splice(minIdx, 1);
            } else if (e.effId === 'Pickpocket' && prizeVal >= 4 && prizeDeck.length > 0) {
              // Draw 1 Prize Card from the Prize Deck
              wonPrizes[e.player].push(prizeDeck.pop());
            }
          }

          trickLeader = res.nextLeader;
        }
      }

      // Score the round
      const scores = wonPrizes.map((arr, p) => ({
        player: p,
        total: arr.reduce((a, b) => a + b, 0),
        maxPrize: arr.length ? Math.max(...arr) : -1,
        count: arr.length,
        tieRand: rng(),
      }));

      scores.sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        if (b.maxPrize !== a.maxPrize) return b.maxPrize - a.maxPrize;
        if (b.count !== a.count) return b.count - a.count;
        return b.tieRand - a.tieRand;
      });

      if (scores[0].total === scores[1].total) stats.roundTies++;

      const roundWinner = scores[0].player;
      if (round === 1) r1Winner = roundWinner;

      if (round === 5) {
        gameWinner = roundWinner;
        break;
      }

      // Draft N+1 cards
      const pool = [];
      for (let i = 0; i < nPlayers + 1; i++) {
        pool.push(charDeck.pop());
      }

      let draftOrder;
      if (draftMode === 'winner_first') {
        draftOrder = scores.map((s) => s.player);
      } else {
        // winner picks 1st, then reverse standings (catch-up)
        draftOrder = [scores[0].player, scores[3].player, scores[2].player, scores[1].player];
      }

      for (const p of draftOrder) {
        let bestPoolIdx = 0;
        let bestPoolScore = -1e9;
        for (let i = 0; i < pool.length; i++) {
          const sc = scoreDraftCard(pool[i], hands[p], seatProfiles[p], rng);
          if (sc > bestPoolScore) {
            bestPoolScore = sc;
            bestPoolIdx = i;
          }
        }
        const picked = pool.splice(bestPoolIdx, 1)[0];
        hands[p].push(picked);
        stats.cardDrafted[picked.id] = (stats.cardDrafted[picked.id] || 0) + 1;
      }

      roundLeader = roundWinner;
    }

    stats.winsByProfile[seatProfiles[gameWinner]]++;
    stats.winsBySeat[gameWinner]++;
    if (gameWinner === r1Winner) stats.r1WinnerWinsGame++;
    for (const c of hands[gameWinner]) {
      stats.cardInWinningHand[c.id] = (stats.cardInWinningHand[c.id] || 0) + 1;
    }
  }

  return stats;
}

function printReport(title, stats) {
  console.log(`\n=== ${title} (${stats.games} games, ${stats.totalTricks} tricks) ===`);
  console.log('Win Rate by Profile:');
  for (const [prof, w] of Object.entries(stats.winsByProfile)) {
    console.log(`  ${prof.padEnd(10)}: ${((w / stats.games) * 100).toFixed(2)}% (${w})`);
  }
  console.log(
    `R1 Winner -> Wins Game: ${((stats.r1WinnerWinsGame / stats.games) * 100).toFixed(2)}% (25.00% = zero snowball)`
  );
  console.log(
    `Deadlock Rate: ${((stats.deadlocks / stats.totalTricks) * 100).toFixed(2)}% ` +
      `(Tie-Cancel: ${((stats.deadlockTieCancel / stats.totalTricks) * 100).toFixed(2)}%, ` +
      `None-Eligible: ${((stats.deadlockNoneEligible / stats.totalTricks) * 100).toFixed(2)}%)`
  );
  console.log(`Round Score Ties (needed tiebreaker): ${((stats.roundTies / (stats.games * 5)) * 100).toFixed(2)}%`);

  // Top & Bottom cards by Trick Win Rate and Game Win Share
  const cards = Object.keys(stats.cardPlayedTrick).map((id) => {
    const played = stats.cardPlayedTrick[id] || 1;
    const won = stats.cardWonTrick[id] || 0;
    const drafted = stats.cardDrafted[id] || 1;
    const inWinHand = stats.cardInWinningHand[id] || 0;
    return {
      id,
      trickWinRate: (won / played) * 100,
      gameWinRateWhenDrafted: (inWinHand / drafted) * 100,
      played,
    };
  });

  cards.sort((a, b) => b.gameWinRateWhenDrafted - a.gameWinRateWhenDrafted);
  console.log('\nTop 8 Cards by Game Win Rate (when in hand, baseline = 25.0%):');
  for (const c of cards.slice(0, 8)) {
    console.log(
      `  ${c.id.padEnd(14)} | GameWin: ${c.gameWinRateWhenDrafted.toFixed(1)}% | TrickWin: ${c.trickWinRate.toFixed(1)}%`
    );
  }
  console.log('\nBottom 8 Cards by Game Win Rate:');
  for (const c of cards.slice(-8)) {
    console.log(
      `  ${c.id.padEnd(14)} | GameWin: ${c.gameWinRateWhenDrafted.toFixed(1)}% | TrickWin: ${c.trickWinRate.toFixed(1)}%`
    );
  }
}

const s1 = runSimulation(10000, 'winner_first');
printReport('Draft: Winner-First -> Standings Order', s1);

const s2 = runSimulation(10000, 'catchup');
printReport('Draft: Winner 1st, then Reverse Standings (Catch-up)', s2);
