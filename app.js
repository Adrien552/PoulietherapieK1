const svg = document.getElementById("forceViz");

const controls = {
  force: document.getElementById("forceRange"),
  angle: document.getElementById("angleRange"),
  lever: document.getElementById("leverRange"),
  mode: document.getElementById("modeSelect"),
  manualDirection: document.getElementById("manualDirectionSelect"),
  suspension: document.getElementById("suspensionRange"),
};

const outputs = {
  forceValue: document.getElementById("forceValue"),
  angleValue: document.getElementById("angleValue"),
  leverValue: document.getElementById("leverValue"),
  metricForce: document.getElementById("metricForce"),
  metricPerp: document.getElementById("metricPerp"),
  metricParallel: document.getElementById("metricParallel"),
  metricTorque: document.getElementById("metricTorque"),
  insightDecomposition: document.getElementById("insightDecomposition"),
  insightLever: document.getElementById("insightLever"),
  insightClinical: document.getElementById("insightClinical"),
  suspensionValue: document.getElementById("suspensionValue"),
};

const modeSections = document.querySelectorAll(".mode-only");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const round = (value, decimals = 1) => Number(value).toFixed(decimals);

const cageBounds = {
  left: 160,
  right: 620,
  top: 54,
  bottom: 315,
};

function anchorFromSlider(value) {
  const t = clamp(value / 100, 0, 1);
  const leftHeight = cageBounds.bottom - cageBounds.top;
  const topWidth = cageBounds.right - cageBounds.left;
  const rightHeight = cageBounds.bottom - cageBounds.top;
  const totalLength = leftHeight + topWidth + rightHeight;
  const distance = t * totalLength;

  if (distance <= leftHeight) {
    const ratio = distance / leftHeight;
    return {
      x: cageBounds.left,
      y: cageBounds.bottom - ratio * leftHeight,
      zone: "Montant proximal",
    };
  }

  if (distance <= leftHeight + topWidth) {
    const ratio = (distance - leftHeight) / topWidth;
    return {
      x: cageBounds.left + ratio * topWidth,
      y: cageBounds.top,
      zone: "Traverse haute",
    };
  }

  const ratio = (distance - leftHeight - topWidth) / rightHeight;
  return {
    x: cageBounds.right,
    y: cageBounds.top + ratio * rightHeight,
    zone: "Montant distal",
  };
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy - radius * Math.sin(angleRad),
  };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function labelBox(x, y, text, options = {}) {
  const paddingX = options.paddingX ?? 12;
  const width = options.width ?? Math.max(48, text.length * 7.1 + paddingX * 2);
  const height = options.height ?? 28;
  const fill = options.fill ?? "rgba(255,250,241,0.94)";
  const stroke = options.stroke ?? "rgba(30,35,48,0.12)";
  const textColor = options.textColor ?? "#1e2330";
  const fontSize = options.fontSize ?? 14;
  const radius = options.radius ?? 12;
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}"></rect>
    <text x="${x + paddingX}" y="${y + height / 2 + fontSize / 3 - 1}" font-size="${fontSize}" fill="${textColor}" font-family="Source Sans 3" font-weight="700">${text}</text>
  `;
}

function stateFromControls() {
  const force = Number(controls.force.value);
  const lever = Number(controls.lever.value);
  const mode = controls.mode.value;
  const manualDirection = controls.manualDirection.value;
  const suspension = Number(controls.suspension.value);

  let angle = Number(controls.angle.value);
  let appliedAngle = angle;

  const handPositionRatio = clamp(lever / 0.6, 0, 1);
  const handX = 180 + handPositionRatio * 300;
  const handY = 250;

  if (mode === "manual") {
    appliedAngle = manualDirection === "push" ? angle : (angle + 180) % 360;
  }

  if (mode === "pulley") {
    const anchor = anchorFromSlider(suspension);
    const dx = anchor.x - handX;
    const dy = handY - anchor.y;
    appliedAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (appliedAngle < 0) {
      appliedAngle += 360;
    }
    angle = Math.round(appliedAngle);
  }

  const normalizedAngle = ((appliedAngle % 360) + 360) % 360;
  const angleRad = (normalizedAngle * Math.PI) / 180;

  const perpendicular = force * Math.sin(angleRad);
  const parallel = force * Math.cos(angleRad);
  const torque = force * lever * Math.sin(angleRad);

  return {
    force,
    angle,
    lever,
    mode,
    manualDirection,
    suspension,
    appliedAngle: normalizedAngle,
    handX,
    handY,
    perpendicular,
    parallel,
    torque,
  };
}

function renderText(state) {
  const { force, angle, lever, mode, manualDirection, suspension, perpendicular, parallel, torque } = state;
  const absParallel = Math.abs(parallel);
  const parallelNature = parallel >= 0 ? "coaptation/compression" : "distraction";
  const vectorMeaning = manualDirection === "push"
    ? "le vecteur est orienté vers le segment"
    : "le vecteur est inversé et orienté à l’écart du segment";
  const suspensionLabel = anchorFromSlider(suspension).zone.toLowerCase();

  outputs.forceValue.textContent = `${force}`;
  outputs.angleValue.textContent = `${angle}`;
  outputs.leverValue.textContent = `${round(lever, 2)}`;
  outputs.metricForce.textContent = `${round(force, 0)} N`;
  outputs.metricPerp.textContent = `${round(Math.abs(perpendicular), 1)} N`;
  outputs.metricParallel.textContent = `${round(absParallel, 1)} N`;
  outputs.metricTorque.textContent = `${round(Math.abs(torque), 1)} N·m`;
  if (outputs.suspensionValue) {
    outputs.suspensionValue.textContent = anchorFromSlider(suspension).zone;
  }

  outputs.insightDecomposition.textContent =
    `À ${angle}°, Cr vaut ${round(Math.abs(perpendicular), 1)} N et Cl vaut ${round(absParallel, 1)} N. Plus l’angle se rapproche de 90°, plus la force devient rotatoire et utile pour faire tourner le segment.`;

  outputs.insightLever.textContent =
    `Avec un bras de levier de ${round(lever, 2)} m, le couple estimé atteint ${round(Math.abs(torque), 1)} N·m. Si la main s’éloigne de l’articulation, l’effort demandé au patient augmente nettement pour une même force appliquée.`;

  outputs.insightClinical.textContent =
    mode === "pulley"
      ? `En pouliethérapie, une ${suspensionLabel} oriente la traction à ${angle}°. La traction est ${angle < 70 || angle > 110 ? "moins favorable" : "très favorable"} à la rotation, tandis que Cl atteint ${round(absParallel, 1)} N et peut majorer la ${parallelNature} selon la ligne de suspension.`
      : `En résistance manuelle, le kinésithérapeute ${manualDirection === "push" ? "pousse contre résistance" : "tire pour décoapter"} : ${vectorMeaning}. À ${angle}°, Cl atteint ${round(absParallel, 1)} N.`;

}

function renderSvg(state) {
  const { force, angle, lever, mode, manualDirection, suspension, appliedAngle, handX, handY, perpendicular, parallel } = state;
  const origin = { x: 180, y: 250 };
  const segmentLength = 300;
  const endX = origin.x + segmentLength;
  const endY = origin.y;

  const arrowLength = 70 + (force / 120) * 150;
  const forceEnd = polarToCartesian(handX, handY, arrowLength, appliedAngle);
  const forceStart = polarToCartesian(handX, handY, arrowLength, (appliedAngle + 180) % 360);
  const perpLength = Math.abs(perpendicular) / force * arrowLength || 0;
  const parallelLength = Math.abs(parallel) / force * arrowLength || 0;

  const perpDirection = perpendicular >= 0 ? -1 : 1;
  const perpEnd = { x: handX, y: handY + perpDirection * perpLength };
  const parallelDirection = parallel >= 0 ? 1 : -1;
  const parallelEnd = { x: handX + parallelDirection * parallelLength, y: handY };
  const showCr = Math.abs(perpendicular) > 0.05;
  const showCl = Math.abs(parallel) > 0.05;

  const cableAnchor = anchorFromSlider(suspension);
  const angleArc = describeArc(handX, handY, 48, 0, angle);
  const directionLabel = manualDirection === "push" ? "Poussée" : "Décoaptation";
  const manualForceLineStart = mode === "manual" ? { x: handX, y: handY } : null;
  const manualForceLineEnd = mode === "manual"
    ? forceEnd
    : null;
  const forearmBase = mode === "manual" ? { x: handX, y: handY } : null;
  const forearmEnd = mode === "manual"
    ? polarToCartesian(forearmBase.x, forearmBase.y, 86, (angle + 180) % 360)
    : null;
  const handMarker = mode === "manual" ? { x: handX, y: handY } : null;
  const totalMid = mode === "manual"
    ? { x: (manualForceLineStart.x + manualForceLineEnd.x) / 2, y: (manualForceLineStart.y + manualForceLineEnd.y) / 2 }
    : { x: (handX + forceEnd.x) / 2, y: (handY + forceEnd.y) / 2 };
  const clLabelX = parallelDirection > 0 ? Math.min(parallelEnd.x + 10, 610) : Math.max(parallelEnd.x - 74, 110);
  const clLabelY = handY + 16;
  const crLabelX = handX + 16;
  const crLabelY = perpDirection < 0 ? perpEnd.y - 34 : perpEnd.y + 8;
  const totalLabelX = Math.min(Math.max(totalMid.x - 44, 110), 570);
  const totalLabelY = totalMid.y - 34;
  const angleLabelX = handX + 42;
  const angleLabelY = handY - 44;
  const handLabelX = handMarker ? Math.min(handMarker.x + 18, 585) : 0;
  const handLabelY = handMarker ? handMarker.y + 26 : 0;
  const forearmLabelX = forearmEnd ? Math.min(Math.max(forearmEnd.x - 26, 110), 585) : 0;
  const forearmLabelY = forearmEnd ? forearmEnd.y - 34 : 0;

  svg.innerHTML = `
    <defs>
      <marker id="arrow-orange" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M 0 0 L 9 4.5 L 0 9 z" fill="rgba(216,97,60,0.72)"></path>
      </marker>
      <marker id="arrow-blue" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M 0 0 L 9 4.5 L 0 9 z" fill="rgba(47,95,218,0.72)"></path>
      </marker>
      <marker id="arrow-green" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M 0 0 L 9 4.5 L 0 9 z" fill="rgba(46,125,98,0.72)"></path>
      </marker>
    </defs>

    <rect x="0" y="0" width="720" height="420" fill="transparent"></rect>
    <circle cx="${origin.x}" cy="${origin.y}" r="24" fill="#1e2330"></circle>
    <text x="${origin.x - 48}" y="${origin.y + 58}" font-size="16" fill="#1e2330" font-family="Source Sans 3">Articulation</text>

    <line x1="${origin.x}" y1="${origin.y}" x2="${endX}" y2="${endY}" stroke="#1e2330" stroke-width="14" stroke-linecap="round"></line>
    <circle cx="${handX}" cy="${handY}" r="13" fill="#fffaf1" stroke="#d8613c" stroke-width="4"></circle>

    <line x1="${mode === "manual" ? manualForceLineStart.x : handX}" y1="${mode === "manual" ? manualForceLineStart.y : handY}" x2="${mode === "manual" ? manualForceLineEnd.x : forceEnd.x}" y2="${mode === "manual" ? manualForceLineEnd.y : forceEnd.y}" stroke="#d8613c" stroke-width="7" marker-end="url(#arrow-orange)"></line>
    ${labelBox(totalLabelX, totalLabelY, "Force totale", { width: 96, fill: "rgba(216,97,60,0.12)", stroke: "rgba(216,97,60,0.22)", textColor: "#b34f2f" })}

    ${showCl ? `<line x1="${handX}" y1="${handY}" x2="${parallelEnd.x}" y2="${parallelEnd.y}" stroke="#2f5fda" stroke-width="6" stroke-dasharray="10 8" marker-end="url(#arrow-blue)"></line>` : ""}
    ${showCl ? labelBox(clLabelX, clLabelY, "Cl", { width: 42, height: 26, fill: "rgba(47,95,218,0.12)", stroke: "rgba(47,95,218,0.24)", textColor: "#244db1" }) : ""}

    ${showCr ? `<line x1="${handX}" y1="${handY}" x2="${perpEnd.x}" y2="${perpEnd.y}" stroke="#2e7d62" stroke-width="6" stroke-dasharray="10 8" marker-end="url(#arrow-green)"></line>` : ""}
    ${showCr ? labelBox(crLabelX, crLabelY, "Cr", { width: 42, height: 26, fill: "rgba(46,125,98,0.12)", stroke: "rgba(46,125,98,0.24)", textColor: "#22674f" }) : ""}

    ${mode === "pulley" ? `<path d="${angleArc}" fill="none" stroke="#1e2330" stroke-width="3"></path>` : ""}
    ${labelBox(angleLabelX, angleLabelY, `${angle}°`, { width: 56, height: 26 })}

    <line x1="${origin.x}" y1="${origin.y + 34}" x2="${handX}" y2="${handY + 34}" stroke="#5f6777" stroke-width="3"></line>
    <line x1="${origin.x}" y1="${origin.y + 26}" x2="${origin.x}" y2="${origin.y + 42}" stroke="#5f6777" stroke-width="3"></line>
    <line x1="${handX}" y1="${handY + 26}" x2="${handX}" y2="${handY + 42}" stroke="#5f6777" stroke-width="3"></line>
    <text x="${origin.x + (handX - origin.x) / 2 - 32}" y="${origin.y + 60}" font-size="16" fill="#5f6777" font-family="Source Sans 3">Bras de levier</text>

    ${
      mode === "pulley"
        ? `
          <line x1="${handX}" y1="${handY}" x2="${cableAnchor.x}" y2="${cableAnchor.y}" stroke="#d8613c" stroke-width="3" stroke-dasharray="10 6"></line>
          <circle cx="${cableAnchor.x}" cy="${cableAnchor.y}" r="24" fill="#fffaf1" stroke="#1e2330" stroke-width="4"></circle>
          <circle cx="${cableAnchor.x}" cy="${cableAnchor.y}" r="8" fill="#1e2330"></circle>
          ${labelBox(Math.min(Math.max(cableAnchor.x - 44, 110), 560), cableAnchor.y - 44, "Poulie + poids", { width: 98 })}
          <line x1="${cageBounds.left}" y1="${cageBounds.top}" x2="${cageBounds.right}" y2="${cageBounds.top}" stroke="#5f6777" stroke-width="4"></line>
          <line x1="${cageBounds.left}" y1="${cageBounds.top}" x2="${cageBounds.left}" y2="${cageBounds.bottom}" stroke="#5f6777" stroke-width="4"></line>
          <line x1="${cageBounds.right}" y1="${cageBounds.top}" x2="${cageBounds.right}" y2="${cageBounds.bottom}" stroke="#5f6777" stroke-width="4"></line>
          <text x="474" y="338" font-size="15" fill="#5f6777" font-family="Source Sans 3">Cage de pouliethérapie</text>
        `
        : `
          <circle cx="${handMarker.x}" cy="${handMarker.y}" r="16" fill="#fffaf1" stroke="#1e2330" stroke-width="4"></circle>
          <line x1="${forearmBase.x}" y1="${forearmBase.y}" x2="${forearmEnd.x}" y2="${forearmEnd.y}" stroke="#1e2330" stroke-width="5" stroke-linecap="round"></line>
          ${labelBox(handLabelX, handLabelY, "Main du kiné", { width: 96 })}
          ${labelBox(forearmLabelX, forearmLabelY, "Avant-bras", { width: 84 })}
          ${labelBox(Math.min(handMarker.x + 20, 575), handMarker.y - 16, directionLabel, { width: 92, fill: "rgba(30,35,48,0.06)", stroke: "rgba(30,35,48,0.12)", textColor: "#5f6777" })}
        `
    }

    <rect x="496" y="36" width="182" height="104" rx="18" fill="rgba(255,250,241,0.92)" stroke="rgba(30,35,48,0.08)"></rect>
    <text x="516" y="66" font-size="15" fill="#5f6777" font-family="Source Sans 3">Lecture</text>
    <text x="516" y="92" font-size="18" fill="#1e2330" font-family="Space Grotesk">Cr ${Math.abs(perpendicular).toFixed(1)} N</text>
    <text x="516" y="118" font-size="18" fill="#1e2330" font-family="Space Grotesk">Cl ${Math.abs(parallel).toFixed(1)} N</text>
  `;
}

function updateModeVisibility(mode) {
  modeSections.forEach((section) => {
    section.hidden = section.dataset.mode !== mode;
  });
  controls.angle.disabled = mode === "pulley";
}

function render() {
  const state = stateFromControls();
  updateModeVisibility(state.mode);
  renderText(state);
  renderSvg(state);
}

Object.values(controls).forEach((control) => {
  control.addEventListener("input", render);
  control.addEventListener("change", render);
});

render();
