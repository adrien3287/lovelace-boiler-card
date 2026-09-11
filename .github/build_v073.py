from pathlib import Path
import json

src = Path("lovelace-boiler-card-v0.7.2.js")
dst = Path("lovelace-boiler-card-v0.7.3.js")
s = src.read_text(encoding="utf-8")

# Version metadata only; all unrelated card code stays unchanged.
s = s.replace("Lovelace Boiler Card v0.7.2", "Lovelace Boiler Card v0.7.3", 1)
s = s.replace(
    "Standalone v0.7.1 runtime with dynamic oil-volume rendering.",
    "Standalone v0.7.2 runtime with corrected clipped oil-volume rendering.",
    1,
)
s = s.replace('const BOILER_CARD_VERSION = "0.7.2";', 'const BOILER_CARD_VERSION = "0.7.3";', 1)

start = s.rfind("function ensureOilLevelElements(group) {")
end = s.find("\nfunction volumePercentToHeightPercentV072", start)
if start < 0 or end < 0:
    raise SystemExit("Could not locate v0.7.2 oil element renderer")

new_ensure = r'''function ensureOilLevelElements(group) {
  // ===== TANK DRAWING =====
  // First erase the yellow/orange fuel pixels baked into the raster baseline.
  let erase = group.querySelector("#oil-empty-erase-overlay");
  if (!erase) {
    erase = document.createElementNS(SVG_NS, "image");
    erase.setAttribute("id", "oil-empty-erase-overlay");
    erase.setAttribute("x", "58");
    erase.setAttribute("y", "452");
    erase.setAttribute("width", "261");
    erase.setAttribute("height", "314");
    erase.setAttribute("href", EMPTY_TANK_ERASE_OVERLAY);
    erase.setAttribute("pointer-events", "none");
    group.insertBefore(erase, group.firstChild);
  }

  // ===== CLEAN LIQUID DRAWING v0.7.3 =====
  // The tank's existing SVG clip is the single source of truth for the shape.
  // A simple rectangle provides a perfectly horizontal liquid surface while the
  // clip produces the exact side walls and rounded bottom corners. This avoids
  // the hand-built polygon artefacts seen in v0.7.2.
  let fill = group.querySelector("#oil-fill-v073");
  if (!fill) {
    group.querySelectorAll("#oil-fill-v016, #oil-fill-v072").forEach((el) => el.remove());

    fill = document.createElementNS(SVG_NS, "rect");
    fill.setAttribute("id", "oil-fill-v073");
    fill.setAttribute("x", "58");
    fill.setAttribute("width", "254");
    fill.setAttribute("clip-path", "url(#oil-tank-clip)");
    fill.setAttribute("fill", "#b97a57");
    fill.setAttribute("opacity", "1");
    fill.setAttribute("pointer-events", "none");

    // Keep the exact validated suction tube above the liquid. No tube geometry changes.
    const tube = Array.from(group.querySelectorAll("path")).find(
      (el) => el.getAttribute("d") === "M190 401 V748 M179 748 H201"
    );
    group.insertBefore(fill, tube || null);
  }

  const oldRect = group.querySelector("#oil-fill");
  if (oldRect) oldRect.style.display = "none";

  return fill;
}
'''
s = s[:start] + new_ensure + s[end:]

old_render = '''  const fill = ensureOilLevelElements(group);\n  fill.setAttribute("d", buildOilLevelPath(heightPct));\n  fill.style.display = heightPct > 0 ? "" : "none";'''
new_render = '''  const fill = ensureOilLevelElements(group);\n  const liquidTopY = clamp(\n    OIL_TANK.bottomY - ((OIL_TANK.bottomY - OIL_TANK.topY) * heightPct) / 100,\n    OIL_TANK.topY,\n    OIL_TANK.bottomY\n  );\n  fill.setAttribute("y", formatNum(liquidTopY));\n  // Extend one pixel beyond the mathematical bottom; the tank clip trims it exactly.\n  fill.setAttribute("height", formatNum(OIL_TANK.bottomY - liquidTopY + 1));\n  fill.style.display = heightPct > 0 ? "" : "none";'''
if old_render not in s:
    raise SystemExit("Could not locate v0.7.2 fill render statements")
s = s.replace(old_render, new_render, 1)
s = s.replace(
    "v0.7.2 (oil-volume driven tank level)",
    "v0.7.3 (clean clipped oil-volume tank fill)",
    1,
)
s = s.replace(
    "lovelace-boiler-card v0.7.2: embedded base module did not register the card",
    "lovelace-boiler-card v0.7.3: embedded base module did not register the card",
    1,
)

dst.write_text(s, encoding="utf-8")

# HACS: v0.7.3 becomes the only runtime entry point.
hacs_path = Path("hacs.json")
hacs = json.loads(hacs_path.read_text(encoding="utf-8"))
hacs["filename"] = "lovelace-boiler-card-v0.7.3.js"
hacs_path.write_text(json.dumps(hacs, indent=2) + "\n", encoding="utf-8")

# README
readme_path = Path("README.md")
r = readme_path.read_text(encoding="utf-8")
r = r.replace("**Current version: 0.7.2**", "**Current version: 0.7.3**")
r = r.replace(
    "/hacsfiles/lovelace-boiler-card/lovelace-boiler-card-v0.7.2.js",
    "/hacsfiles/lovelace-boiler-card/lovelace-boiler-card-v0.7.3.js",
)
if "## v0.7.3 clean clipped tank fill" not in r:
    r += """

## v0.7.3 clean clipped tank fill

- keeps the v0.7.2 `oil_volume` / capacity calculation and liquid height unchanged;
- replaces the hand-built liquid polygon with one rectangle clipped by the existing exact tank SVG shape;
- gives the liquid a perfectly horizontal top and clean rounded lower corners with no black wedges or bottom gaps;
- uses the reference fill colour `#b97a57`;
- keeps the validated yellow suction tube and all unrelated card geometry unchanged.
"""
readme_path.write_text(r, encoding="utf-8")

# CHANGELOG
changelog_path = Path("CHANGELOG.md")
c = changelog_path.read_text(encoding="utf-8")
entry = """## 0.7.3

- Keeps the v0.7.2 oil-volume/capacity calculation.
- Replaces the manually generated oil polygon with a rectangular liquid layer clipped by the exact existing tank path.
- Removes the bottom wedges/gaps and gives the liquid a flat horizontal surface.
- Changes the tank liquid colour to `#b97a57` to match the supplied reference.
- Leaves the suction tube and all unrelated layout unchanged.

"""
if not c.startswith("## 0.7.3"):
    c = entry + c
changelog_path.write_text(c, encoding="utf-8")

# Keep the repository clean: v0.7.3 supersedes v0.7.2.
src.unlink()
