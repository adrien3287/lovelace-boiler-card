# Lovelace Boiler Card

**Current version: 0.6.3**

A single-SVG Home Assistant Lovelace card for an oil-fired boiler installation with one radiator circuit and one parallel domestic-hot-water circuit.

## Features

- heating-oil tank with live fill level and optional volume,
- oil boiler temperature,
- colour-coded burner flame located inside the boiler,
- flue/chimney with optional flue-gas temperature,
- optional boiler-return temperature,
- one radiator circuit with pump, outside temperature, room temperature, actual flow temperature and red setpoint,
- one parallel DHW primary circuit with pump and a heat-exchanger coil in the lower half of the tank,
- DHW temperatures at top / middle / bottom plus a red DHW setpoint at the middle sensor,
- electric immersion heater represented by a horizontal element entering the tank from the left,
- electric-heater state shown by colour: grey / green / red,
- click/tap on a sensor or device opens Home Assistant **More info**.

The SVG is inline in `lovelace-boiler-card.js`; there is no runtime SVG dependency.

## Installation with HACS

Create a GitHub repository named exactly **`lovelace-boiler-card`** and place the contents of this package in the repository root.

In HACS:

1. Open HACS.
2. Open **Custom repositories**.
3. Add the GitHub repository URL.
4. Select **Dashboard** as repository type.
5. Install **Lovelace Boiler Card**.

The resource is normally:

```text
/hacsfiles/lovelace-boiler-card/lovelace-boiler-card.js?v=0.6.3
```

If your browser or Home Assistant keeps an older JavaScript file in cache, force a reload or temporarily add the version query string shown above.

If HACS does not add it automatically, add that URL under **Settings → Dashboards → Resources** as a JavaScript module.

## Card type

```yaml
type: custom:lovelace-boiler-card
```

## Example configuration

```yaml
type: custom:lovelace-boiler-card

oil_level: sensor.pourcent_fioul
oil_volume: sensor.niveau_fioul

boiler_temp: sensor.mosquitto_mqtt_broker_kessel_ist_temperatur
burner_state: input_select.statut_chaudiere

# Optional: these elements are completely hidden when no entity is configured.
# boiler_return_temp: sensor.temperature_retour_chaudiere
flue_gas_temp: sensor.froeling_abgastemperatur

heating_pump: binary_sensor.mosquitto_mqtt_broker_pompe_chauffage
outside_temp: sensor.mosquitto_mqtt_broker_aussentemperatur
room_temp: sensor.h5100_604c_temperature
heating_flow_temp: sensor.mosquitto_mqtt_broker_kessel_ist_temperatur
heating_target_temp: sensor.mosquitto_mqtt_broker_kessel_soll_temperatur

dhw_pump: binary_sensor.mosquitto_mqtt_broker_pompe_eau_chaude
dhw_top_temp: sensor.mosquitto_mqtt_broker_warmwasser_ist_temperatur
# dhw_middle_temp: sensor.temperature_ecs_milieu
# dhw_bottom_temp: sensor.temperature_ecs_bas
# dhw_target_temp: sensor.consigne_ecs

electric_heater_state: input_select.statut_resistance
```

## Boiler-state selector

The default v0.3.0 mapping is designed for:

```text
Arrêt
Veille
Démarrage
Brûleur actif
Préchauffage
```

| `input_select.statut_chaudiere` | Flame |
|---|---|
| `Arrêt` | grey |
| `Veille` | grey |
| `Préchauffage` | yellow |
| `Démarrage` | orange |
| `Brûleur actif` | red |

The mapping can still be overridden:

```yaml
burner_off_states: "Arrêt, Veille"
burner_preheat_states: "Préchauffage"
burner_ignition_states: "Démarrage"
burner_burning_states: "Brûleur actif"
```

Comparisons are case-insensitive and accent-insensitive.

## Electric-heater selector

Recommended helper:

```text
Arrêt
Veille
Chauffe
```

| Electric-heater state | Drawing |
|---|---|
| `Arrêt` | grey |
| `Veille` | green |
| `Chauffe` | red |

The mapping can be overridden:

```yaml
heater_disabled_states: "Arrêt"
heater_enabled_states: "Veille"
heater_heating_states: "Chauffe"
```

## Optional temperature entities

These two elements do not display a `—` placeholder when absent; they disappear entirely from the SVG:

```yaml
boiler_return_temp: sensor.temperature_retour_chaudiere
flue_gas_temp: sensor.temperature_fumees
```

`boiler_return_temp` is shown at the bottom of the boiler. `flue_gas_temp` is shown beside the chimney.

## Development / releases

No build step is required. For a release:

1. update `BOILER_CARD_VERSION` in `lovelace-boiler-card.js`,
2. update `CHANGELOG.md`,
3. commit and tag the release, for example `v0.3.0`,
4. create the corresponding GitHub release so HACS can expose the new version cleanly.

## Credits

The visual language and burner-flame path are adapted from the supplied `lovelace-froeling-card` project and its SVG/CSS customisations.


### Boiler standby colour
By default, `Veille` colours the boiler outline green. Override with `boiler_standby_states`.


## 0.5 visual baseline

Version 0.6.0 uses the approved no-text SVG layout as the visual baseline. Values and labels can now be reintroduced incrementally.


## Visual baseline

Version 0.6.0 uses the approved user drawing as the pixel-accurate baseline inside the SVG, so future iterations can add labels and dynamic overlays without changing the base geometry.


## Status colours (0.6.1)

The validated background geometry is unchanged. Only the status graphics are overlaid dynamically:

- Boiler status indicator: `Arrêt` = grey, `Veille` = green, `Préchauffage` = yellow, `Démarrage` = orange, `Brûleur actif`/`Marche` = red.
- Electric heater: `Arrêt` = grey, `Veille` = green, `Chauffe` = red.


## Dynamic overlays (0.6.2)

Added dynamic overlay boxes for:

- outside temperature above the roof on the right
- DHW tank temperatures on the right side: top, middle, bottom
- DHW target temperature in red under the middle temperature
- heating and DHW pump status shown directly on the two pump symbols (grey when off, green when on)


## Value overlay pass (0.6.3)

- Added visible value overlays directly on the approved drawing.
- No textual labels such as Haut / Milieu / Bas are shown.
- Temperature/value text is enlarged by roughly 50%.
- Temperature and setpoint boxes now use icon-based overlays.
