/*
 * Lovelace Boiler Card v0.8.7
 * - every displayed value opens the corresponding Home Assistant entity
 * - adds three top-left setpoint sliders: reduced, normal, DHW
 */
import "./lovelace-boiler-card-v0.8.6.js";

const BoilerCardClassV087 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV087) {
  throw new Error("lovelace-boiler-card: v0.8.6 base did not register the card");
}

const SVG_NS_V087 = "http://www.w3.org/2000/svg";
const XHTML_NS_V087 = "http://www.w3.org/1999/xhtml";

const VIESSMANN_MODE_ENTITY_V087 = "select.chaudiere_viessmann_mode_de_fonctionnement";

const SLIDERS_V087 = Object.freeze([
  {
    key: "reduced_temp_control",
    label: "Réduit",
    entity: "number.reglage_temperature_reduite",
    fallbackMin: 3,
    fallbackMax: 30,
    fallbackStep: 0.5,
  },
  {
    key: "normal_temp_control",
    label: "Normal",
    entity: "number.reglage_temperature_normale",
    fallbackMin: 3,
    fallbackMax: 30,
    fallbackStep: 0.5,
  },
  {
    key: "dhw_temp_control",
    label: "Eau chaude",
    entity: "number.reglage_temperature_ballon_eau_chaude",
    fallbackMin: 10,
    fallbackMax: 60,
    fallbackStep: 1,
  },
]);

const VALUE_ENTITY_MAP_V087 = Object.freeze({
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

const previousUpdateV087 = BoilerCardClassV087.prototype._update;

function moreInfoEntityV087(card, entityId) {
  if (!entityId) return;
  card.dispatchEvent(new CustomEvent("hass-more-info", {
    bubbles: true,
    composed: true,
    detail: { entityId },
  }));
}

function resolvedEntityV087(card, key, fallback) {
  const configured = card._config?.[key];
  return (typeof configured === "string" && configured.trim())
    ? configured.trim()
    : fallback;
}

function bindValueElementV087(card, el, getEntityId) {
  if (!el || el.dataset.v087Clickable === "1") return;

  el.dataset.v087Clickable = "1";
  el.style.pointerEvents = "auto";
  el.style.cursor = "pointer";
  el.setAttribute("tabindex", "0");
  el.setAttribute("role", "button");

  const open = (event) => {
    event?.stopPropagation?.();
    moreInfoEntityV087(card, getEntityId());
  };

  el.addEventListener("click", open);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open(event);
    }
  });
}

function ensureAllValueClicksV087() {
  for (const [textId, entityKey] of Object.entries(VALUE_ENTITY_MAP_V087)) {
    const el = this.shadowRoot?.getElementById(textId);
    if (!el) continue;
    bindValueElementV087(this, el, () => this._entityId(entityKey));
  }

  const modeText = this.shadowRoot?.getElementById("txt-boiler-operating-mode-v085");
  if (modeText) {
    modeText.style.pointerEvents = "auto";
    bindValueElementV087(this, modeText, () => resolvedEntityV087(
      this,
      "boiler_operating_mode",
      VIESSMANN_MODE_ENTITY_V087,
    ));
  }
}

function createHtmlV087(tag, className, textContent = "") {
  const el = document.createElementNS(XHTML_NS_V087, tag);
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  return el;
}

function ensureSliderPanelV087() {
  const svg = this.shadowRoot?.querySelector("svg");
  if (!svg) return null;

  let foreignObject = this.shadowRoot.getElementById("boiler-controls-v087");
  if (foreignObject) return foreignObject;

  foreignObject = document.createElementNS(SVG_NS_V087, "foreignObject");
  foreignObject.setAttribute("id", "boiler-controls-v087");
  foreignObject.setAttribute("x", "28");
  foreignObject.setAttribute("y", "20");
  foreignObject.setAttribute("width", "420");
  foreignObject.setAttribute("height", "190");
  foreignObject.setAttribute("overflow", "visible");

  const panel = createHtmlV087("div", "v087-panel");
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

  for (const def of SLIDERS_V087) {
    const row = createHtmlV087("div", "v087-row");
    row.setAttribute("style", "display:grid;grid-template-columns:92px 1fr 62px;align-items:center;gap:10px;height:44px;");

    const label = createHtmlV087("span", "v087-label", def.label);
    label.setAttribute("style", "white-space:nowrap;");

    const input = createHtmlV087("input", "v087-slider");
    input.setAttribute("type", "range");
    input.dataset.sliderKey = def.key;
    input.setAttribute("style", "width:100%;margin:0;accent-color:#ff3232;cursor:pointer;");

    const value = createHtmlV087("span", "v087-value", "—");
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
      const entityId = resolvedEntityV087(this, def.key, def.entity);
      const numeric = Number(input.value);
      if (!entityId || !Number.isFinite(numeric) || !this._hass?.callService) return;
      this._hass.callService("number", "set_value", {
        entity_id: entityId,
        value: numeric,
      });
    });

    const openSliderEntity = (event) => {
      event?.stopPropagation?.();
      moreInfoEntityV087(this, resolvedEntityV087(this, def.key, def.entity));
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

function updateSliderPanelV087() {
  const panel = ensureSliderPanelV087.call(this);
  if (!panel) return;

  for (const def of SLIDERS_V087) {
    const entityId = resolvedEntityV087(this, def.key, def.entity);
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

BoilerCardClassV087.prototype._update = function () {
  previousUpdateV087.call(this);
  ensureAllValueClicksV087.call(this);
  updateSliderPanelV087.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.7 — clickable values + three Viessmann setpoint sliders";
  }
}
