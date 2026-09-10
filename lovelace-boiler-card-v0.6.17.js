/*
 * Lovelace Boiler Card v0.6.17
 * Based on v0.6.15 tank rendering.
 *
 * Only change in this version:
 * - the oil tank interior is filled completely with a static light grey;
 * - no oil level is drawn and no sensor changes the fill height.
 */
import "./lovelace-boiler-card.js";

const BoilerCardClass = customElements.get("lovelace-boiler-card");
if (!BoilerCardClass) {
  throw new Error("lovelace-boiler-card: base module did not register the card");
}

const SVG_NS = "http://www.w3.org/2000/svg";

// Same pixel-accurate erase overlay used by v0.6.15 to remove all yellow/orange
// fuel pixels baked into the raster baseline.
const EMPTY_TANK_ERASE_OVERLAY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQUAAAE6CAYAAAAfukfpAAAD9klEQVR42u3dQW7CMBCGUYx6Ct//bHMN2CJamghi4hm/t6vKoqXNl9+oKu3Csnrvtz2Pi4jm2VrH1VMAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAIgCIAqAKPBo7792f/fx5Nb8UsDant/Xw1IAHB8AUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEAUAUAFEARAEQBUAUgAP8vPqEd4UCS0EQAMcHQBQAUQA+isLzW1MD69h18XvhEep6HgGOD8D28QEQBQBRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAWgtt777fHjtveBQH0R0SwF4LK5FKwEWJelAGxHISKapwbW4zUF4JfNReD1BVhjIfx7fHCUgDWDsCsKwFpEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFIC5oxARzVMF9fx1bVsKgCgAogCIAjA0Cl5sBFEACnt1oxcF4P0oOEKAKAALHR1EAfg8Co4QUHclWAqAKAADouAIATWPDpYCcFwUrAWotxIsBeDYKFgLIApA4aPDIVGwFqBOECwFYEwUrAWosRIsBWBcFKwFyL8SDl8KwgC5g+D4AIyPgrUAeVfCsKUgDJAzCEOPD8IA+YIwNArCAPmCMDwKQK4gfCUK1gLk8pWlIAyQ59q6Zv7iQRCSLgVhgDzX0ikXae/95scKc95YT71ziwPMt7SvK3yTIAhJoiAMMN81Ms0F6SgBc9wwp7tLiwOcu6CnnO7CgBicZ+rzvDggCKIgDoiBKAgDYiAK4oAYTCv13wgIBEIgCuKAGIiCQCAEoiAUiIAoiAYufAAAAAAAAIDy7hNt1QBCKX4mAAAAAElFTkSuQmCC";

const STATIC_TANK_GREY = "#7b828a";

const renderStaticGreyTankV017 = function () {
  const fill = this.shadowRoot?.getElementById("oil-fill");
  if (fill) {
    fill.setAttribute("height", "0");
    fill.style.display = "none";
  }

  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

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

  let grey = group.querySelector("#oil-static-grey-fill");
  if (!grey) {
    grey = document.createElementNS(SVG_NS, "path");
    grey.setAttribute("id", "oil-static-grey-fill");
    grey.setAttribute("d", "M66 462 V452 C66 423 91 401 123 401 H247 C279 401 304 423 304 454 V678 C304 713 279 739 247 739 H123 C91 739 66 713 66 680 Z");
    grey.setAttribute("fill", STATIC_TANK_GREY);
    grey.setAttribute("pointer-events", "none");

    // Keep the original v0.6.15 suction tube above the grey interior.
    const tube = Array.from(group.querySelectorAll("path")).find(
      (el) => el.getAttribute("d") === "M190 401 V748 M179 748 H201"
    );
    group.insertBefore(grey, tube || null);
  }
};

BoilerCardClass.prototype._updateOilFill = renderStaticGreyTankV017;

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank in one SVG card. v0.6.17 (static grey tank)";
  }
}
