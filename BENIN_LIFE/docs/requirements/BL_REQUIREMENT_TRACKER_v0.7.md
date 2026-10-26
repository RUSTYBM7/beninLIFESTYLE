# BENIN LIFE Requirement Tracker v0.7

**Rule:** VERIFIED only with attached runtime evidence per Master Spec.

## P0 Build (M1)
| ID | Status |
|----|--------|
| BL-BUILD-001…010 | NOT STARTED / BLOCKED without local UE |

## Core systems
| ID | Status | Evidence |
|----|--------|----------|
| BL-SYS-TIME-001 | CODE | BeninLifeTimeSubsystem |
| BL-SYS-WALLET-001 | CODE + TESTED | Wallet + Tests/test_naira_wallet.py |
| BL-SYS-CHAR-001 | CODE | BeninLifeCharacter |
| BL-SYS-SAVE-001 | CODE | SaveGame schema v1 |
| BL-SYS-INTERACT-001 | CODE | IBeninLifeInteractable |
| BL-SYS-MISSION-001 | CODE + DATA | MissionSubsystem + mission_registry.json |

## Geography
| ID | Status |
|----|--------|
| BL-GEO-001 | DATA (Ikpoba seed) |
| BL-GEO-002 | PARTIAL |

## Milestones
| Milestone | Status |
|-----------|--------|
| M1 | BLOCKED (install UE on workstation) |
| M2–M6 | Scaffold / data; need M1 runtime |
