/*
 * Lovelace Boiler Card
 * Single-SVG Home Assistant dashboard card for an oil boiler, one radiator loop,
 * and one domestic-hot-water loop with an optional electric immersion heater.
 *
 * Repository name: lovelace-boiler-card
 * Card type: custom:lovelace-boiler-card
 */

const BOILER_CARD_VERSION = "0.4.2";

const DEFAULTS = {
  title: "",
  burner_off_states: "Arrêt, Veille",
  boiler_standby_states: "Veille",
  burner_preheat_states: "Préchauffage",
  burner_ignition_states: "Démarrage",
  burner_burning_states: "Brûleur actif",
  heater_disabled_states: "Arrêt",
  heater_enabled_states: "Veille",
  heater_heating_states: "Chauffe",
};

const I18N = {
  fr: {
    oil: "Fioul",
    boiler: "Chaudière",
    heating: "Circuit chauffage",
    dhw: "Eau chaude",
    outside: "Extérieur",
    room: "Maison",
    flow: "Départ",
    target: "Consigne",
    returnTemp: "Retour",
    flue: "Fumées",
    top: "Haut",
    middle: "Milieu",
    bottom: "Bas",
    heater: "Résistance",
    litres: "Volume",
  },
  de: {
    oil: "Heizöl",
    boiler: "Kessel",
    heating: "Heizkreis",
    dhw: "Warmwasser",
    outside: "Außen",
    room: "Raum",
    flow: "Vorlauf",
    target: "Soll",
    returnTemp: "Rücklauf",
    flue: "Abgas",
    top: "Oben",
    middle: "Mitte",
    bottom: "Unten",
    heater: "Heizstab",
    litres: "Volumen",
  },
  en: {
    oil: "Heating oil",
    boiler: "Boiler",
    heating: "Heating circuit",
    dhw: "Hot water",
    outside: "Outside",
    room: "Room",
    flow: "Flow",
    target: "Target",
    returnTemp: "Return",
    flue: "Flue gas",
    top: "Top",
    middle: "Middle",
    bottom: "Bottom",
    heater: "Immersion heater",
    litres: "Volume",
  },
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stateList(value, fallback) {
  const source = value ?? fallback ?? "";
  if (Array.isArray(source)) return source.map(normalize).filter(Boolean);
  return String(source)
    .split(",")
    .map(normalize)
    .filter(Boolean);
}

class LovelaceBoilerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._clicksBound = false;
  }

  static getStubConfig() {
    return {
      title: "",
      oil_level: "sensor.pourcent_fioul",
      oil_volume: "sensor.niveau_fioul",
      boiler_temp: "sensor.mosquitto_mqtt_broker_kessel_ist_temperatur",
      burner_state: "input_select.statut_chaudiere",
      boiler_return_temp: "",
      flue_gas_temp: "",
      heating_pump: "binary_sensor.mosquitto_mqtt_broker_pompe_chauffage",
      outside_temp: "sensor.mosquitto_mqtt_broker_aussentemperatur",
      room_temp: "sensor.h5100_604c_temperature",
      heating_flow_temp: "sensor.mosquitto_mqtt_broker_kessel_ist_temperatur",
      heating_target_temp: "sensor.mosquitto_mqtt_broker_kessel_soll_temperatur",
      dhw_pump: "binary_sensor.mosquitto_mqtt_broker_pompe_eau_chaude",
      dhw_top_temp: "sensor.mosquitto_mqtt_broker_warmwasser_ist_temperatur",
      electric_heater_state: "input_select.statut_resistance",
      burner_off_states: DEFAULTS.burner_off_states,
      boiler_standby_states: DEFAULTS.boiler_standby_states,
      burner_preheat_states: DEFAULTS.burner_preheat_states,
      burner_ignition_states: DEFAULTS.burner_ignition_states,
      burner_burning_states: DEFAULTS.burner_burning_states,
      heater_disabled_states: DEFAULTS.heater_disabled_states,
      heater_enabled_states: DEFAULTS.heater_enabled_states,
      heater_heating_states: DEFAULTS.heater_heating_states,
    };
  }

  static getConfigForm() {
    const entity = (name, label, required = false) => ({
      name,
      title: label,
      required,
      selector: { entity: {} },
    });
    const text = (name, label) => ({ name, title: label, selector: { text: {} } });

    return {
      schema: [
        text("title", "Titre"),
        {
          type: "expandable",
          name: "boiler_group",
          title: "Chaudière / fioul",
          flatten: true,
          schema: [
            entity("oil_level", "Niveau fioul (%)"),
            entity("oil_volume", "Volume fioul"),
            entity("boiler_temp", "Température chaudière", true),
            entity("burner_state", "Statut chaudière", true),
            entity("boiler_return_temp", "Température retour chaudière (optionnel)"),
            entity("flue_gas_temp", "Température fumées (optionnel)"),
          ],
        },
        {
          type: "expandable",
          name: "heating_group",
          title: "Circuit radiateurs",
          flatten: true,
          schema: [
            entity("heating_pump", "Pompe chauffage"),
            entity("outside_temp", "Température extérieure"),
            entity("room_temp", "Température ambiante"),
            entity("heating_flow_temp", "Température départ"),
            entity("heating_target_temp", "Consigne départ"),
          ],
        },
        {
          type: "expandable",
          name: "dhw_group",
          title: "Eau chaude sanitaire",
          flatten: true,
          schema: [
            entity("dhw_pump", "Pompe ECS"),
            entity("dhw_top_temp", "Température haut"),
            entity("dhw_middle_temp", "Température milieu"),
            entity("dhw_bottom_temp", "Température bas"),
            entity("dhw_target_temp", "Consigne ECS"),
            entity("electric_heater_state", "État résistance électrique"),
          ],
        },
        {
          type: "expandable",
          name: "states_group",
          title: "Correspondance des états",
          flatten: true,
          schema: [
            text("burner_off_states", "Brûleur gris — arrêt / veille"),
            text("boiler_standby_states", "Chaudière verte — veille"),
            text("burner_preheat_states", "Brûleur jaune — préchauffage"),
            text("burner_ignition_states", "Brûleur orange — allumage"),
            text("burner_burning_states", "Brûleur rouge — combustion"),
            text("heater_disabled_states", "Résistance grise — désactivée"),
            text("heater_enabled_states", "Résistance verte — activée"),
            text("heater_heating_states", "Résistance rouge — chauffe"),
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config) throw new Error("Configuration requise");
    this._config = { ...DEFAULTS, ...config };
    this._render();
    if (this._hass) this._update();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._config && this.shadowRoot?.firstChild) this._update();
  }

  getCardSize() {
    return 8;
  }

  _lang() {
    const lang = (this._hass?.language || this._hass?.locale?.language || "fr")
      .split("-")[0]
      .toLowerCase();
    return I18N[lang] || I18N.en;
  }

  _entityId(key) {
    const direct = this._config?.[key];
    if (typeof direct === "string") return direct.trim();
    const legacy = this._config?.entities?.[key];
    if (typeof legacy === "string") return legacy.trim();
    if (legacy && typeof legacy.entity === "string") return legacy.entity.trim();
    return "";
  }

  _stateObj(key) {
    const id = this._entityId(key);
    return id ? this._hass?.states?.[id] : undefined;
  }

  _state(key) {
    return this._stateObj(key)?.state;
  }

  _format(key, fallbackUnit = "", decimals = 1) {
    const obj = this._stateObj(key);
    if (!obj || ["unknown", "unavailable", "none", ""].includes(normalize(obj.state))) return "—";
    const unit = obj.attributes?.unit_of_measurement || fallbackUnit;
    const raw = Number(obj.state);
    if (Number.isFinite(raw)) {
      const value = raw.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
      return `${value}${unit ? unit.startsWith("°") || unit === "%" ? "" : " " : ""}${unit}`;
    }
    return String(obj.state);
  }

  _setText(id, value) {
    const el = this.shadowRoot.getElementById(id);
    if (el) el.textContent = value;
  }

  _setClass(id, className) {
    const el = this.shadowRoot.getElementById(id);
    if (!el) return;
    el.classList.remove(
      "flame-off", "flame-preheat", "flame-ignition", "flame-burning",
      "pump-off", "pump-on",
      "heater-disabled", "heater-enabled", "heater-heating"
    );
    if (className) el.classList.add(className);
  }

  _burnerClass() {
    const state = normalize(this._state("burner_state"));
    if (!state) return "flame-off";
    const off = stateList(this._config.burner_off_states, DEFAULTS.burner_off_states);
    const preheat = stateList(this._config.burner_preheat_states, DEFAULTS.burner_preheat_states);
    const ignition = stateList(this._config.burner_ignition_states, DEFAULTS.burner_ignition_states);
    const burning = stateList(this._config.burner_burning_states, DEFAULTS.burner_burning_states);
    if (burning.includes(state)) return "flame-burning";
    if (ignition.includes(state)) return "flame-ignition";
    if (preheat.includes(state)) return "flame-preheat";
    if (off.includes(state)) return "flame-off";
    return "flame-off";
  }

  _pumpClass(key) {
    const state = normalize(this._state(key));
    return ["on", "ein", "true", "1", "active", "running"].includes(state) ? "pump-on" : "pump-off";
  }

  _boilerClass() {
    const state = normalize(this._state("burner_state"));
    const standby = stateList(this._config.boiler_standby_states, DEFAULTS.boiler_standby_states);
    return standby.includes(state) ? "boiler-standby" : "boiler-normal";
  }

  _heaterClass() {
    const state = normalize(this._state("electric_heater_state"));
    if (!state) return "heater-disabled";
    const heating = stateList(this._config.heater_heating_states, DEFAULTS.heater_heating_states);
    const enabled = stateList(this._config.heater_enabled_states, DEFAULTS.heater_enabled_states);
    const disabled = stateList(this._config.heater_disabled_states, DEFAULTS.heater_disabled_states);
    if (heating.includes(state)) return "heater-heating";
    if (enabled.includes(state)) return "heater-enabled";
    if (disabled.includes(state)) return "heater-disabled";
    return "heater-disabled";
  }

  _updateOilFill() {
    const raw = Number(this._state("oil_level"));
    const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, raw)) : 0;
    const tankY = 126;
    const tankH = 266;
    const fillH = (tankH * pct) / 100;
    const fill = this.shadowRoot.getElementById("oil-fill");
    if (fill) {
      fill.setAttribute("y", String(tankY + tankH - fillH));
      fill.setAttribute("height", String(fillH));
    }
  }

  _setOptionalVisible(id, key) {
    const el = this.shadowRoot.getElementById(id);
    if (el) el.style.display = this._entityId(key) ? "" : "none";
  }

  _update() {
    const t = this._lang();
    this._setText("label-outside", t.outside);
    this._setText("label-room", t.room);
    this._setText("label-flow", t.flow);
    this._setText("label-target", t.target);
    this._setText("label-return", t.returnTemp);
    this._setText("label-flue", t.flue);
    this._setText("label-top", t.top);
    this._setText("label-middle", t.middle);
    this._setText("label-bottom", t.bottom);

    this._setText("txt-oil-level", this._format("oil_level", "%", 1));
    this._setText("txt-oil-volume", this._format("oil_volume", "", 0));
    this._setText("txt-boiler-temp", this._format("boiler_temp", "°C", 1));
    this._setText("txt-boiler-return", this._format("boiler_return_temp", "°C", 1));
    this._setText("txt-flue-gas", this._format("flue_gas_temp", "°C", 1));
    this._setText("txt-outside-temp", this._format("outside_temp", "°C", 1));
    this._setText("txt-room-temp", this._format("room_temp", "°C", 1));
    this._setText("txt-heating-flow", this._format("heating_flow_temp", "°C", 1));
    this._setText("txt-heating-target", this._format("heating_target_temp", "°C", 1));
    this._setText("txt-dhw-top", this._format("dhw_top_temp", "°C", 1));
    this._setText("txt-dhw-middle", this._format("dhw_middle_temp", "°C", 1));
    this._setText("txt-dhw-bottom", this._format("dhw_bottom_temp", "°C", 1));
    this._setText("txt-dhw-target", this._format("dhw_target_temp", "°C", 1));

    const burnerRaw = this._state("burner_state");
    this._setText("txt-burner-state", burnerRaw || "—");
    this._setOptionalVisible("optional-boiler-return", "boiler_return_temp");
    this._setOptionalVisible("optional-flue-gas", "flue_gas_temp");

    this._setClass("obj-flame", this._burnerClass());
    this._setClass("obj-boiler-body", this._boilerClass());
    this._setClass("obj-heating-pump", this._pumpClass("heating_pump"));
    this._setClass("obj-dhw-pump", this._pumpClass("dhw_pump"));
    this._setClass("obj-electric-heater", this._heaterClass());
    this._updateOilFill();
  }

  _moreInfo(key) {
    const entityId = this._entityId(key);
    if (!entityId) return;
    const event = new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    });
    this.dispatchEvent(event);
  }

  _bindClicks() {
    if (this._clicksBound) return;
    this.shadowRoot.querySelectorAll("[data-entity-key]").forEach((el) => {
      el.addEventListener("click", () => this._moreInfo(el.dataset.entityKey));
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          this._moreInfo(el.dataset.entityKey);
        }
      });
    });
    this._clicksBound = true;
  }

  _render() {
    this._clicksBound = false;
    const title = escapeHtml(this._config.title ?? DEFAULTS.title);
    const header = title ? `<div class="header">${title}</div>` : "";
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --bc-hot: #c86464;
          --bc-cold: #6e8ca0;
          --bc-pipe-neutral: #8b8b8b;
          --bc-oil: #b18a38;
          --bc-metal: #777;
          --bc-metal-dark: #4f4f4f;
          --bc-metal-light: #bdbdbd;
          --bc-text: var(--primary-text-color, #e8e8e8);
          --bc-muted: var(--secondary-text-color, #a9a9a9);
          --bc-pill-bg: var(--card-background-color, #202020);
          --bc-pill-border: #a0a0a0;
          --bc-pump-on: #87ad27;
          --bc-pump-off: #bbbbbb;
          --bc-flame-off: #777777;
          --bc-flame-preheat: #f4d03f;
          --bc-flame-ignition: #f28c28;
          --bc-flame-burning: #e53935;
          --bc-heater-disabled: #969696;
          --bc-heater-enabled: #61a64b;
          --bc-heater-heating: #e53935;
          display: block;
        }

        ha-card {
          overflow: hidden;
          background: var(--ha-card-background, var(--card-background-color));
          color: var(--bc-text);
        }

        .header {
          padding: 14px 16px 0;
          font-size: 18px;
          font-weight: 500;
          line-height: 24px;
        }

        .wrap {
          padding: 8px 8px 12px;
        }

        svg {
          display: block;
          width: 100%;
          height: auto;
          min-height: 260px;
          font-family: Roboto, Arial, Helvetica, sans-serif;
          overflow: visible;
        }

        .section-label { fill: var(--bc-muted); font-size: 18px; font-weight: 500; }
        .small-label { fill: var(--bc-muted); font-size: 12px; }
        .value { fill: var(--bc-text); font-size: 17px; font-weight: 500; }
        .value-small { fill: var(--bc-text); font-size: 14px; font-weight: 500; }
        .target { fill: #ff3232; font-size: 12px; font-weight: 600; }
        .state-text { fill: var(--bc-muted); font-size: 11px; }

        .hot { stroke: var(--bc-hot); fill: none; stroke-width: 9; stroke-linecap: square; }
        .cold { stroke: var(--bc-cold); fill: none; stroke-width: 9; stroke-linecap: square; }
        .fuel-line { stroke: var(--bc-oil); fill: none; stroke-width: 5; }
        .metal { stroke: var(--bc-metal); fill: none; }
        .metal-fill { fill: var(--bc-metal); }
        .dark-fill { fill: var(--bc-metal-dark); }
        .light-fill { fill: var(--bc-metal-light); }
        .oil-fill { fill: var(--bc-oil); opacity: .72; }

        .pill-bg { fill: var(--bc-pill-bg); stroke: var(--bc-pill-border); stroke-width: 1.5; }
        .pill-icon { fill: var(--bc-metal-light); }

        .pump-off { color: var(--bc-pump-off); }
        .pump-on { color: var(--bc-pump-on); }
        .pump-shape { fill: currentColor; }

        .flame-off { color: var(--bc-flame-off); }
        .flame-preheat { color: var(--bc-flame-preheat); }
        .flame-ignition { color: var(--bc-flame-ignition); }
        .flame-burning { color: var(--bc-flame-burning); }
        .flame-shape { fill: currentColor; }

        .boiler-normal { color: var(--bc-metal); }
        .boiler-standby { color: #61a64b; }
        .boiler-outline { stroke: currentColor; fill: none; }

        .heater-disabled { color: var(--bc-heater-disabled); }
        .heater-enabled { color: var(--bc-heater-enabled); }
        .heater-heating { color: var(--bc-heater-heating); }
        .heater-tube { stroke: currentColor; fill: none; stroke-width: 8; stroke-linecap: round; }
        .heater-box { stroke: currentColor; fill: var(--bc-pill-bg); stroke-width: 5; }
        .heater-bolt { fill: currentColor; }
        .primary-coil { stroke: url(#primary-coil-gradient); fill: none; stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; }

        [data-entity-key] { cursor: pointer; outline: none; }
        [data-entity-key]:focus-visible { filter: drop-shadow(0 0 3px var(--primary-color)); }

        .arrow-hot { fill: #252525; opacity: .9; }
        .arrow-cold { fill: #252525; opacity: .9; }

        @media (max-width: 700px) {
          .header { font-size: 16px; }
          .wrap { padding: 4px; }
          svg { min-height: 220px; }
        }
      </style>

      <ha-card>
        ${header}
        <div class="wrap">
          <svg viewBox="0 0 1200 540" role="img" aria-label="Boiler installation overview" preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id="oil-tank-clip">
                <rect x="43" y="126" width="164" height="266" rx="34" ry="34"></rect>
              </clipPath>
              <clipPath id="dhw-tank-clip">
                <path d="M830 330 C830 306 875 292 930 292 C985 292 1030 306 1030 330 V466 C1030 486 986 500 930 500 C874 500 830 486 830 466 Z"></path>
              </clipPath>
              <linearGradient id="primary-coil-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--bc-hot)"></stop>
                <stop offset="100%" stop-color="var(--bc-cold)"></stop>
              </linearGradient>
            </defs>

            <!-- OIL TANK -->
            <g data-entity-key="oil_level" tabindex="0">
              <rect id="oil-fill" class="oil-fill" x="43" y="126" width="164" height="0" clip-path="url(#oil-tank-clip)"></rect>
              <rect x="40" y="120" width="170" height="278" rx="38" ry="38" fill="none" stroke="var(--bc-metal)" stroke-width="8"></rect>
              <path d="M40 185 H210 M40 330 H210" stroke="var(--bc-metal)" stroke-width="5" fill="none"></path>
              <path d="M60 398 l-12 22 h35 l8-22 M190 398 l12 22 h-35 l-8-22" stroke="var(--bc-metal)" stroke-width="6" fill="none"></path>
              <rect x="95" y="103" width="60" height="18" rx="5" class="dark-fill"></rect>
              <g transform="translate(54 72)">
                <rect class="pill-bg" width="143" height="38" rx="7"></rect>
                <path d="M14 29 A14 14 0 0 1 42 29" stroke="var(--bc-metal-light)" stroke-width="4" fill="none" stroke-linecap="round"></path>
                <circle cx="28" cy="29" r="3.5" fill="var(--bc-metal-light)"></circle>
                <path d="M28 29 L36 18" stroke="var(--bc-metal-light)" stroke-width="3.5" stroke-linecap="round"></path>
                <path d="M17 26l3 1 M21 19l2 2 M28 15v3 M35 19l-2 2 M39 26l-3 1" stroke="var(--bc-metal-light)" stroke-width="1.5" fill="none" stroke-linecap="round"></path>
                <text id="txt-oil-level" class="value" x="50" y="25">—</text>
              </g>
              <text id="txt-oil-volume" class="value-small" x="125" y="446" text-anchor="middle">—</text>
            </g>

            <path class="fuel-line" d="M210 280 H322"></path>
            <circle cx="258" cy="280" r="4" fill="var(--bc-oil)"></circle>
            <polygon points="287,274 300,280 287,286" fill="var(--bc-oil)"></polygon>

            <!-- OIL BOILER -->
            <g id="obj-boiler-body" class="boiler-normal" data-entity-key="boiler_temp" tabindex="0">
              <rect class="boiler-outline" x="320" y="145" width="185" height="265" rx="5" stroke-width="8"></rect>
              <line class="boiler-outline" x1="320" y1="306" x2="505" y2="306" stroke-width="7"></line>
              <g transform="translate(345 165)">
                <rect class="pill-bg" width="135" height="42" rx="7"></rect>
                <path class="pill-icon" d="M18 8h8v17a7 7 0 1 1-8 0V8zm4 3v17l-2 1a4 4 0 1 0 4 0l-2-1V11z"></path>
                <text id="txt-boiler-temp" class="value" x="48" y="27">—</text>
              </g>
            </g>

            <!-- Flue / chimney: elbow, vertical stack, cap and smoke -->
            <g aria-label="Flue chimney">
              <path d="M392 145 V105 H445 V58" stroke="var(--bc-metal)" stroke-width="16" fill="none" stroke-linecap="square" stroke-linejoin="round"></path>
              <path d="M445 58 V32" stroke="var(--bc-metal-light)" stroke-width="13" fill="none"></path>
              <path d="M428 30 H462" stroke="var(--bc-metal-light)" stroke-width="7" stroke-linecap="round"></path>
              <path d="M437 19 C428 10 442 4 434 -5 M449 20 C441 11 455 5 448 -4" stroke="var(--bc-muted)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"></path>
            </g>
            <g id="optional-flue-gas" data-entity-key="flue_gas_temp" tabindex="0" transform="translate(486 44)" style="display:none">
              <text id="label-flue" class="small-label" x="0" y="9">Fumées</text>
              <rect class="pill-bg" x="0" y="15" width="112" height="37" rx="7"></rect>
              <path class="pill-icon" d="M12 22h7v14a6 6 0 1 1-7 0V22zm3 3v14l-2 1a3 3 0 1 0 4 0l-2-1V25z"></path>
              <text id="txt-flue-gas" class="value-small" x="38" y="40">—</text>
            </g>

            <!-- Burner flame, physically inside the combustion chamber -->
            <g id="obj-flame" class="flame-off" data-entity-key="burner_state" tabindex="0">
              <path class="flame-shape" transform="translate(229 65) scale(1.15)" d="M143.6,171.7c0.4,4.9,3.7,11.8,12.3,10c-3.6-1-6.5-4.3-7.7-10.4c0.8,0.2,1.9,0.9,2.3,1.1c-0.2-0.9,0.1-3.4,1.4-6.4c1.5,7.7,2.6,9,4.1,9.3c-1.4-3.7-1.3-6.9-0.1-9.4c0.6,2.4,1.8,4.2,2.9,5.4c1.8-2.2,2.6-5.1,1.8-11.4c4,5.3,3.7,8.6,2.4,10.6c1.1-0.3,2.7-1.8,3.8-4.4c1,1.2,0.8,3.4-0.1,5.9c0.6-0.2,1.6-0.6,2.2-1.1c-1,7.3-5.2,8.2-9.2,10.4c5.7,2.3,15.1-1.1,16.2-8.8c0.3-1.3-0.1-3.2-0.4-4.7c-0.6,1-0.9,2.3-1.8,2.8c-0.2-1.4,0.2-2.6,0.8-3.8c1.1-4.3,0.4-7.9-1.9-10.7c-0.4,2.1-0.9,3.9-1.9,4.4c-1.1-6.5-3.1-11-5.5-12.2c0.2,1.9,0.1,3.5-0.6,4.9c-2-7.2-5.5-6.7-6.5-13.2c-1,0.7-1.2,2.3-1.4,3.7c0,2.9,0.2,5.7-1,7.1c-1.1-2.1-2.1-3.8-3.9-4c1.3,2.7,0.8,7.4-1.1,12.5c-0.7-1.3-1.9-3.9-3.6-4.3c0.4,3.4-0.1,7.3-0.9,10.9c-0.5-0.8-1.5-1.7-2.6-2.3C144.8,166.8,143.1,168.2,143.6,171.7z M159.2,149.8c0.2,2.7,0,5.5-0.8,6.9C158.3,154.1,158,152.6,159.2,149.8z"></path>
              <text id="txt-burner-state" class="state-text" x="412" y="300" text-anchor="middle">—</text>
            </g>

            <!-- Optional boiler return temperature: only rendered when configured -->
            <g id="optional-boiler-return" data-entity-key="boiler_return_temp" tabindex="0" transform="translate(340 335)" style="display:none">
              <rect class="pill-bg" width="145" height="55" rx="7"></rect>
              <path class="pill-icon" d="M14 10h8v20a7 7 0 1 1-8 0V10zm4 3v20l-2 1a4 4 0 1 0 4 0l-2-1V13z"></path>
              <text id="label-return" class="small-label" x="40" y="17">Retour</text>
              <text id="txt-boiler-return" class="value-small" x="40" y="39">—</text>
            </g>

            <!-- Simplified supply / return manifolds -->
            <path class="hot" d="M505 238 H585 V175 H635"></path>
            <path class="hot" d="M585 238 V390 H635"></path>
            <path class="cold" d="M505 390 H545 V225 H635"></path>
            <path class="cold" d="M545 390 V465 H635"></path>

            <!-- RADIATOR LOOP -->
            <g id="obj-heating-pump" class="pump-off" data-entity-key="heating_pump" tabindex="0" transform="translate(655 175)">
              <rect class="pump-shape" x="-28" y="-4" width="15" height="8" rx="1"></rect>
              <rect class="pump-shape" x="13" y="-4" width="15" height="8" rx="1"></rect>
              <circle cx="0" cy="0" r="18" fill="var(--bc-pill-bg)" stroke="currentColor" stroke-width="6"></circle>
              <circle class="pump-shape" cx="0" cy="0" r="7"></circle>
              <path class="pump-shape" d="M-4-11h8l5 7-4 2-5-5-5 5-4-2z"></path>
            </g>
            <path class="hot" d="M683 175 H1015"></path>
            <path class="cold" d="M1015 225 H635"></path>
            <polygon class="arrow-hot" points="770,168 784,175 770,182"></polygon>
            <polygon class="arrow-hot" points="905,168 919,175 905,182"></polygon>
            <polygon class="arrow-cold" points="870,218 856,225 870,232"></polygon>
            <polygon class="arrow-cold" points="740,218 726,225 740,232"></polygon>

            <g data-entity-key="heating_flow_temp" tabindex="0" transform="translate(722 170)">
              <rect class="pill-bg" width="145" height="55" rx="7"></rect>
              <path class="pill-icon" d="M14 10h8v20a7 7 0 1 1-8 0V10zm4 3v20l-2 1a4 4 0 1 0 4 0l-2-1V13z"></path>
              <text id="label-flow" class="small-label" x="40" y="17">Départ</text>
              <text id="txt-heating-flow" class="value-small" x="40" y="36">—</text>
              <text id="txt-heating-target" class="target" x="40" y="50">—</text>
            </g>

            <g data-entity-key="outside_temp" tabindex="0" transform="translate(1050 88)">
              <rect class="pill-bg" width="130" height="37" rx="7"></rect>
              <circle class="pill-icon" cx="18" cy="18" r="7"></circle>
              <path class="pill-icon" d="M18 4v5M18 27v5M4 18h5M27 18h5M8 8l4 4M24 24l4 4M28 8l-4 4M12 24l-4 4" stroke="var(--bc-metal-light)" stroke-width="2" fill="none"></path>
              <text id="txt-outside-temp" class="value-small" x="38" y="23">—</text>
            </g>

            <!-- Wider house roof / radiator -->
            <path d="M340 180 L760 5 L1188 220 V535" fill="none" stroke="var(--bc-metal-light)" stroke-width="6"></path>
            <g data-entity-key="room_temp" tabindex="0" transform="translate(670 78)">
              <rect class="pill-bg" width="170" height="38" rx="7"></rect>
              <path class="pill-icon" d="M7 20l14-12 14 12h-4v12H11V20H7zm9 10h10V19H16v11z"></path>
              <text id="txt-room-temp" class="value-small" x="43" y="24">—</text>
            </g>
            <g transform="translate(1008 172)" fill="var(--bc-metal)">
              <path d="M0 0h12l-4 61H-4z"></path>
              <path d="M16 0h12l-4 61H12z"></path>
              <path d="M32 0h12l-4 61H28z"></path>
              <path d="M48 0h12l-4 61H44z"></path>
              <path d="M64 0h12l-4 61H60z"></path>
            </g>

            <!-- DHW PRIMARY LOOP -->
            <g id="obj-dhw-pump" class="pump-off" data-entity-key="dhw_pump" tabindex="0" transform="translate(655 390)">
              <rect class="pump-shape" x="-28" y="-4" width="15" height="8" rx="1"></rect>
              <rect class="pump-shape" x="13" y="-4" width="15" height="8" rx="1"></rect>
              <circle cx="0" cy="0" r="18" fill="var(--bc-pill-bg)" stroke="currentColor" stroke-width="6"></circle>
              <circle class="pump-shape" cx="0" cy="0" r="7"></circle>
              <path class="pump-shape" d="M-4-11h8l5 7-4 2-5-5-5 5-4-2z"></path>
            </g>
            <path class="hot" d="M683 390 H830"></path>
            <path class="cold" d="M830 465 H545"></path>
            <polygon class="arrow-hot" points="744,383 758,390 744,397"></polygon>
            <polygon class="arrow-cold" points="690,458 676,465 690,472"></polygon>

            <!-- DHW tank -->
            <g>
              <rect x="830" y="310" width="200" height="70" fill="var(--bc-hot)" opacity=".78" clip-path="url(#dhw-tank-clip)"></rect>
              <rect x="830" y="380" width="200" height="63" fill="var(--bc-hot)" opacity=".55" clip-path="url(#dhw-tank-clip)"></rect>
              <rect x="830" y="443" width="200" height="57" fill="var(--bc-cold)" opacity=".68" clip-path="url(#dhw-tank-clip)"></rect>
              <path d="M830 330 C830 306 875 292 930 292 C985 292 1030 306 1030 330 V466 C1030 486 986 500 930 500 C874 500 830 486 830 466 Z" fill="none" stroke="var(--bc-metal)" stroke-width="8"></path>
              <path d="M830 379 H1030 M830 442 H1030" stroke="var(--bc-metal-dark)" stroke-width="4"></path>
              <path d="M860 497 l-11 20 h30 l7-17 M1000 497 l11 20 h-30 l-7-17" stroke="var(--bc-metal)" stroke-width="6" fill="none"></path>

              <!-- Boiler heat-exchanger coil, placed in the lower half of the tank -->
              <path class="primary-coil" d="M830 390 H960 C1000 390 1000 405 960 405 H880 C840 405 840 420 880 420 H960 C1000 420 1000 435 960 435 H880 C840 435 840 450 880 450 H960 C1000 450 1000 465 960 465 H830"></path>
            </g>

            <!-- Electric immersion heater: state-coloured box + horizontal element -->
            <g id="obj-electric-heater" class="heater-disabled" data-entity-key="electric_heater_state" tabindex="0">
              <rect class="heater-box" x="772" y="314" width="48" height="48" rx="6"></rect>
              <path class="heater-bolt" d="M793 320 H805 L799 333 H808 L792 356 L797 340 H788 Z"></path>
              <path class="heater-tube" d="M820 338 H918"></path>
            </g>

            <!-- DHW temperatures: top / middle + target / bottom -->
            <g data-entity-key="dhw_top_temp" tabindex="0" transform="translate(1052 300)">
              <text id="label-top" class="small-label" x="0" y="8">Haut</text>
              <rect class="pill-bg" x="0" y="16" width="135" height="37" rx="7"></rect>
              <path class="pill-icon" d="M12 23h7v14a6 6 0 1 1-7 0V23zm3 3v14l-2 1a3 3 0 1 0 4 0l-2-1V26z"></path>
              <text id="txt-dhw-top" class="value-small" x="39" y="41">—</text>
            </g>

            <g data-entity-key="dhw_middle_temp" tabindex="0" transform="translate(1052 374)">
              <text id="label-middle" class="small-label" x="0" y="8">Milieu</text>
              <rect class="pill-bg" x="0" y="16" width="135" height="52" rx="7"></rect>
              <path class="pill-icon" d="M12 23h7v14a6 6 0 1 1-7 0V23zm3 3v14l-2 1a3 3 0 1 0 4 0l-2-1V26z"></path>
              <text id="txt-dhw-middle" class="value-small" x="39" y="39">—</text>
              <text id="txt-dhw-target" class="target" x="39" y="57">—</text>
            </g>

            <g data-entity-key="dhw_bottom_temp" tabindex="0" transform="translate(1052 454)">
              <text id="label-bottom" class="small-label" x="0" y="8">Bas</text>
              <rect class="pill-bg" x="0" y="16" width="135" height="37" rx="7"></rect>
              <path class="pill-icon" d="M12 23h7v14a6 6 0 1 1-7 0V23zm3 3v14l-2 1a3 3 0 1 0 4 0l-2-1V26z"></path>
              <text id="txt-dhw-bottom" class="value-small" x="39" y="41">—</text>
            </g>
          </svg>
        </div>
      </ha-card>
    `;
    this._bindClicks();
  }
}

if (!customElements.get("lovelace-boiler-card")) {
  customElements.define("lovelace-boiler-card", LovelaceBoilerCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "lovelace-boiler-card")) {
  window.customCards.push({
    type: "lovelace-boiler-card",
    name: "Lovelace Boiler Card",
    preview: true,
    description: `Oil boiler + radiator circuit + DHW tank in one SVG card. v${BOILER_CARD_VERSION}`,
  });
}

console.info(`%c LOVELACE-BOILER-CARD %c v${BOILER_CARD_VERSION} `, "color:white;background:#c86464;font-weight:700", "color:#c86464;background:transparent");
