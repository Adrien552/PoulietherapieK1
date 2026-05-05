const svg = document.getElementById("forceViz");
const SHEETS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxT_Oa9xMQNjA8oj4_NjIugT3wQrA4bSvfDGLSnoaOsQwwFOn-4LS_RYEeRRNpfJ1cu/exec";
let quizSubmitLocked = false;
let quizRuntimeQuestions = [];
const QUIZ_QUESTIONS = [
  {
    prompt: "Une force appliquée sur un segment corporel peut être représentée par un vecteur. Quelles sont les caractéristiques nécessaires pour décrire correctement cette force ?",
    correct: ["A", "B", "D", "E"],
    options: {
      A: "Son point d’application",
      B: "Sa direction",
      C: "Sa couleur",
      D: "Son sens",
      E: "Son intensité",
    },
  },
  {
    prompt: "En mécanothérapie, le filin exerce une force au niveau du point d’attache. Cette force dépend principalement :",
    correct: ["A", "B", "D", "E"],
    options: {
      A: "De la direction du filin",
      B: "De l’angle entre le filin et le segment",
      C: "De la couleur de l’élingue",
      D: "De la distance entre le point d’attache et le centre articulaire",
      E: "De la charge placée à l’extrémité du filin",
    },
  },
  {
    prompt: "Dans la décomposition d’une force appliquée sur un segment, la composante rotatoire Cr :",
    correct: ["A", "B", "D"],
    options: {
      A: "Participe au mouvement articulaire",
      B: "Est maximale lorsque l’angle mécanique est favorable à la rotation",
      C: "Produit uniquement un effet de compression",
      D: "Est liée à l’effet de rotation autour de l’articulation",
      E: "N’a aucun intérêt clinique",
    },
  },
  {
    prompt: "Dans un montage, une tension T de 50 N est appliquée avec un angle de 30° par rapport à l’axe longitudinal du segment. On donne cos 30° = 0,87 et sin 30° = 0,50. Si Cl = T × cos θ et Cr = T × sin θ, quelles propositions sont exactes ?",
    correct: ["A", "B", "D", "E"],
    options: {
      A: "Cl vaut environ 43,5 N",
      B: "Cr vaut environ 25 N",
      C: "Cr vaut environ 43,5 N",
      D: "Cl correspond à la composante longitudinale",
      E: "Cr correspond à la composante rotatoire",
    },
  },
  {
    prompt: "Le moment d’une force dépend :",
    correct: ["A", "B", "C", "E"],
    options: {
      A: "De l’intensité de la force",
      B: "De la distance entre la ligne d’action de la force et le centre de rotation",
      C: "Du bras de levier",
      D: "De la longueur du filin uniquement",
      E: "Du point d’application de la force",
    },
  },
  {
    prompt: "Pour diminuer l’effort demandé à un patient faible ou douloureux lors d’un exercice contre résistance, on peut :",
    correct: ["A", "B", "D", "E"],
    options: {
      A: "Rapprocher le point d’attache du centre articulaire",
      B: "Diminuer la charge",
      C: "Augmenter le bras de levier",
      D: "Modifier l’orientation du filin",
      E: "Utiliser un montage facilitant plutôt que résistif",
    },
  },
  {
    prompt: "Une suspension verticale simple permet principalement :",
    correct: ["A", "B", "D"],
    options: {
      A: "De diminuer l’effet de la pesanteur sur le segment",
      B: "De faciliter le mouvement dans le plan horizontal",
      C: "De remplacer systématiquement un travail contre résistance",
      D: "De soulager le poids du segment",
      E: "De rendre tout mouvement articulaire actif impossible",
    },
  },
  {
    prompt: "Un circuit mouflé en pouliethérapie :",
    correct: ["A", "B", "C", "E"],
    options: {
      A: "Utilise une poulie mobile",
      B: "Peut diminuer l’effort nécessaire pour déplacer une charge",
      C: "Peut diviser la tension nécessaire dans certains montages",
      D: "Augmente toujours par deux la difficulté pour le patient",
      E: "Modifie la relation entre charge et force exercée sur le filin",
    },
  },
  {
    prompt: "Une traction de décompression doit rechercher principalement :",
    correct: ["A", "B", "C", "E"],
    options: {
      A: "Une composante longitudinale suffisante",
      B: "Une direction de force cohérente avec l’axe du segment ou de l’articulation ciblée",
      C: "Un réglage contrôlé de l’intensité",
      D: "Une augmentation maximale de la composante rotatoire",
      E: "Une installation confortable et sécurisée",
    },
  },
  {
    prompt: "Avant de faire réaliser un exercice de mécanothérapie, le kinésithérapeute doit vérifier :",
    correct: ["A", "B", "C", "D"],
    options: {
      A: "La douleur et la tolérance du patient",
      B: "La solidité des fixations",
      C: "L’orientation du filin",
      D: "L’amplitude articulaire autorisée",
      E: "La couleur du poids utilisé",
    },
  },
];

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
  studentName: document.getElementById("studentName"),
  studentGroup: document.getElementById("studentGroup"),
  gradeQuizButton: document.getElementById("gradeQuizButton"),
  quizContainer: document.getElementById("quizContainer"),
  quizResult: document.getElementById("quizResult"),
  quizStatus: document.getElementById("quizStatus"),
  sheetSubmitForm: document.getElementById("sheetSubmitForm"),
  sheetStudentName: document.getElementById("sheetStudentName"),
  sheetStudentGroup: document.getElementById("sheetStudentGroup"),
  sheetScore20: document.getElementById("sheetScore20"),
  sheetScore10: document.getElementById("sheetScore10"),
  sheetSubmittedAt: document.getElementById("sheetSubmittedAt"),
  sheetAnswersJson: document.getElementById("sheetAnswersJson"),
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

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuizRuntimeQuestions() {
  quizRuntimeQuestions = shuffleArray(
    QUIZ_QUESTIONS.map((question) => ({
      ...question,
      shuffledOptions: shuffleArray(
        Object.entries(question.options).map(([key, label]) => ({ key, label }))
      ),
    }))
  );
}

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

function renderQuiz() {
  if (!outputs.quizContainer) {
    return;
  }

  outputs.quizContainer.innerHTML = quizRuntimeQuestions.map((question, index) => `
    <article class="quiz-question" data-question-index="${index}">
      <div class="question-header">
        <div class="question-title">Question ${index + 1}</div>
        <div class="question-points">2 points</div>
      </div>
      <p>${question.prompt}</p>
      <div class="question-options">
        ${question.shuffledOptions.map(({ key, label }) => `
          <label class="question-option">
            <input type="checkbox" name="q${index}" value="${key}">
            <span><strong>${key}.</strong> ${label}</span>
          </label>
        `).join("")}
      </div>
      <div class="question-feedback" hidden></div>
    </article>
  `).join("");
}

function evaluateQuestion(question, selectedValues) {
  const correctSet = new Set(question.correct);
  const selectedSet = new Set(selectedValues);
  const hasFalse = selectedValues.some((value) => !correctSet.has(value));
  const fullyCorrect = question.correct.length === selectedValues.length && question.correct.every((value) => selectedSet.has(value));
  const hasAtLeastOneCorrect = selectedValues.some((value) => correctSet.has(value));
  const partial = !hasFalse && !fullyCorrect && hasAtLeastOneCorrect;

  if (fullyCorrect) {
    return 2;
  }

  if (partial) {
    return 1;
  }

  return 0;
}

function collectQuizResults() {
  return quizRuntimeQuestions.map((question, index) => {
    const selectedValues = [...document.querySelectorAll(`input[name="q${index}"]:checked`)].map((input) => input.value);
    const score = evaluateQuestion(question, selectedValues);
    return {
      index,
      prompt: question.prompt,
      displayedOptions: question.shuffledOptions,
      selectedValues,
      score,
      correctValues: question.correct,
    };
  });
}

function renderQuizCorrection(results) {
  const questionNodes = document.querySelectorAll(".quiz-question");
  results.forEach((result) => {
    const node = questionNodes[result.index];
    if (!node) {
      return;
    }

    node.classList.remove("correct", "partial", "incorrect", "unanswered");
    if (result.selectedValues.length === 0) {
      node.classList.add("unanswered");
    } else {
      node.classList.add(result.score === 2 ? "correct" : result.score === 1 ? "partial" : "incorrect");
    }

    const feedback = node.querySelector(".question-feedback");
    feedback.hidden = false;
    feedback.textContent = `Question corrigée • Votre score : ${result.score}/2`;
  });
}

function submitScoreToSheet(payload) {
  if (!SHEETS_WEB_APP_URL || !outputs.sheetSubmitForm) {
    outputs.quizStatus.textContent = "Note calculée localement. Ajoute l'URL du Web App Google Apps Script dans app.js pour l'envoyer vers Google Sheets.";
    outputs.quizStatus.classList.remove("is-success");
    outputs.quizStatus.classList.add("is-error");
    return;
  }

  outputs.sheetSubmitForm.action = SHEETS_WEB_APP_URL;
  outputs.sheetStudentName.value = payload.studentName;
  outputs.sheetStudentGroup.value = payload.studentGroup;
  outputs.sheetScore20.value = payload.score20;
  outputs.sheetScore10.value = payload.score10;
  outputs.sheetSubmittedAt.value = payload.submittedAt;
  outputs.sheetAnswersJson.value = JSON.stringify(payload.answers);
  outputs.sheetSubmitForm.submit();
  outputs.quizStatus.textContent = "Note calculée et envoyée vers Google Sheets.";
  outputs.quizStatus.classList.remove("is-error");
  outputs.quizStatus.classList.add("is-success");
}

function handleQuizSubmission() {
  if (quizSubmitLocked) {
    outputs.quizStatus.textContent = "La note a déjà été calculée pour cette session. Recharge la page si vous devez recommencer.";
    outputs.quizStatus.classList.remove("is-success");
    outputs.quizStatus.classList.add("is-error");
    return;
  }

  const studentName = outputs.studentName.value.trim();
  const studentGroup = outputs.studentGroup.value.trim();

  if (!studentName) {
    outputs.quizStatus.textContent = "Merci de renseigner le nom et prénom avant de corriger le QCM.";
    outputs.quizStatus.classList.remove("is-success");
    outputs.quizStatus.classList.add("is-error");
    outputs.studentName.focus();
    return;
  }

  if (!studentGroup) {
    outputs.quizStatus.textContent = "Merci de renseigner le groupe ou la promotion avant de corriger le QCM.";
    outputs.quizStatus.classList.remove("is-success");
    outputs.quizStatus.classList.add("is-error");
    outputs.studentGroup.focus();
    return;
  }

  const results = collectQuizResults();
  const total20 = results.reduce((sum, result) => sum + result.score, 0);
  const total10 = total20 / 2;
  const answeredCount = results.filter((result) => result.selectedValues.length > 0).length;

  if (answeredCount !== quizRuntimeQuestions.length) {
    outputs.quizStatus.textContent = "Merci de répondre à toutes les questions avant de soumettre la note.";
    outputs.quizStatus.classList.remove("is-success");
    outputs.quizStatus.classList.add("is-error");
    return;
  }

  renderQuizCorrection(results);

  if (outputs.quizResult) {
    outputs.quizResult.hidden = false;
    outputs.quizResult.innerHTML = `
      <strong>Note : ${total20}/20 (${round(total10, 1)}/10)</strong>
      <p>${answeredCount} question(s) renseignée(s) sur ${quizRuntimeQuestions.length}. Les bonnes réponses détaillées ne sont pas affichées automatiquement.</p>
      <p>Étudiant : ${studentName}${studentGroup ? ` • ${studentGroup}` : ""}</p>
    `;
  }

  quizSubmitLocked = true;
  outputs.gradeQuizButton.disabled = true;
  outputs.gradeQuizButton.textContent = "Note enregistrée";

  submitScoreToSheet({
    studentName,
    studentGroup,
    score20: total20,
    score10: round(total10, 1),
    submittedAt: new Date().toISOString(),
    answers: results.map((result) => ({
      question_number: result.index + 1,
      prompt: result.prompt,
      displayedOptions: result.displayedOptions,
      selectedValues: result.selectedValues,
      score: result.score,
      correctValues: result.correctValues,
    })),
  });
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

buildQuizRuntimeQuestions();
renderQuiz();
if (outputs.gradeQuizButton) {
  outputs.gradeQuizButton.addEventListener("click", handleQuizSubmission);
}
render();
