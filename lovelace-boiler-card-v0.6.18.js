/*
 * Lovelace Boiler Card v0.6.18
 * Based on the validated v0.6.15 empty-tank renderer.
 *
 * Oil tank behavior in this version:
 * - no dynamic oil level is drawn;
 * - all baked-in yellow/orange oil pixels are erased first;
 * - the complete tank interior is then filled with one uniform static grey;
 * - the original v0.6.9 suction tube remains unchanged and is rendered above the grey fill.
 */
import "./lovelace-boiler-card.js";

const BoilerCardClass = customElements.get("lovelace-boiler-card");
if (!BoilerCardClass) {
  throw new Error("lovelace-boiler-card: base module did not register the card");
}

const SVG_NS = "http://www.w3.org/2000/svg";
const EMPTY_TANK_ERASE_OVERLAY = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQUAAAE6CAYAAAAfukfpAAAD9klEQVR42u3dQW7CMBCGUYx6Ct//bHMN2CJamghi4hm/t6vKoqXNl9+oKu3Csnrvtz2Pi4jm2VrH1VMAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAKIAiAIgCoAoAIgCIAqAKPBo7792f/fx5Nb8UsDant/Xw1IAHB8AUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEAUAUAFEARAEQBUAUgAP8vPqEd4UCS0EQAMcHQBQAUQA+isLzW1MD69h18XvhEep6HgGOD8D28QEQBQBRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAVAFABRAEQBEAWgtt777fHjtveBQH0R0SwF4LK5FKwEWJelAGxHISKapwbW4zUF4JfNReD1BVhjIfx7fHCUgDWDsCsKwFpEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQBEARAFQBQAUQAQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAEQBUAUAFEARAFAFABRAEQBEAVAFABRAEQBEAVAFIC5oxARzVMF9fx1bVsKgCgAogCIAjA0Cl5sBFEACnt1oxcF4P0oOEKAKAALHR1EAfg8Co4QUHclWAqAKAADouAIATWPDpYCcFwUrAWotxIsBeDYKFgLIApA4aPDIVGwFqBOECwFYEwUrAWosRIsBWBcFKwFyL8SDl8KwgC5g+D4AIyPgrUAeVfCsKUgDJAzCEOPD8IA+YIwNArCAPmCMDwKQK4gfCUK1gLk8pWlIAyQ59q6Zv7iQRCSLgVhgDzX0ikXae/95scKc95YT71ziwPMt7SvK3yTIAhJoiAMMN81Ms0F6SgBc9wwp7tLiwOcu6CnnO7CgBicZ+rzvDggCKIgDoiBKAgDYiAK4oAYTCv13wgIBEIgCuKAGIiCQCAEoiAUiIAoiAYufAAAAAAAAIDy7hNt1QBCKX4mAAAAAElFTkSuQmCC";

const STATIC_TANK_GREY = "#777d84";

const renderFullGreyOilTankV018 = function () {
  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  const dynamicFill = this.shadowRoot?.getElementById("oil-fill");
  if (dynamicFill) {
    dynamicFill.setAttribute("height", "0");
    dynamicFill.style.display = "none";
  }

  group.querySelectorAll(
    "#oil-empty-erase-overlay, #oil-static-fill, #oil-static-grey-fill-v018, #oil-fill-v016"
  ).forEach((el) => el.remove());

  const erase = document.createElementNS(SVG_NS, "image");
  erase.setAttribute("id", "oil-empty-erase-overlay");
  erase.setAttribute("x", "58");
  erase.setAttribute("y", "452");
  erase.setAttribute("width", "261");
  erase.setAttribute("height", "314");
  erase.setAttribute("href", EMPTY_TANK_ERASE_OVERLAY);
  erase.setAttribute("pointer-events", "none");

  const greyFill = document.createElementNS(SVG_NS, "rect");
  greyFill.setAttribute("id", "oil-static-grey-fill-v018");
  greyFill.setAttribute("x", "58");
  greyFill.setAttribute("y", "397");
  greyFill.setAttribute("width", "254");
  greyFill.setAttribute("height", "348");
  greyFill.setAttribute("clip-path", "url(#oil-tank-clip)");
  greyFill.setAttribute("fill", STATIC_TANK_GREY);
  greyFill.setAttribute("opacity", "1");
  greyFill.setAttribute("pointer-events", "none");

  const tube = Array.from(group.querySelectorAll("path")).find(
    (el) => el.getAttribute("d") === "M190 401 V748 M179 748 H201"
  );

  group.insertBefore(erase, tube || group.firstChild);
  group.insertBefore(greyFill, tube || group.firstChild);
};

BoilerCardClass.prototype._updateOilFill = renderFullGreyOilTankV018;

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank in one SVG card. v0.6.18 (full static grey tank)";
  }
}
