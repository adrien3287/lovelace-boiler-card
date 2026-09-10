# Lovelace Boiler Card

**Current version: 0.6.15**

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
/hacsfiles/lovelace-boiler-card/lovelace-boiler-card-v0.6.15.js
```

If your browser or Home Assistant keeps an older JavaScript file in cache, force a reload.

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

## v0.6.15 empty-tank build

Starts from the exact v0.6.9 runtime. Dynamic fuel rendering is disabled, and a pixel-accurate transparent erase overlay removes the fuel pixels baked into the v0.6.9 baseline. The tank and suction tube geometry are unchanged.
