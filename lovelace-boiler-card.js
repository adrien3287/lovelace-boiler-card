/*
 * Lovelace Boiler Card
 * Single-SVG Home Assistant dashboard card for an oil boiler, one radiator loop,
 * and one domestic-hot-water loop with an optional electric immersion heater.
 *
 * Repository name: lovelace-boiler-card
 * Card type: custom:lovelace-boiler-card
 */

const BOILER_CARD_VERSION = "0.5.2";

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
    const tankY = 286;
    const tankH = 242;
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
          --bc-hot: #ff263e;
          --bc-cold: #2498e8;
          --bc-pipe-neutral: #8b8b8b;
          --bc-oil: #ffc000;
          --bc-metal: #777;
          --bc-metal-dark: #4f4f4f;
          --bc-metal-light: #bdbdbd;
          --bc-text: var(--primary-text-color, #e8e8e8);
          --bc-muted: var(--secondary-text-color, #a9a9a9);
          --bc-pill-bg: var(--card-background-color, #202020);
          --bc-pill-border: #a0a0a0;
          --bc-pump-on: #87ad27;
          --bc-pump-off: #d7d7d7;
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

        .hot { stroke: var(--bc-hot); fill: none; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }
        .cold { stroke: var(--bc-cold); fill: none; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }
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
          <svg viewBox="0 0 1200 600" role="img" aria-label="Oil boiler installation" preserveAspectRatio="xMidYMid meet">
            <defs>
              <clipPath id="oil-tank-clip">
                <rect x="42" y="286" width="176" height="242" rx="42" ry="42"></rect>
              </clipPath>
              <clipPath id="dhw-tank-clip">
                <path d="M835 382 C835 362 876 350 927 350 C978 350 1019 362 1019 382 V500 C1019 521 978 534 927 534 C876 534 835 521 835 500 Z"></path>
              </clipPath>
              <linearGradient id="dhw-fill-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#d24f58"></stop>
                <stop offset="62%" stop-color="#a94755"></stop>
                <stop offset="76%" stop-color="#6d5470"></stop>
                <stop offset="100%" stop-color="#2585c8"></stop>
              </linearGradient>
              <linearGradient id="coil-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#ff6d76"></stop>
                <stop offset="58%" stop-color="#da78b1"></stop>
                <stop offset="100%" stop-color="#74a7ee"></stop>
              </linearGradient>
            </defs>

            <path d="M282 234 L742 18 L1172 232 L1190 224 L1190 248 L1170 238 V566" fill="none" stroke="#eeeeee" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>

            <g data-entity-key="oil_level" tabindex="0">
              <rect id="oil-fill" x="42" y="286" width="176" height="0" fill="#d79b18" opacity=".90" clip-path="url(#oil-tank-clip)"></rect>
              <rect x="38" y="278" width="184" height="256" rx="46" ry="46" fill="none" stroke="#a6a6a6" stroke-width="8"></rect>
              <path d="M38 349 H222 M38 452 H222" stroke="#b37e19" stroke-width="5" opacity=".9"></path>
              <rect x="105" y="258" width="49" height="20" rx="4" fill="#858585"></rect>
              <path d="M72 534 l-12 25 h31 l10-25 M188 534 l12 25 h-31 l-10-25" fill="none" stroke="#a6a6a6" stroke-width="7"></path>
              <path d="M128 264 V518 M128 264 H206 Q220 264 220 278 V410 H302" fill="none" stroke="#ffc000" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
              <path d="M120 518 H136" stroke="#ffc000" stroke-width="6" stroke-linecap="round"></path>
            </g>

            <g id="obj-boiler-body" class="boiler-normal" data-entity-key="boiler_temp" tabindex="0">
              <rect class="boiler-outline" x="305" y="308" width="180" height="226" rx="5" stroke-width="7"></rect>
              <line class="boiler-outline" x1="305" y1="438" x2="485" y2="438" stroke-width="6"></line>
              <path class="boiler-outline" d="M321 534 l-9 25 h28 l7-25 M469 534 l9 25 h-28 l-7-25" stroke-width="6"></path>
            </g>

            <g aria-label="Flue chimney">
              <rect x="382" y="82" width="26" height="226" fill="#777777" stroke="#a9a9a9" stroke-width="4"></rect>
              <rect x="374" y="70" width="42" height="13" rx="2" fill="#c9c9c9"></rect>
              <rect x="377" y="298" width="36" height="11" fill="#666666"></rect>
              <path d="M388 61 C379 49 393 42 385 31 M401 61 C392 49 406 42 398 31" stroke="#bfbfbf" stroke-width="4" fill="none" stroke-linecap="round"></path>
            </g>

            <g id="obj-flame" class="flame-burning" data-entity-key="burner_state" tabindex="0" transform="translate(392 392) scale(1.35)">
              <path class="flame-shape" d="M-18 10 C-27 -7 -17 -17 -14 -29 C-6 -18 -3 -10 -3 -4 C3 -10 7 -20 4 -31 C17 -20 24 -6 17 9 C12 19 4 26 -6 26 C-16 26 -22 20 -25 13 C-28 6 -26 1 -23 -5 C-22 2 -21 7 -18 10 Z M-7 20 C-13 12 -11 5 -5 -3 C-5 4 -1 7 1 11 C4 7 7 3 6 -4 C12 3 13 11 9 17 C6 22 1 25 -5 25 C-6 25 -7 23 -7 20 Z"></path>
            </g>

            <path class="hot" d="M485 334 H560 V278 H1018" fill="none"></path>
            <path class="cold" d="M1018 326 H595 V362 H485" fill="none"></path>
            <polygon class="arrow-hot" points="582,271 596,278 582,285"></polygon>
            <polygon class="arrow-hot" points="822,271 836,278 822,285"></polygon>
            <polygon class="arrow-cold" points="832,319 818,326 832,333"></polygon>
            <polygon class="arrow-cold" points="605,355 591,362 605,369"></polygon>

            <g id="obj-heating-pump" class="pump-off" data-entity-key="heating_pump" tabindex="0" transform="translate(690 278)">
              <rect class="pump-shape" x="-28" y="-4" width="15" height="8" rx="1"></rect>
              <rect class="pump-shape" x="13" y="-4" width="15" height="8" rx="1"></rect>
              <circle cx="0" cy="0" r="19" fill="var(--bc-pill-bg)" stroke="currentColor" stroke-width="6"></circle>
              <circle class="pump-shape" cx="0" cy="0" r="7"></circle>
              <path class="pump-shape" d="M-4-11h8l5 7-4 2-5-5-5 5-4-2z"></path>
              <rect x="-13" y="-26" width="26" height="5" rx="1" fill="currentColor"></rect>
              <rect x="-13" y="21" width="26" height="5" rx="1" fill="currentColor"></rect>
            </g>

            <g fill="#a9a9a9">
              <rect x="1022" y="250" width="14" height="87" rx="7"></rect>
              <rect x="1040" y="250" width="14" height="87" rx="7"></rect>
              <rect x="1058" y="250" width="14" height="87" rx="7"></rect>
              <rect x="1076" y="250" width="14" height="87" rx="7"></rect>
              <rect x="1094" y="250" width="14" height="87" rx="7"></rect>
              <path d="M1036 237 C1026 226 1039 220 1032 209 M1055 237 C1045 226 1058 220 1051 209 M1074 237 C1064 226 1077 220 1070 209" stroke="#d0d0d0" stroke-width="4" fill="none" stroke-linecap="round"></path>
            </g>

            <path class="hot" d="M485 454 H835" fill="none"></path>
            <path class="cold" d="M835 522 H535 Q525 522 525 512 V492 Q525 482 515 482 H485" fill="none"></path>
            <polygon class="arrow-hot" points="577,447 591,454 577,461"></polygon>
            <polygon class="arrow-hot" points="777,447 791,454 777,461"></polygon>
            <polygon class="arrow-cold" points="756,515 742,522 756,529"></polygon>
            <polygon class="arrow-cold" points="580,515 566,522 580,529"></polygon>

            <g id="obj-dhw-pump" class="pump-off" data-entity-key="dhw_pump" tabindex="0" transform="translate(690 454)">
              <rect class="pump-shape" x="-28" y="-4" width="15" height="8" rx="1"></rect>
              <rect class="pump-shape" x="13" y="-4" width="15" height="8" rx="1"></rect>
              <circle cx="0" cy="0" r="19" fill="var(--bc-pill-bg)" stroke="currentColor" stroke-width="6"></circle>
              <circle class="pump-shape" cx="0" cy="0" r="7"></circle>
              <path class="pump-shape" d="M-4-11h8l5 7-4 2-5-5-5 5-4-2z"></path>
              <rect x="-13" y="-26" width="26" height="5" rx="1" fill="currentColor"></rect>
              <rect x="-13" y="21" width="26" height="5" rx="1" fill="currentColor"></rect>
            </g>

            <g>
              <rect x="835" y="350" width="184" height="184" fill="url(#dhw-fill-gradient)" clip-path="url(#dhw-tank-clip)"></rect>
              <path d="M835 382 C835 362 876 350 927 350 C978 350 1019 362 1019 382 V500 C1019 521 978 534 927 534 C876 534 835 521 835 500 Z" fill="none" stroke="#a6a6a6" stroke-width="8"></path>
                            <path d="M864 532 l-9 27 h27 l8-25 M990 532 l9 27 h-27 l-8-25" stroke="#a6a6a6" stroke-width="6" fill="none"></path>
              <path d="M835 454 H950 C991 454 991 468 950 468 H886 C850 468 850 482 886 482 H950 C991 482 991 496 950 496 H886 C850 496 850 510 886 510 H950 C991 510 991 522 950 522 H835" fill="none" stroke="url(#coil-gradient)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>

            <g id="obj-electric-heater" class="heater-disabled" data-entity-key="electric_heater_state" tabindex="0">
              <rect class="heater-box" x="790" y="381" width="42" height="42" rx="5"></rect>
              <path class="heater-bolt" d="M808 385 H818 L813 397 H821 L807 417 L811 403 H803 Z"></path>
              <path class="heater-tube" d="M832 402 H912"></path>
            </g>

            <path d="M26 569 H1172" stroke="#5c5c5c" stroke-width="3" opacity=".65"></path>
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
