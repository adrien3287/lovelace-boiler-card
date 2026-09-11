/*
 * Lovelace Boiler Card v0.8.6
 * - grey oil-tank outline stroke increased to 15
 * - moves the Viessmann operating-mode text inside the boiler, centered above the flame
 */
import "./lovelace-boiler-card-v0.8.5.js";

const BoilerCardClassV086 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV086) {
  throw new Error("lovelace-boiler-card: v0.8.5 base did not register the card");
}

const GREY_STROKE_V086 = 15;
const BOILER_MODE_X_V086 = 563;
const BOILER_MODE_Y_V086 = 475;
const BOILER_MODE_FONT_SIZE_V086 = 18;

const previousOilUpdateV086 = BoilerCardClassV086.prototype._updateOilFill;
const previousUpdateV086 = BoilerCardClassV086.prototype._update;

function applyV086OilStroke() {
  const outline = this.shadowRoot?.getElementById("oil-tank-outline-v082");
  if (outline) {
    outline.setAttribute("stroke-width", String(GREY_STROKE_V086));
  }
}

function positionBoilerModeV086() {
  const text = this.shadowRoot?.getElementById("txt-boiler-operating-mode-v085");
  if (!text) return;

  text.setAttribute("x", String(BOILER_MODE_X_V086));
  text.setAttribute("y", String(BOILER_MODE_Y_V086));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-size", String(BOILER_MODE_FONT_SIZE_V086));
  text.setAttribute("font-weight", "600");
  text.setAttribute("pointer-events", "none");
}

BoilerCardClassV086.prototype._updateOilFill = function () {
  previousOilUpdateV086.call(this);
  applyV086OilStroke.call(this);
};

BoilerCardClassV086.prototype._update = function () {
  previousUpdateV086.call(this);
  positionBoilerModeV086.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.6 — grey stroke 15 + Viessmann mode centered above flame";
  }
}
