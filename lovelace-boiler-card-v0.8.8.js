/*
 * Lovelace Boiler Card v0.8.8
 * - every displayed value opens the corresponding Home Assistant entity
 * - adds three top-left setpoint sliders: reduced, normal, DHW
 */
import "./lovelace-boiler-card-v0.8.6.js";

const BoilerCardClassV088 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV088) {
  throw new Error("lovelace-boiler-card: v0.8.6 base did not register the card");
}

const SVG_NS_V088 = "http://www.w3.org/2000/svg";
const XHTML_NS_V088 = "http://www.w3.org/1999/xhtml";

const VIESSMANN_MODE_ENTITY_V088 = "select.chaudiere_viessmann_mode_de_fonctionnement";

const SLIDERS_V088 = Object.freeze([
  {
    key: "reduced_temp_control",
    label: "Réduit",
    entity: "number.chaufferie_chaudiere_viessmann_reglage_temperature_reduite",
    fallbackMin: 3,
    fallbackMax: 23,
    fallbackStep: 0.5,
  },
  {
    key: "normal_temp_control",
    label: "Normal",
    entity: "number.chaufferie_chaudiere_viessmann_reglage_temperature_normale",
    fallbackMin: 10,
    fallbackMax: 30,
    fallbackStep: 0.5,
  },
  {
    key: "dhw_temp_control",
    label: "Eau chaude",
    entity: "number.chaufferie_chaudiere_viessmann_reglage_temperature_ballon_eau_chaude",
    fallbackMin: 12,
    fallbackMax: 55,
    fallbackStep: 1,
  },
]);

const VALUE_ENTITY_MAP_V088 = Object.freeze({
  "txt-oil-level": "oil_level",
  "txt-oil-volume": "oil_volume",
  "txt-boiler-temp": "boiler_temp",
  "txt-boiler-return": "boiler_return_temp",
  "txt-flue-gas": "flue_gas_temp",
  "txt-room-temp": "room_temp",
  "txt-outside-temp": "outside_temp",
  "txt-heating-flow": "heating_flow_temp",
  "txt-heating-target": "heating_target_temp",
  "txt-dhw-top": "dhw_top_temp",
  "txt-dhw-middle": "dhw_middle_temp",
  "txt-dhw-target": "dhw_target_temp",
  "txt-dhw-bottom": "dhw_bottom_temp",
});

const previousUpdateV088 = BoilerCardClassV088.prototype._update;

function moreInfoEntityV088(card, entityId) {
  if (!entityId) return;
  card.dispatchEvent(new CustomEvent("hass-more-info", {
    bubbles: true,
    composed: true,
    detail: { entityId },
  }));
}

function resolvedEntityV088(card, key, fallback) {
  const configured = card._config?.[key];
  return (typeof configured === "string" && configured.trim())
    ? configured.trim()
    : fallback;
}

function bindValueElementV088(card, el, getEntityId) {
  if (!el || el.dataset.v088Clickable === "1") return;

  el.dataset.v088Clickable = "1";
  el.style.pointerEvents = "auto";
  el.style.cursor = "pointer";
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "button");

  const open = (event) => {
    event?.stopPropagation?.();
    moreInfoEntityV088(card, getEntityId());
  };

  el.addEventListener("click", open);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(event);
    }
  });
}

function ensureAllValueClicksV088() {
  for (const [textId, entityKey] of Object.entries(VALUE_ENTITY_MAP_V088)) {
    const el = this.shadowRoot?.getElementById(textId);
    if (!el) continue;
    bindValueElementV088(this, el, () => this._entityId(entityKey));
  }

  const modeText = this.shadowRoot?.getElementById("txt-boiler-operating-mode-v085");
  if (modeText) {
    modeText.style.pointerEvents = "auto";
    bindValueElementV088(this, modeText, () => resolvedEntityV088(
      this,
      "boiler_operating_mode",
      VIESSMANN_MODE_ENTITY_V088,
    ));
  }
}

function createHtmlV088(tag, className, textContent = "") {
  const el = document.createElementNS(XHTML_NS_V088, tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

function ensureSliderPanelV088() {
  const svg = this.shadowRoot?.querySelector("svg");
  if (!svg) return null;

  let foreignObject = this.shadowRoot.getElementById("boiler-controls-v088");
  if (foreignObject) return foreignObject;

  foreignObject = document.createElementNS(SVG_NS_V088, "foreignObject");
  foreignObject.setAttribute("id", "boiler-controls-v088");
  foreignObject.setAttribute("x", "28");
  foreignObject.setAttribute("y", "20");
  foreignObject.setAttribute("width", "420");
  foreignObject.setAttribute("height", "190");
  foreignObject.setAttribute("overflow", "visible");

  const panel = createHtmlV088("div", "v088-panel");
  panel.setAttribute("style", [
    "box-sizing:border-box",
    "width:100%",
    "height:100%",
    "padding:12px 14px",
    "border:1.5px solid #a0a0a0",
    "border-radius:12px",
    "background:rgba(32,32,32,.90)",
    "color:var(--bc-text,#e8e8e8)",
    "font-family:Roboto,Arial,Helvetica,sans-serif",
    "font-size:17px",
    "font-weight:500",
    "display:flex",
    "flex-direction:column",
    "justify-content:center",
    "gap:10px",
  ].join(";"));

  for (const def of SLIDERS_V088) {
    const row = createHtmlV088("div", "v088-row");
    row.setAttribute("style", "display:grid;grid-template-columns:92px 1fr 62px;align-items:center;gap:10px;height:44px;");

    const label = createHtmlV088("span", "v088-label", def.label);
    label.setAttribute("style", "white-space:nowrap;");

    const input = createHtmlV088("input", "v088-slider");
    input.setAttribute("type", "range");
    input.dataset.sliderKey = def.key;
    input.setAttribute("style", "width:100%;margin:0;accent-color:#ff3232;cursor:pointer;");

    const value = createHtmlV088("span", "v088-value", "—");
    value.dataset.sliderValueKey = def.key;
    value.setAttribute("style", "text-align:right;font-weight:700;white-space:nowrap;cursor:pointer;");
    value.setAttribute("tabindex", "0");
    value.setAttribute("role", "button");

    input.addEventListener("pointerdown", () => { input.dataset.dragging = "1"; });
    input.addEventListener("pointerup", () => { input.dataset.dragging = "0"; });
    input.addEventListener("pointercancel", () => { input.dataset.dragging = "0"; });
    input.addEventListener("input", () => {
      const numeric = Number(input.value);
      value.textContent = Number.isFinite(numeric) ? `${numeric.toLocaleString(undefined, { maximumFractionDigits: 1 })} °C` : "—";
    });
    input.addEventListener("change", () => {
      input.dataset.dragging = "0";
      const entityId = resolvedEntityV088(this, def.key, def.entity);
      const numeric = Number(input.value);
      if (!entityId || !Number.isFinite(numeric) || !this._hass?.callService) return;
      this._hass.callService("number", "set_value", {
        entity_id: entityId,
        value: numeric,
      });
    });

    const openSliderEntity = (event) => {
      event?.stopPropagation?.();
      moreInfoEntityV088(this, resolvedEntityV088(this, def.key, def.entity));
    };
    value.addEventListener("click", openSliderEntity);
    value.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openSliderEntity(event);
      }
    });

    row.append(label, input, value);
    panel.appendChild(row);
  }

  foreignObject.appendChild(panel);
  svg.appendChild(foreignObject);
  return foreignObject;
}

function updateSliderPanelV088() {
  const panel = ensureSliderPanelV088.call(this);
  if (!panel) return;

  for (const def of SLIDERS_V088) {
    const entityId = resolvedEntityV088(this, def.key, def.entity);
    const stateObj = this._hass?.states?.[entityId];
    const input = panel.querySelector(`input[data-slider-key="${def.key}"]`);
    const value = panel.querySelector(`[data-slider-value-key="${def.key}"]`);
    if (!input || !value) continue;

    const raw = Number(stateObj?.state);
    const min = Number(stateObj?.attributes?.min);
    const max = Number(stateObj?.attributes?.max);
    const step = Number(stateObj?.attributes?.step);

    input.min = String(Number.isFinite(min) ? min : def.fallbackMin);
    input.max = String(Number.isFinite(max) ? max : def.fallbackMax);
    input.step = String(Number.isFinite(step) && step > 0 ? step : def.fallbackStep);
    input.disabled = !stateObj || !Number.isFinite(raw);

    if (input.dataset.dragging !== "1") {
      if (Number.isFinite(raw)) {
        input.value = String(raw);
        value.textContent = `${raw.toLocaleString(undefined, { maximumFractionDigits: 1 })} °C`;
      } else {
        value.textContent = "—";
      }
    }
  }
}

BoilerCardClassV088.prototype._update = function () {
  previousUpdateV088.call(this);
  ensureAllValueClicksV088.call(this);
  updateSliderPanelV088.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.8 — clickable values + three Viessmann setpoint sliders";
  }
}
