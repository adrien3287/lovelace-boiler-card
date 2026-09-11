/*
 * Lovelace Boiler Card v0.8.2
 * Alignment/layering correction based on v0.8.1.
 * Front -> back: rectangular gauge, suction tube, grey tank outline, red tank body.
 */
import "./lovelace-boiler-card-v0.8.1.js";

const BoilerCardClassV082 = customElements.get("lovelace-boiler-card");
if (!BoilerCardClassV082) {
  throw new Error("lovelace-boiler-card: v0.8.1 base did not register the card");
}

const SVG_NS_V082 = "http://www.w3.org/2000/svg";
const TANK_D_V082 = "M66 462 V452 C66 423 91 401 123 401 H247 C279 401 304 423 304 454 V678 C304 713 279 739 247 739 H123 C91 739 66 713 66 680 Z";
const TUBE_D_V082 = "M190 401 V748 M179 748 H201";
const previousOilUpdateV082 = BoilerCardClassV082.prototype._updateOilFill;

function ensureV082TankLayers() {
  const group = this.shadowRoot?.getElementById("obj-oil-level");
  if (!group) return;

  // Keep v0.8.1's object present so its renderer does not recreate it,
  // but hide it completely. v0.8.2 draws the tank with an exact path instead.
  const oldStaticTank = group.querySelector("#oil-static-tank-v081");
  if (oldStaticTank) oldStaticTank.style.display = "none";

  let redBody = group.querySelector("#oil-static-tank-v082");
  if (!redBody) {
    redBody = document.createElementNS(SVG_NS_V082, "path");
    redBody.setAttribute("id", "oil-static-tank-v082");
    redBody.setAttribute("d", TANK_D_V082);
    redBody.setAttribute("fill", "#9d001f");
    redBody.setAttribute("stroke", "none");
    redBody.setAttribute("pointer-events", "none");
  }

  let greyOutline = group.querySelector("#oil-tank-outline-v082");
  if (!greyOutline) {
    greyOutline = document.createElementNS(SVG_NS_V082, "path");
    greyOutline.setAttribute("id", "oil-tank-outline-v082");
    greyOutline.setAttribute("d", TANK_D_V082);
    greyOutline.setAttribute("fill", "none");
    greyOutline.setAttribute("stroke", "var(--bc-metal-light, #bdbdbd)");
    greyOutline.setAttribute("stroke-width", "9");
    greyOutline.setAttribute("stroke-linejoin", "round");
    greyOutline.setAttribute("stroke-linecap", "round");
    greyOutline.setAttribute("pointer-events", "none");
  }

  const tube = Array.from(group.querySelectorAll("path")).find(
    (el) => el.getAttribute("d") === TUBE_D_V082
  );
  const gauge = group.querySelector("#oil-rect-gauge-v081");

  if (!tube || !gauge) return;

  // SVG painter order: later siblings are in front.
  // Requested back -> front order:
  // red body -> grey outline -> yellow suction tube -> rectangular gauge.
  if (group.dataset.v082Layered !== "1") {
    group.appendChild(redBody);
    group.appendChild(greyOutline);
    group.appendChild(tube);
    group.appendChild(gauge);
    group.dataset.v082Layered = "1";
  }
}

BoilerCardClassV082.prototype._updateOilFill = function () {
  // Keep the accepted v0.8.1 rectangular gauge calculation unchanged.
  previousOilUpdateV082.call(this);
  ensureV082TankLayers.call(this);
};

if (Array.isArray(window.customCards)) {
  const entry = window.customCards.find((card) => card.type === "lovelace-boiler-card");
  if (entry) {
    entry.description = "Oil boiler + radiator circuit + DHW tank. v0.8.2 aligned tank + rectangular oil gauge";
  }
}
