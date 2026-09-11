/*
 * Lovelace Boiler Card v0.8.3
 * Position correction based on v0.8.2.
 * Shifts the red tank body, grey tank outline and rectangular gauge
 * right by one grey-stroke width and down by two grey-stroke widths.
 */
import "./lovelace-boiler-card-v0.8.2.js";

const BoilerCardClassV083 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV083) {
  throw new Error("lovelace-boiler-card: v0.8.2 base did not register the card");
}

const previousOilUpdateV083 = BoilerCardClassV083.prototype._updateOilFill;

function applyV083OilShift() {
  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  const redBody = group.querySelector("#oil-static-tank-v082");
  const greyOutline = group.querySelector("#oil-tank-outline-v082");
  const gauge = group.querySelector("#oil-rect-gauge-v081");

  if (!redBody || !greyOutline || !gauge) return;

  const strokeWidth = Number.parseFloat(greyOutline.getAttribute("stroke-width") || "9") || 9;
  const shiftX = strokeWidth;
  const shiftY = strokeWidth * 2;
  const transform = `translate(${shiftX} ${shiftY})`;

  redBody.setAttribute("transform", transform);
  greyOutline.setAttribute("transform", transform);
  gauge.setAttribute("transform", transform);
}

BoilerCardClassV083.prototype._updateOilFill = function () {
  previousOilUpdateV083.call(this);
  applyV083OilShift.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.3 shifted tank + rectangular oil gauge";
  }
}
