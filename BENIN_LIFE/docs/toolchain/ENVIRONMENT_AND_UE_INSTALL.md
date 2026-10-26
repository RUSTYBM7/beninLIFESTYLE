# Environment Reality & Unreal Engine Installation Guide

## This cloud sandbox cannot run Unreal Engine

| Resource | Typical cloud sandbox | UE 5.8 need |
|----------|----------------------|-------------|
| RAM | ~1.2 GB | 8 GB min, 32 GB+ recommended |
| Disk | ~19 GB free | 100–200+ GB |
| GPU | None suitable | Dedicated GPU recommended |

**Do not claim UE is installed in constrained cloud environments.**

## Install on your Windows workstation (M1 path)

1. Epic Games account + Epic Games Launcher
2. Install Unreal Engine **5.8.x** (pin hotfix)
3. Visual Studio 2022 — workload *Game development with C++*
4. Open `UnrealProject/BeninLife.uproject` → generate project files
5. Build Development Editor → PIE smoke → Package Development
6. Archive logs and mark M1 evidence

Official: https://dev.epicgames.com/documentation/en-us/unreal-engine/install-unreal-engine
