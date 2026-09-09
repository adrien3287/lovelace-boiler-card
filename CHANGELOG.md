# Changelog

## 0.3.0
- Reworked boiler visuals and flue chimney.
- Boiler outline turns green in `Veille`.
- Removed lower-left boiler square.
- Return temperature card now matches the flow-temperature card size.
- Enlarged house and room-temperature area.
- Corrected oil-level gauge icon and centered immersion-heater lightning symbol.
- Added deliberate pipe gaps where red and blue circuits cross.

## 0.2.0

- Removed the large section titles from the SVG (`Fioul`, `Chaudière`, `Circuit chauffage`, `Eau chaude`).
- Repositioned the burner flame inside the boiler combustion chamber.
- Added native mappings for `input_select.statut_chaudiere`: `Arrêt`, `Veille`, `Préchauffage`, `Démarrage`, `Brûleur actif`.
- Widened the house roof.
- Reworked the DHW tank: the boiler heat-exchanger coil is now in the lower half of the tank and connected to the DHW primary flow/return pipes.
- Replaced the electric-heater coil drawing with a horizontal immersion element entering from the left, connected to a lightning-symbol control box.
- Added native mappings for the electric-heater selector: `Arrêt` = grey, `Veille` = green, `Chauffe` = red.
- Added optional boiler-return temperature. Its badge is completely hidden unless an entity is configured.
- Added a flue/chimney and optional flue-gas temperature. Its badge is completely hidden unless an entity is configured.

## 0.1.0

- Initial `lovelace-boiler-card` release.
- One inline SVG for oil tank, oil boiler, radiator loop and DHW loop.
- Four-state burner flame: grey / yellow / orange / red.
- Three-state electric immersion heater: grey / green / red.
- DHW top / middle / bottom temperatures and middle setpoint.
- Native Home Assistant graphical configuration form.
- More-info on click/tap.
