/*
 * Lovelace Boiler Card v0.6.14
 * Based exactly on v0.6.9.
 * Diagnostic no-fuel build: keeps the tank and suction tube unchanged,
 * but hides the dynamic orange fuel fill completely.
 */
import "./lovelace-boiler-card.js";

const BoilerCardClass = customElements.get("lovelace-boiler-card");

if (!BoilerCardClass) {
  throw new Error("lovelace-boiler-card: base v0.6.9 module did not register the card");
}

const hideOilFill = function () {
  const fill = this.shadowRoot?.getElementById("oil-fill");
  if (fill) {
    fill.setAttribute("y", "739");
    fill.setAttribute("height", "0");
    fill.style.display = "none";
  }
};

// Replace only the dynamic fuel-level drawing routine.
// Tank geometry and the suction tube remain exactly as in v0.6.9.
BoilerCardClass.prototype._updateOilFill = hideOilFill;

// Keep the runtime card metadata aligned with this release candidate.
if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank in one SVG card. v0.6.14 (no-fuel diagnostic build)";
  }
}
