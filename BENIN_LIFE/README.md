# BENIN LIFE — Development Package

**Ambition:** A commercially credible, high-quality open-world life simulation rooted in Benin City, Edo State, Nigeria — competing on presence, systems depth, and local authenticity with the best open-world standards (Rockstar-class *ambition*).

**Governing document:** `docs/compliance/BENIN_LIFE_AAA_MASTER_IMPLEMENTATION_COMPLIANCE_v2.0.txt`  
**Package status:** **v0.7.0-planning** (scaffold + production control). **Not** a finished game. **Not** a verified native Unreal build.

---

## Honest baseline (do not misrepresent)

| Item | Status |
|------|--------|
| Native Unreal Engine project | Scaffold present; **not compiled / not launched** in constrained cloud environments |
| Production character / animation | **Not** installed |
| Final environments / audio | **Not** installed |
| Verified full-city GIS | **Not** complete; Ikpoba Hill is the priority district target |
| Browser companion | **Prototype only** — not the 3D game |
| AAA / platform certification | **Not** claimed; compliance matrix is evidence-gated |

---

## What this package contains

- **UnrealProject/** — C++ module: Character, Wallet (integer ₦), Time subsystem, Save, Mission, Interaction, GameMode
- **data/** — Ikpoba Hill slice GeoJSON, mission registry, asset register template
- **docs/** — Master compliance spec, requirement tracker, vertical-slice plan, toolchain limits
- **Tests/** — Python naira wallet unit tests
- **scripts/** — Preflight, package validation, OSM seed helper

---

## Production north star

1. **M1** — Native UE 5.8.x build verified (compile → editor → PIE → packaged Development)
2. **M2** — Playable graybox district (Ikpoba Hill → Ramat Park)
3. **M6** — Gameplay vertical slice: full daily loop, naira economy, one mission chain, save persistence
4. Expand corridors and production art **only after** the slice meets the presence gate:

> *Would a 10-second clip of this corner feel correct in a GTA-style trailer set in Benin City?*

---

## Naira & banking

In-game currency is **Nigerian naira (₦)** as **fiction only**.  
No real bank, NIBSS, NUBAN validation, card, USSD, or payment network is contacted.

---

## Geography

Priority: **Ikpoba Hill**, **Ramat Park / flyover**, connection toward central corridors.  
Major public places use real local names with provenance rules.

---

## Install Unreal Engine (on your workstation, not in the cloud sandbox)

See `docs/toolchain/ENVIRONMENT_AND_UE_INSTALL.md`.

Cloud sandboxes with ~1 GB RAM cannot run UE. Use Windows + Epic Launcher + VS 2022 for M1.
