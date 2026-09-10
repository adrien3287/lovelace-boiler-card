/*
 * Lovelace Boiler Card v0.6.16
 * Clean dynamic oil-level rendering.
 *
 * Goals for this version:
 * - keep the displayed oil text unchanged (oil_level / oil_volume)
 * - drive the visible liquid height from oil_height_percent
 * - keep the tank click target on oil_height_percent
 * - draw the liquid with a dedicated new function to avoid right-edge glitches
 */
import "./lovelace-boiler-card.js";

const BoilerCardClass = customElements.get("lovelace-boiler-card");
if (!BoilerCardClass) {
  throw new Error("lovelace-boiler-card: base module did not register the card");
}

const SVG_NS = "http://www.w3.org/2000/svg";

// Transparent erase overlay used only to neutralize the residual baked-in fuel pixels
// from the raster baseline before the new dynamic vector level is drawn.
const EMPTY_TANK_ERASE_OVERLAY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQUAAAE6CAYAAAAfukfpAAAD9klEQVR42u3dQW7CMBCGUYx6Ct//bHMN2CJamghi4hm/t6vKoqXNl9+oKu3Csnrvtz2Pi4jm2VrH1VMAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAIgCIAqAKPBo7792f/fx5Nb8UsDant/Xw1IAHB8AUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEAUAUAFEARAEQBUAUgAP8vPqEd4UCS0EQAMcHQBQAUQA+isLzW1MD69h18XvhEep6HgGOD8D28QEQBQBRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAWgtt777fHjtveBQH0R0SwF4LK5FKwEWJelAGxHISKapwbW4zUF4JfNReD1BVhjIfx7fHCUgDWDsCsKwFpEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFIC5oxARzVMF9fx1bVsKgCgAogCIAjA0Cl5sBFEACnt1oxcF4P0oOEKAKAALHR1EAfg8Co4QUHclWAqAKAADouAIATWPDpYCcFwUrAWotxIsBeDYKFgLIApA4aPDIVGwFqBOECwFYEwUrAWosRIsBWBcFKwFyL8SDl8KwgC5g+D4AIyPgrUAeVfCsKUgDJAzCEOPD8IA+YIwNArCAPmCMDwKQK4gfCUK1gLk8pWlIAyQ59q6Zv7iQRCSLgVhgDzX0ikXae/95scKc95YT71ziwPMt7SvK3yTIAhJoiAMMN81Ms0F6SgBc9wwp7tLiwOcu6CnnO7CgBicZ+rzvDggCKIgDoiBKAgDYiAK4oAYTCv13wgIBEIgCuKAGIiCQCAEoiAUiIAoiAYufAAAAAAAAIDy7hNt1QBCKX4mAAAAAElFTkSuQmCC";

// ===== TANK GEOMETRY =====
// These values describe the usable inner volume of the oil tank.
// The liquid top follows oil_height_percent, while the bottom and corners stay aligned
// with the tank drawing.
const OIL_TANK = Object.freeze({
  topY: 401,
  shoulderY: 454,
  sideBottomY: 680,
  bottomY: 739,
  leftSideX: 66,
  rightSideX: 304,
  topFlatLeftX: 123,
  topFlatRightX: 247,
  bottomFlatLeftX: 123,
  bottomFlatRightX: 247,
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatNum(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function topLeftX(y) {
  const g = OIL_TANK;
  if (y <= g.topY) return g.topFlatLeftX;
  if (y >= g.shoulderY) return g.leftSideX;
  const u = (y - g.topY) / (g.shoulderY - g.topY);
  return g.topFlatLeftX - (g.topFlatLeftX - g.leftSideX) * (1 - Math.cos((u * Math.PI) / 2));
}

function topRightX(y) {
  const g = OIL_TANK;
  if (y <= g.topY) return g.topFlatRightX;
  if (y >= g.shoulderY) return g.rightSideX;
  const u = (y - g.topY) / (g.shoulderY - g.topY);
  return g.topFlatRightX + (g.rightSideX - g.topFlatRightX) * (1 - Math.cos((u * Math.PI) / 2));
}

function bottomLeftX(y) {
  const g = OIL_TANK;
  if (y <= g.sideBottomY) return g.leftSideX;
  if (y >= g.bottomY) return g.bottomFlatLeftX;
  const u = (y - g.sideBottomY) / (g.bottomY - g.sideBottomY);
  return g.leftSideX + (g.bottomFlatLeftX - g.leftSideX) * Math.sin((u * Math.PI) / 2);
}

function bottomRightX(y) {
  const g = OIL_TANK;
  if (y <= g.sideBottomY) return g.rightSideX;
  if (y >= g.bottomY) return g.bottomFlatRightX;
  const u = (y - g.sideBottomY) / (g.bottomY - g.sideBottomY);
  return g.rightSideX - (g.rightSideX - g.bottomFlatRightX) * Math.sin((u * Math.PI) / 2);
}

function tankLeftX(y) {
  return y < OIL_TANK.shoulderY ? topLeftX(y) : bottomLeftX(y);
}

function tankRightX(y) {
  return y < OIL_TANK.shoulderY ? topRightX(y) : bottomRightX(y);
}

function buildOilLevelPath(percent) {
  const g = OIL_TANK;
  const pct = clamp(Number(percent) || 0, 0, 100);
  if (pct <= 0) return "";

  const liquidTopY = clamp(g.bottomY - ((g.bottomY - g.topY) * pct) / 100, g.topY, g.bottomY);
  const pointsRight = [];
  const pointsLeft = [];
  const step = 4;

  for (let y = liquidTopY; y <= g.bottomY; y += step) {
    pointsRight.push([tankRightX(y), y]);
    pointsLeft.push([tankLeftX(y), y]);
  }

  if (pointsRight.length === 0 || pointsRight[pointsRight.length - 1][1] < g.bottomY) {
    pointsRight.push([tankRightX(g.bottomY), g.bottomY]);
    pointsLeft.push([tankLeftX(g.bottomY), g.bottomY]);
  }

  const [startRightX] = pointsRight[0];
  const [startLeftX] = pointsLeft[0];

  const rightSegments = pointsRight.slice(1).map(([x, y]) => `L ${formatNum(x)} ${formatNum(y)}`).join(" ");
  const leftSegments = pointsLeft.slice().reverse().map(([x, y]) => `L ${formatNum(x)} ${formatNum(y)}`).join(" ");

  return [
    `M ${formatNum(startLeftX)} ${formatNum(liquidTopY)}`,
    `L ${formatNum(startRightX)} ${formatNum(liquidTopY)}`,
    rightSegments,
    leftSegments,
    "Z",
  ].filter(Boolean).join(" ");
}

function ensureOilLevelElements(group) {
  // ===== TANK DRAWING =====
  // Erase the baked-in fuel pixels from the raster baseline.
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

  // ===== FUEL DRAWING =====
  // Dedicated vector path for the dynamic oil level.
  let fill = group.querySelector("#oil-fill-v016");
  if (!fill) {
    fill = document.createElementNS(SVG_NS, "path");
    fill.setAttribute("id", "oil-fill-v016");
    fill.setAttribute("class", "oil-fill");
    fill.setAttribute("pointer-events", "none");
    fill.setAttribute("opacity", "0.72");

    // ===== TUBE IN THE TANK =====
    // Keep the suction tube above the fill so it always remains visible.
    const tube = Array.from(group.querySelectorAll("path")).find(
      (el) => el.getAttribute("d") === "M190 401 V748 M179 748 H201"
    );
    group.insertBefore(fill, tube || null);
  }

  const oldRect = group.querySelector("#oil-fill");
  if (oldRect) oldRect.style.display = "none";

  return fill;
}

function renderOilLevelV016() {
  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  const state = String(this._state("oil_height_percent") ?? "").replace(",", ".");
  const pct = clamp(Number.parseFloat(state), 0, 100);

  const fill = ensureOilLevelElements(group);
  fill.setAttribute("d", buildOilLevelPath(Number.isFinite(pct) ? pct : 0));
  fill.style.display = pct > 0 ? "" : "none";
}

BoilerCardClass.prototype._updateOilFill = renderOilLevelV016;

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank in one SVG card. v0.6.16 (clean dynamic oil level)";
  }
}
