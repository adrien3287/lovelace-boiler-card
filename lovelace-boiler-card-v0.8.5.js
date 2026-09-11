/*
 * Lovelace Boiler Card v0.8.5
 * - grey oil-tank outline stroke increased to 14
 * - displays Viessmann operating mode below the indoor-temperature value
 */
import "./lovelace-boiler-card-v0.8.4.js";

const BoilerCardClassV085 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV085) {
  throw new Error("lovelace-boiler-card: v0.8.4 base did not register the card");
}

const SVG_NS_V085 = "http://www.w3.org/2000/svg";
const VIESSMANN_MODE_ENTITY_V085 = "select.chaudiere_viessmann_mode_de_fonctionnement";
const GREY_STROKE_V085 = 14;
const ROOM_TEMP_X_V085 = 1104;
const ROOM_TEMP_Y_V085 = 175;
const ROOM_TEMP_TEXT_HEIGHT_V085 = 24;
const MODE_Y_V085 = ROOM_TEMP_Y_V085 + (ROOM_TEMP_TEXT_HEIGHT_V085 * 5);

const previousOilUpdateV085 = BoilerCardClassV085.prototype._updateOilFill;
const previousUpdateV085 = BoilerCardClassV085.prototype._update;

function applyV085OilStroke() {
  const outline = this.shadowRoot?.getElementById("oil-tank-outline-v082");
  if (outline) {
    outline.setAttribute("stroke-width", String(GREY_STROKE_V085));
  }
}

function ensureModeTextV085() {
  const svg = this.shadowRoot?.querySelector("svg");
  if (!svg) return null;

  let text = this.shadowRoot.getElementById("txt-boiler-operating-mode-v085");
  if (!text) {
    text = document.createElementNS(SVG_NS_V085, "text");
    text.setAttribute("id", "txt-boiler-operating-mode-v085");
    text.setAttribute("x", String(ROOM_TEMP_X_V085));
    text.setAttribute("y", String(MODE_Y_V085));
    text.setAttribute("class", "value");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("pointer-events", "none");
    text.textContent = "—";
    svg.appendChild(text);
  }
  return text;
}

function updateModeTextV085() {
  const text = ensureModeTextV085.call(this);
  if (!text) return;

  const configuredEntity = this._config?.boiler_operating_mode;
  const entityId = (typeof configuredEntity === "string" && configuredEntity.trim())
    ? configuredEntity.trim()
    : VIESSMANN_MODE_ENTITY_V085;

  const state = this._hass?.states?.[entityId]?.state;
  text.textContent = state && !["unknown", "unavailable"].includes(String(state).toLowerCase())
    ? String(state)
    : "—";
}

BoilerCardClassV085.prototype._updateOilFill = function () {
  previousOilUpdateV085.call(this);
  applyV085OilStroke.call(this);
};

BoilerCardClassV085.prototype._update = function () {
  previousUpdateV085.call(this);
  updateModeTextV085.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.5 — grey stroke 14 + Viessmann operating mode";
  }
}
