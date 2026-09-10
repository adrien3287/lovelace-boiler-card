# Changelog

## 0.6.3
- Added all main values directly onto the validated SVG drawing.
- Removed visible labels such as Haut, Milieu, Bas and Extérieur from overlay boxes.
- Increased displayed values by about 50 percent for readability.
- Added icon-based temperature/setpoint overlays for boiler, flue gas, room, outside, heating flow and DHW values.

## 0.6.2

- Added visible outside-temperature badge above the roof on the right.
- Added visible DHW tank badges on the right for top, middle and bottom temperatures.
- Added visible red DHW target temperature below the middle temperature.
- Added visible pump status rendering directly on both pump symbols: grey when off, green when on.
- Kept the validated background and dynamic boiler/resistance colour logic.

## 0.6.1
- Added dynamic boiler status colour overlay on the validated baseline: grey / green / yellow / orange / red.
- Added dynamic electric-heater colour overlay: grey / green / red.
- Preserved the approved base geometry pixel-for-pixel; only status pixels are recoloured.
- Default boiler mappings now match `Arrêt`, `Veille`, `Préchauffage`, `Démarrage`, and `Brûleur actif`/`Marche`.

## 0.6.0
- Rebuilt the base SVG from the approved drawing for near pixel-perfect visual fidelity.
- Updated the HACS package so the card now uses this approved baseline image inside the SVG.
- Kept transparent interaction areas and hidden placeholders so temperatures and labels can be added later without changing the base geometry.

## 0.5.2
- Adjusted the oil suction pipe to match the approved layout: centered dip tube inside the tank, external drop centered in the gap between tank and boiler, then horizontal run into the boiler.
- Removed the extra yellow junction dot so the fuel line matches the approved visual baseline.

## 0.5.0
- Replaced the card SVG with the approved no-text layout.
- Deep oil pickup tube and oil-tank geometry.
- Boiler, oil tank and DHW cylinder aligned on one floor line.
- Straight chimney centered above the boiler.
- Radiator pipes leave from the boiler side.
- Both pumps share the same vertical axis.
- DHW hot/return pipes align with the heat-exchanger coil inlet/outlet.
- Immersion heater retained at the upper-left of the cylinder.
- Updated hot/cold/oil palette.


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
