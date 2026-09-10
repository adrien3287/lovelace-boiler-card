# v0.6.18

- Corrects the static grey tank rendering from v0.6.17.
- Uses the validated v0.6.15 empty-tank cleanup first, so baked-in yellow/orange fuel pixels are removed.
- Fills the complete clipped tank interior with one opaque uniform grey (`#777d84`).
- No dynamic oil level is rendered.
- Keeps the tank geometry and suction tube unchanged.
