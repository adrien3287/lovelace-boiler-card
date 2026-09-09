# Changelog

## 0.4.2
- Raised the main roof line so it sits higher above the installation.
- Restored the DHW top / middle / bottom temperature badges closer to the 0.3.2 layout.
- Lowered the DHW hot branch and pump so the red line aligns with the red heat-exchanger entry.
- Updated cache-busting guidance to `?v=0.4.2`.

## 0.4.1
- Bumped the version to force a clean update cycle.
- Added explicit cache-busting guidance in the README (`?v=0.4.1`).
- Slightly adjusted the room, outside and flow badges so a refreshed install is visibly different from 0.4.0.

## 0.4.0
- Reworked the global roof/house outline to match the desired large-cover composition.
- Moved the room-temperature badge under the roof peak and moved the outside-temperature badge to the far right.
- Repositioned the heating-flow badge and DHW temperature badges to better match the target layout.

## 0.3.2
- Moved and widened the house roof so the temperature frames are no longer visually cut.
- Repositioned the room and outside temperature badges for better clearance.
- Aligned the DHW supply pipe to the tank as a straight horizontal run.

## 0.3.1
- Simplified the hot/cold pipe routing in the SVG for a cleaner layout.
- Increased separation between supply and return manifolds to avoid visual clashes.
- Repositioned flue-gas and DHW temperature texts so labels do not touch nearby lines or shapes.
- Slightly adjusted the room-temperature and boiler-status placements for better spacing.

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
