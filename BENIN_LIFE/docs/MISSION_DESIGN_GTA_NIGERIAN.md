# Mission design — GTA pattern, indigenous Nigerian street life

## Spine (every mission)

1. **Briefing** — who wants what, why it matters today
2. **Setup** — leave home / meet contact
3. **Travel** — move across Benin corridors (okada optional)
4. **Core** — pay, deliver, collect, attend, hustle
5. **Payoff** — cash, rep, return home
6. **Cooldown** — energy/time pressure; complete or fail cleanly

Same structural rhythm as classic open-world contact missions; content is **Benin City / Edo street life**, not Los Santos copy-paste.

## Mission roster (v2)

| ID | Title | GTA archetype | Indigenous beat |
|----|-------|---------------|-----------------|
| ikpoba_morning_errand | Morning Errand — Ikpoba Hill | Delivery / contact | Neighbor package → Ramat Park |
| oko_market_run | Oba Market Run | Multi-stop collection | Tomatoes, smoked fish, palm oil |
| generator_fuel_hustle | Fuel Before NEPA Takes Light | Time-pressure resource | Generator fuel before blackout |
| okada_pickup_chain | Okada Side Hustle | Fare chain | Three drops, settle cut |
| sunday_service_respect | Sunday Service & Respect | Social / reputation | Church + escort elder |
| night_spot_check | Night Spot — One Round Only | Nightlife spend control | One round, leave clean |
| school_fees_pressure | School Fees Deadline | High-stakes payment | Collect + pay fees same day |

## Experience bar (per mission)

- Clear **objective text** every checkpoint
- **Cash costs** where the street requires payment
- **Rewards** on delivery / completion
- **Rep** on social / duty missions
- **Map travel** to named places (approximate coordinates; verify before production claim)
- Fail when broke, exhausted, or wrong place — player must plan like GTA, live like Benin

## Fiction rules

- In-game ₦ only — no real banking rails
- No tutorials for real-world crime
- POIs may be approximate or gameplay-tagged until GIS QA

## Where it lives

- Data: `data/config/mission_registry.json`
- Playable prototype: `web-companion/`
- UE: extend `UBeninLifeMissionSubsystem` catalog from the same registry
