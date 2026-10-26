# M1 Windows setup (required for native game)

## 1. Install toolchain
1. [Epic Games Launcher](https://store.epicgames.com/en-US/download) → Unreal Engine **5.8.x**
2. Visual Studio 2022 → workload **Game development with C++** (MSVC + Windows SDK)

## 2. Open project
```text
git clone https://github.com/RUSTYBM7/beninLIFESTYLE.git
cd beninLIFESTYLE
git checkout aaa-m1-m6-scaffold
```
Open `BENIN_LIFE/UnrealProject/BeninLife.uproject` (right-click → Generate Visual Studio project files if prompted).

## 3. Build
- Development Editor configuration
- Set as startup project if using VS
- Build → launch editor

## 4. First PIE smoke
- Create empty level `Content/Maps/L_PrototypeTest` if missing
- Place a Player Start
- Play: WASD move, mouse look, Space jump, E interact ray

## 5. Optional StreetMap
```text
cd BENIN_LIFE/UnrealProject/Plugins
git clone --depth 1 https://github.com/MikeFricker/StreetMap.git
```
Recompile, import a small Benin OSM extract with attribution.

## 6. Browser slice (no UE needed)
Open `BENIN_LIFE/web-companion/index.html` in Chrome/Edge — full Ikpoba morning errand loop.
