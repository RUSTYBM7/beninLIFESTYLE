# Third-Party Unreal Dependencies — Evaluation & Install Guide

**Date:** 26 October 2026  
**Rule:** These are *not* installed or running in the cloud sandbox. Install only on a workstation that already has a compatible Unreal Engine build.

None of these replace **M1** (native compile of `BeninLife.uproject` on your PC).

---

## Summary matrix

| Repository | What it is | Size / weight | UE version fit | Use for BENIN LIFE? |
|------------|------------|---------------|----------------|---------------------|
| [MikeFricker/StreetMap](https://github.com/MikeFricker/StreetMap) (also [ue4plugins/StreetMap](https://github.com/ue4plugins/StreetMap)) | OSM → Unreal streets/buildings importer | Plugin (manageable) | Updated toward UE5.1–5.2 | **Yes — high value** for Ikpoba / Benin roads |
| [VoxelPlugin/VoxelPluginFreeLegacy](https://github.com/VoxelPlugin/VoxelPluginFreeLegacy) | Voxel terrain (legacy free) | Large plugin | Claims 5.6–5.8 compile | **Optional** — only if you need voxel terrain |
| [microsoft/AirSim](https://github.com/microsoft/AirSim) | Drone/car simulation plugin | Large; envs multi-GB | Older UE focus; maintenance slowed | **No for core life-sim** — research/AV tool |
| [nxrighthere/UnrealCLR](https://github.com/nxrighthere/UnrealCLR) | C# / .NET 6 in Unreal | Plugin | Stale (~2022–23); .NET 6 | **Not recommended** for UE 5.8 primary path |
| [windystrife/UnrealEngine_NVIDIAGameWorks](https://github.com/windystrife/UnrealEngine_NVIDIAGameWorks) | **Full UE 4.18.3 fork** + NVIDIA GameWorks | Engine-scale (many GB) | **UE 4.18 only** | **Do not use** for Benin Life |

---

## 1. StreetMap (recommended)

**Purpose:** Import OpenStreetMap XML into UE as street/building meshes.  
**Why it helps:** Aligns with Ikpoba Hill / Ramat Park / Ring Road geography work.

### Install on your PC (after UE 5.8 is installed)

```text
1. Clone into your project:
   git clone --depth 1 https://github.com/MikeFricker/StreetMap.git
   # or https://github.com/ue4plugins/StreetMap.git

2. Move/copy to:
   BENIN_LIFE/UnrealProject/Plugins/StreetMap/

3. Regenerate project files / compile C++ project.
4. Enable plugin in Editor if needed.
5. Import .osm extracts for Benin City corridors (respect OSM license/attribution).
```

**Caveats:** Verify compile on **5.8**; last public fixes targeted ~5.2. Expect minor API fixes. Always keep OSM provenance (Master Spec §8).

---

## 2. VoxelPluginFreeLegacy (optional)

**Purpose:** Voxel terrain / Transvoxel-style landscapes.  
**Upstream:** https://github.com/VoxelPlugin/VoxelPluginFreeLegacy  
**Notes:** README states compile targets including 5.6–5.8; binaries may be offered separately. Marketplace has newer commercial lines.

### Install (workstation only)

```text
git clone --depth 1 https://github.com/VoxelPlugin/VoxelPluginFreeLegacy.git
# Place under UnrealProject/Plugins/ (follow upstream folder name / .uplugin)
# Compile with your UE 5.8 project
```

**Benin Life note:** Urban life-sim is mostly **authored/modular city**, not infinite voxels. Use only if you have a clear terrain need.

---

## 3. AirSim (not for core game)

**Purpose:** Autonomous vehicle / drone simulation (Microsoft).  
**Reality:** Heavy plugin + huge optional environments; project activity has slowed; oriented to research, not GTA-style life-sim.

**Recommendation:** Do **not** add to Benin Life M1–M6 scope. Revisit only for a separate research/demo branch.

---

## 4. UnrealCLR (not recommended as foundation)

**Purpose:** Run C# (.NET 6) inside Unreal.  
**Reality:** Last active ~2022–2023; not maintained for current UE 5.8.

**Recommendation:** Keep **C++** as primary (existing scaffold). Do not block M1 on UnrealCLR.

---

## 5. UnrealEngine_NVIDIAGameWorks (do not install for this project)

**Purpose:** Entire **Unreal Engine 4.18.3** tree with old NVIDIA GameWorks (Flex, Blast, HairWorks, etc.).  
**Reality:**
- Wrong engine generation (4.18 vs our **5.8** target)
- Multi-gigabyte engine source
- VS2015-era tooling
- Cannot be “dropped into” a 5.8 project

**Recommendation:** **Ignore** for BENIN LIFE. Use stock UE 5.8 from Epic Launcher.

---

## What “install all” cannot mean here

| Action | Cloud sandbox (this Grok environment) | Your Windows PC |
|--------|--------------------------------------|-----------------|
| Clone StreetMap / Voxel as plugins | Disk/RAM tight; no UE to compile | **Yes** |
| Clone full NVIDIA GameWorks UE 4.18 | Impossible / pointless | Pointless for 5.8 |
| Run AirSim city environments | Multi-GB; no GPU | Possible only as separate project |
| Produce a running Benin Life build | **No** | **Yes**, after UE 5.8 + M1 |

---

## Recommended order on your workstation

1. Install **UE 5.8.x** + **VS 2022** (Game development with C++).
2. Open `BENIN_LIFE/UnrealProject/BeninLife.uproject` → **M1** compile/PIE.
3. Add **StreetMap** under `Plugins/` → compile → import a small Benin OSM extract.
4. Only then evaluate VoxelPlugin if terrain is required.
5. Skip AirSim, UnrealCLR, and NVIDIA GameWorks UE4 fork for the main line.

---

## License reminders

- **OSM data:** https://www.openstreetmap.org/copyright (attribution / ODbL).
- **StreetMap:** MIT (per upstream).
- **VoxelPluginFreeLegacy:** check upstream LICENSE.
- **AirSim:** MIT (code); environments may use proprietary assets.
- **Unreal Engine:** Epic EULA always applies to engine use/distribution.

Do not vendor full engine forks into `beninLIFESTYLE` without legal review and disk budget.
