# Chaos Tricks *(Working Title)* — Official Rules

**Players:** 3–6  
**Playtime:** ~10–15 minutes  
**Core Concept:** A free-play trick-taking game where every card is a unique rule-bending character. You keep your cards from round to round, drafting 1 new character after each round as hands grow from **1 → 2 → 3 → 4 → 5 cards**. Win **Round 5** to win the game!

---

## 1. Components
* **36 Character Cards** (9 each in **Red, Blue, Yellow, Green**). Each card has a **Name**, **Color**, **Base Value** (`0–9` or `∞`), and **Power**.
* **18 Prize Cards** (3 each of values `0, 1, 2, 3, 4, 5`).

---

## 2. Setup
1. Shuffle the **36 Character Cards** into a face-down **Character Deck**.
2. Deal **1 Character Card** to each player. (This is your starting hand for Round 1.)
3. Shuffle the **18 Prize Cards** into a face-down **Prize Deck**.
4. Choose a random player to **lead** Trick 1 of Round 1.

---

## 3. Round Structure (Rounds 1 to 5)
The game lasts **5 Rounds**. In Round $R$, every player has **$R$ cards** in hand and plays **$R$ tricks**.

### A. Reveal the Prize Row
At the start of Round $R$, flip **$R$ Prize Cards** face-up in a row in the center of the table from left to right.
* These show the exact point value of each trick in the round (e.g., in Round 3 you might see `1 → 5 → 2`).
* **Tip:** Winning a `0` Prize Card scores 0 points, but it gives you **the lead** for the next trick!

### B. Playing a Trick
1. Starting with the **Leader** and going clockwise, each player plays **1 Character Card** face-up in front of them.
2. **Free-Play Rule:** You do **not** have to follow color/suit. You may play any card from your hand.
3. Keep played cards face-up in front of you until the round ends (you will take them all back into your hand after scoring).

### C. Resolving a Trick (4-Step Order)
When all players have played a card, resolve the trick in this strict order:

1. **Step 1 — Disrupt:** Apply powers that copy, cancel, swap, or remove cards (*Copycat, Saboteur, Nullifier, Mirror, Kingmaker, Bouncer*).
   * *Scapegoat* is immune to all removal and cancellation.
   * Removed cards leave the trick immediately—their values, colors, and powers no longer count.
2. **Step 2 — Modify Values:** Apply all value bonuses and penalties (*Infinity, Giant-Slayer, Gambler, Frostbite, Blitz, Rival, Tactician, Tide-Turner, High-Roller, Leech, Crowd-Surfer, Tax Collector, Late Bloomer, Vampire*). Minimum effective value is `0`.
   * *Chameleon* counts as all 4 colors for all color checks.
3. **Step 3 — Check Eligibility:** Any card with a win restriction (*Sprinter, Hothead, Lone Wolf, Anchor, Pacifist, Underdog, Middleman, Infinity*) checks whether it is **eligible** to win. Ineligible cards cannot win, regardless of value.
4. **Step 4 — Compare & Tiebreak:**
   * Normally, the **highest** effective value among eligible cards wins. (If *Flipper* is active, the **lowest** eligible value wins.)
   * **Ties Cancel Out:** If 2 or more eligible cards tie for the winning value, **all tied cards cancel each other out**—unless *Tiebreaker* is one of the tied cards, in which case *Tiebreaker* wins!
   * **Deadlock:** If no cards are eligible or all tied cards cancel out, **no one wins the trick**. Discard the current Prize Card, and the current Leader leads the next trick.

### D. Claiming the Prize & Next Lead
* The winning player takes the current **Prize Card** into their round pile.
* Trigger any **Post-Trick** powers (*Showboat, Midas, Martyr, Pickpocket, Spoiler*).
* The **winner of the trick leads the next trick** (unless a losing *Spoiler* overrides this—if multiple *Spoiler*s lost, the last one played leads).

---

## 4. End of Round & Drafting (Rounds 1–4)
After all $R$ tricks of Round $R$ are finished:
1. **Score the Round:** Total the printed values of the Prize Cards in your round pile.
2. **Determine the Round Winner:** Highest total wins the round.
   * **Tiebreakers:** (1) Highest single Prize Card won (`5` beats `3+2`), then (2) Most Prize Cards won, then (3) Winner of the final trick of the round.
3. **Return Hands:** Every player picks up all $R$ Character Cards they played this round back into their hand.
4. **Reset Prizes:** Shuffle all 18 Prize Cards back into the Prize Deck.
5. **Draft ($N+1$ Pool):** Flip **$N+1$ Character Cards** (where $N$ is the player count) face-up from the Character Deck.
   * Starting with the **Round Winner** and continuing in **standings order** (or **reverse standings after 1st** for catch-up), each player drafts **1 card** into their hand. Discard the 1 leftover card.
6. The **Round Winner** leads Trick 1 of the next round.

---

## 5. Winning the Game (Round 5)
Play Round 5 with your 5-card hands using the same rules above. **The winner of Round 5 wins the game!**

---

## 6. Complete 36-Card Character Roster

### Red
| Card | Base | Step | Power |
| :--- | :---: | :---: | :--- |
| **Sprinter** | 8 | 3 | Only wins if this card was led. |
| **Bouncer** | 4 | 1 | Remove the highest other card played from this trick *(if tied, remove the first played)*. |
| **Saboteur** | 3 | 1 | Cancel the powers of all cards played *before* this card. |
| **Giant-Slayer** | 2 | 2 | If any card with Base Value `8+` (or `∞`) is in this trick, this card's value becomes `11`. |
| **Blitz** | 5 | 2 | `+3` value if played 1st or 2nd in the trick. |
| **Rival** | 4 | 2 | `+4` value if another Red card is in this trick. |
| **Hothead** | 9 | 3 | Cannot win if a Blue card is in this trick. |
| **Showboat** | 7 | Post | If this card wins a non-`0` Prize Card, draw `1` extra Prize Card from the Prize Deck. |
| **Martyr** | 1 | Post | If this card loses, the winner must discard 1 Prize Card of their choice *(if they have any)*. |

### Blue
| Card | Base | Step | Power |
| :--- | :---: | :---: | :--- |
| **Mirror** | 5 | 1 | Swap Base Values with the card led. |
| **Nullifier** | 6 | 1 | Cancel the powers of all cards played *after* this card. |
| **Frostbite** | 5 | 2 | All other cards get `-2` value *(minimum `0`)*. |
| **Tactician** | 4 | 2 | `+2` value for each card *remaining* in your hand after playing this. |
| **Tide-Turner** | 2 | 2 | `+4` value if the current Prize Card is `0` or `1`. |
| **Lone Wolf** | 9 | 3 | Only wins if no other card in this trick shares its color. |
| **Anchor** | 8 | 3 | Only wins if played last in this trick. |
| **Pacifist** | 9 | 3 | Cannot win if any card with Base Value `3` or less is in this trick. |
| **Flipper** | 6 | 4 | Lowest eligible value wins this trick instead of highest. |

### Yellow
| Card | Base | Step | Power |
| :--- | :---: | :---: | :--- |
| **Kingmaker** | 3 | 1 | The card played immediately before this gets `+4` value. |
| **Infinity** | ∞ | 2/3 | Value is Infinity. Cannot win if any card with Base Value `0`, `1`, or `2` is in this trick. |
| **High-Roller** | 4 | 2 | `+4` value if the current Prize Card is `4` or `5`. |
| **Gambler** | 0 | 2 | If played last in this trick, its value becomes `10`. |
| **Underdog** | 2 | 3 | Only wins if this is the strictly lowest Base Value card in this trick. |
| **Tiebreaker** | 6 | 4 | Wins any tie it is part of *(instead of canceling out)*. |
| **Spoiler** | 2 | Post | If this card loses, its owner still leads the next trick. |
| **Midas** | 7 | Post | If this card wins a `0`, `1`, or `2` Prize Card, discard it and draw a replacement from the Prize Deck. |
| **Pickpocket** | 4 | Post | If this card loses on a `4` or `5` Prize Card, draw `1` Prize Card from the Prize Deck. |

### Green
| Card | Base | Step | Power |
| :--- | :---: | :---: | :--- |
| **Copycat** | 0 | 1 | Copies the Base Value and Power of the card played immediately before it, with `+1` Base Value *(unless `∞`)*. |
| **Scapegoat** | 1 | 1 | Cannot be removed or canceled by other card powers. |
| **Leech** | 3 | 2 | Add the Base Value of the lowest other card played to this card *(treat `∞` as `10`)*. |
| **Crowd-Surfer** | 4 | 2 | `+3` value for each other card in this trick that shares a color with this. |
| **Tax Collector** | 4 | 2 | `+3` value for each card with Base Value `3` or less in this trick. |
| **Late Bloomer** | 2 | 2 | `+2` value for each round completed so far *(`+0` in R1, up to `+8` in R5)*. |
| **Vampire** | 6 | 2 | `+3` value if a card was removed from this trick. |
| **Chameleon** | 4 | 2/3 | Counts as all 4 colors *(Red, Blue, Yellow, Green)*. |
| **Middleman** | 7 | 3 | Only wins if neither led nor played last. |
