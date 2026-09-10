/*
 * Lovelace Boiler Card v0.6.15
 * Based exactly on v0.6.9.
 * Removes every visible fuel pixel inside the tank while leaving the tank geometry
 * and the v0.6.9 suction tube unchanged.
 */
import "./lovelace-boiler-card.js";

const BoilerCardClass = customElements.get("lovelace-boiler-card");
if (!BoilerCardClass) {
  throw new Error("lovelace-boiler-card: base v0.6.9 module did not register the card");
}

const SVG_NS = "http://www.w3.org/2000/svg";
const EMPTY_TANK_ERASE_OVERLAY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQUAAAE6CAYAAAAfukfpAAAD9klEQVR42u3dQW7CMBCGUYx6Ct//bHMN2CJamghi4hm/t6vKoqXNl9+oKu3Csnrvtz2Pi4jm2VrH1VMAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAIgCIAqAKPBo7792f/fx5Nb8UsDant/Xw1IAHB8AUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEAUAUAFEARAEQBUAUgAP8vPqEd4UCS0EQAMcHQBQAUQA+isLzW1MD69h18XvhEep6HgGOD8D28QEQBQBRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAWgtt777fHjtveBQH0R0SwF4LK5FKwEWJelAGxHISKapwbW4zUF4JfNReD1BVhjIfx7fHCUgDWDsCsKwFpEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFIC5oxARzVMF9fx1bVsKgCgAogCIAjA0Cl5sBFEACnt1oxcF4P0oOEKAKAALHR1EAfg8Co4QUHclWAqAKAADouAIATWPDpYCcFwUrAWotxIsBeDYKFgLIApA4aPDIVGwFqBOECwFYEwUrAWosRIsBWBcFKwFyL8SDl8KwgC5g+D4AIyPgrUAeVfCsKUgDJAzCEOPD8IA+YIwNArCAPmCMDwKQK4gfCUK1gLk8pWlIAyQ59q6Zv7iQRCSLgVhgDzX0ikXae/95scKc95YT71ziwPMt7SvK3yTIAhJoiAMMN81Ms0F6SgBc9wwp7tLiwOcu6CnnO7CgBicZ+rzvDggCKIgDoiBKAgDYiAK4oAYTCv13wgIBEIgCuKAGIiCQCAEoiAUiIAoiAYufAAAAAAAAIDy7hNt1QBCKX4mAAAAAElFTkSuQmCC";

const renderEmptyOilTank = function () {
  // ===== FUEL DRAWING =====
  // The dynamic fuel rectangle is completely disabled in this version.
  const fill = this.shadowRoot?.getElementById("oil-fill");
  if (fill) {
    fill.setAttribute("y", "739");
    fill.setAttribute("height", "0");
    fill.style.display = "none";
  }

  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  // ===== TANK DRAWING =====
  // v0.6.9 has fuel pixels baked into the raster baseline along the tank sides and
  // bottom. This transparent pixel-mask covers ONLY those yellow/orange pixels.
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

    // ===== SUCTION TUBE DRAWING =====
    // Keep the exact v0.6.9 tube above the erase mask. No tube geometry is changed.
    const tube = Array.from(group.querySelectorAll("path")).find(
      (el) => el.getAttribute("d") === "M190 401 V748 M179 748 H201"
    );
    group.insertBefore(erase, tube || group.firstChild);
  }
};

// Only the oil-level renderer is replaced; the rest is exact v0.6.9.
BoilerCardClass.prototype._updateOilFill = renderEmptyOilTank;

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank in one SVG card. v0.6.15 (empty tank)";
  }
}
