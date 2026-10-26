# M1 FINAL PACKAGE — Native Build Gate

**Status in cloud:** SCAFFOLD COMPLETE · **RUNTIME VERIFIED: NO** (requires Windows + UE 5.8)

## Definition of Done

| # | Criterion | Proof |
|---|-----------|-------|
| 1 | UE 5.8.x pinned | Launcher screenshot |
| 2 | Project opens | No fatal module errors |
| 3 | Development Editor compiles | Build log success |
| 4 | Editor + map intent | Screenshot |
| 5 | PIE move/look/jump/interact | Clip or shots |
| 6 | Packaged Development launches | Screenshot |
| 7 | Evidence archived | `docs/m1/evidence/` locally |

## Already in repo

`BeninLife.uproject`, Config, Targets, Character, Wallet, Time, Save, Mission, GameMode, Input.

## Windows path

1. UE 5.8.x + VS 2022 (Game development with C++)
2. Open `BENIN_LIFE/UnrealProject/BeninLife.uproject`
3. Generate project files → Build Development Editor
4. Create `Content/Maps/L_PrototypeTest` + Player Start → PIE
5. Package Development Win64
6. Fill `docs/m1/M1_EVIDENCE_TEMPLATE.md`

**Close:** Pipeline is final. Running build is only on your machine.
