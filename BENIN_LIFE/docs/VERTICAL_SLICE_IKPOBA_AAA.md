# Vertical Slice — Ikpoba Hill + Ramat Park

**Ambition:** Rockstar-grade presence in **one** district first.

## Player fantasy (15–30 min)
1. Wake in compound on Ikpoba Hill
2. Check phone: time, ₦, objective
3. Travel toward Ramat Park axis
4. Interact / complete morning errand mission
5. Earn/spend naira, save, advance time

## Systems required
- Character move + camera
- Interaction
- Time of day
- Integer naira wallet + ledger
- Mission chain (ikpoba_morning_errand)
- Versioned save/load
- District blockout + local names

## Gate question
> Would a 10-second clip of this corner feel correct in a GTA-style trailer set in Benin City?

If no → do not expand the map. Fix the corner.

## Dependency order
1. M1 native compile + PIE
2. Graybox Ikpoba → Ramat Park
3. Wallet + time + save wired
4. Mission runtime
5. Art pass on one street segment
