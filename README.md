# Lovelace Boiler Card

A single-SVG Home Assistant Lovelace card for an oil-fired boiler installation with:

- heating-oil tank with live fill level and optional volume,
- boiler temperature and colour-coded burner flame,
- one radiator circuit with pump, outside temperature, room temperature, actual flow temperature and red setpoint,
- one parallel domestic-hot-water circuit with pump,
- DHW temperatures at top / middle / bottom plus a red DHW setpoint at the middle sensor,
- electric immersion heater shown in grey / green / red,
- click/tap on a sensor or device to open Home Assistant **More info**.

The card contains the SVG inline, so HACS only needs to install one JavaScript file.

## Installation with HACS

Create a GitHub repository named **`lovelace-boiler-card`** and put the files from this package in the repository root.

Then in HACS:

1. Open HACS.
2. Open the three-dot menu → **Custom repositories**.
3. Add your repository URL.
4. Select **Dashboard** as the repository type.
5. Install **Lovelace Boiler Card**.

HACS installs dashboard elements below `www/community/`. The expected resource is normally:

```text
/hacsfiles/lovelace-boiler-card/lovelace-boiler-card.js
```

If HACS does not add the resource automatically, add it under **Settings → Dashboards → Resources** as a JavaScript module.

## Card type

```yaml
type: custom:lovelace-boiler-card
```

## Configuration for the current installation

This example already uses the entities supplied for the boiler and radiator circuit:

```yaml
type: custom:lovelace-boiler-card
# title: Chaufferie  # optional

oil_level: sensor.pourcent_fioul
oil_volume: sensor.niveau_fioul

boiler_temp: sensor.mosquitto_mqtt_broker_kessel_ist_temperatur
burner_state: input_select.test2

heating_pump: binary_sensor.mosquitto_mqtt_broker_pompe_chauffage
outside_temp: sensor.mosquitto_mqtt_broker_aussentemperatur
room_temp: sensor.h5100_604c_temperature
heating_flow_temp: sensor.mosquitto_mqtt_broker_kessel_ist_temperatur
heating_target_temp: sensor.mosquitto_mqtt_broker_kessel_soll_temperatur

dhw_pump: binary_sensor.mosquitto_mqtt_broker_pompe_eau_chaude
dhw_top_temp: sensor.mosquitto_mqtt_broker_warmwasser_ist_temperatur

# Add these when the three DHW sensors / setpoint exist:
dhw_middle_temp: sensor.REPLACE_ME_DHW_MIDDLE
dhw_bottom_temp: sensor.REPLACE_ME_DHW_BOTTOM
dhw_target_temp: sensor.REPLACE_ME_DHW_TARGET

# Optional 3-state entity for the electric resistance:
electric_heater_state: input_select.REPLACE_ME_ELECTRIC_HEATER

# State mappings are comma-separated and case-insensitive.
burner_preheat_states: "Vorheizen"
burner_ignition_states: "Zünden, Zuenden, Anheizen, Starten, Zündung, Zuendung"
burner_burning_states: "Heizen, SH Heizen, Feuererhaltung, Brennen"

heater_disabled_states: "off, aus, disabled, deaktiviert"
heater_enabled_states: "on, ein, enabled, bereit, ready"
heater_heating_states: "heating, heizen, active, aktiv, chauffe, heating_on"
```

Remove any `REPLACE_ME...` line until the corresponding entity exists. Missing optional sensors display `—`.

## Colour logic

### Burner flame

| Burner condition | Colour |
|---|---|
| stopped / unknown | grey |
| preheating | yellow |
| ignition | orange |
| oil burning | red |

The exact Home Assistant states can be changed with `burner_preheat_states`, `burner_ignition_states` and `burner_burning_states`.

### Electric immersion heater

| Heater condition | Colour |
|---|---|
| disabled / unknown | grey |
| enabled / ready | green |
| actively heating | red |

The exact states can be changed with `heater_disabled_states`, `heater_enabled_states` and `heater_heating_states`.

## Styling

The card follows Home Assistant's card background and text colours. The main process colours intentionally match the source Fröling-style cards:

- hot water: `#C86464`
- cold / return water: `#6E8CA0`
- active pump: `#87AD27`
- inactive pump: `#BBBBBB`

The SVG is inline in `lovelace-boiler-card.js`; no separate `.svg` file is required at runtime.

## Development

No build step is required. Edit `lovelace-boiler-card.js`, bump `BOILER_CARD_VERSION`, commit, and create a GitHub release if desired.

## Credits

The visual language and the flame path are adapted from the supplied `lovelace-froeling-card` project and its SVG/CSS customisations.
