/*
 * Lovelace Boiler Card v0.8.4
 * Oil tank alignment refinement based on v0.8.2.
 * Compared with the v0.8.3 target: grey stroke = 13, tank/gauge shifted 4 px left and 2 px up.
 */
import "./lovelace-boiler-card-v0.8.2.js";

const BoilerCardClassV084 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV084) {
  throw new Error("lovelace-boiler-card: v0.8.2 base did not register the card");
}

// v0.8.3 target was +9 px right / +18 px down from v0.8.2.
// v0.8.4 moves that result 4 px left and 2 px up.
const TANK_SHIFT_X_V084 = 5;
const TANK_SHIFT_Y_V084 = 16;
const GREY_STROKE_V084 = 13;

const previousOilUpdateV084 = BoilerCardClassV084.prototype._updateOilFill;

function applyV084Alignment() {
  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  const redBody = group.querySelector("#oil-static-tank-v082");
  const greyOutline = group.querySelector("#oil-tank-outline-v082");
  const gauge = group.querySelector("#oil-rect-gauge-v081");

  const transform = `translate(${TANK_SHIFT_X_V084} ${TANK_SHIFT_Y_V084})`;

  if (redBody) {
    redBody.setAttribute("transform", transform);
  }

  if (greyOutline) {
    greyOutline.setAttribute("transform", transform);
    greyOutline.setAttribute("stroke-width", String(GREY_STROKE_V084));
  }

  if (gauge) {
    gauge.setAttribute("transform", transform);
  }
}

BoilerCardClassV084.prototype._updateOilFill = function () {
  previousOilUpdateV084.call(this);
  applyV084Alignment.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.4 — grey stroke 13, tank/gauge +5/+16";
  }
}
