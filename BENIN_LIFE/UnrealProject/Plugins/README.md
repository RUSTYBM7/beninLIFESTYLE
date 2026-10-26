# Plugins

Install Unreal plugins **on your workstation** after UE 5.8 is available.

## StreetMap (recommended for Benin roads)

```bash
cd UnrealProject/Plugins
git clone --depth 1 https://github.com/MikeFricker/StreetMap.git
```

Then regenerate project files and compile. Import OSM extracts with attribution.

Do not commit multi-gigabyte engine forks (NVIDIA GameWorks UE4.18, full AirSim environments) into this repo.
