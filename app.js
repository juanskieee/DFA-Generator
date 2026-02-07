// State variables
let generatedDFA = null;

// DOM elements
const problemType = document.getElementById('problemType');
const pattern = document.getElementById('pattern');
const alphabet = document.getElementById('alphabet');
const testString = document.getElementById('testString');
const generateBtn = document.getElementById('generateBtn');
const testBtn = document.getElementById('testBtn');
const clearBtn = document.getElementById('clearBtn');
const resultDiv = document.getElementById('result');
const dfaVisualization = document.getElementById('dfaVisualization');
const toast = document.getElementById('toast');

// Dynamic form groups
const patternGroup = document.getElementById('patternGroup');
const symbolGroup = document.getElementById('symbolGroup');
const atLeastGroup = document.getElementById('atLeastGroup');
const exactCountGroup = document.getElementById('exactCountGroup');
const startEndGroup = document.getElementById('startEndGroup');
const divisibleByGroup = document.getElementById('divisibleByGroup');
const equalPatternsGroup = document.getElementById('equalPatternsGroup');
const lengthAtMostGroup = document.getElementById('lengthAtMostGroup');
const endWithOrEvenAfterGroup = document.getElementById('endWithOrEvenAfterGroup');
const symbolFollowedByPatternGroup = document.getElementById('symbolFollowedByPatternGroup');
const exactNAAtLeastMBGroup = document.getElementById('exactNAAtLeastMBGroup');
const eachSurroundedGroup = document.getElementById('eachSurroundedGroup');
const positionsSymbolGroup = document.getElementById('positionsSymbolGroup');
const onlySymbolsGroup = document.getElementById('onlySymbolsGroup');
const onlyOneSymbolGroup = document.getElementById('onlyOneSymbolGroup');
const startParityLengthGroup = document.getElementById('startParityLengthGroup');

const NORMAL_OFFSET = 20;
const CROSSING_OFFSET = 30;

// Event listeners
problemType.addEventListener('change', updateFormFields);
generateBtn.addEventListener('click', handleGenerate);
testBtn.addEventListener('click', handleTest);
clearBtn.addEventListener('click', handleClear);

// Initialize
updateFormFields();

// UI helpers
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function withLoading(buttonEl, labelWhileLoading = 'Working...') {
  const labelSpan = buttonEl.querySelector('.btn-label');
  const original = labelSpan ? labelSpan.textContent : buttonEl.textContent;
  if (labelSpan) labelSpan.textContent = labelWhileLoading;
  buttonEl.disabled = true;
  return () => {
    if (labelSpan) labelSpan.textContent = original;
    buttonEl.disabled = false;
  };
}

// Form field visibility
function updateFormFields() {
  const type = problemType.value;

  // Hide all dynamic fields
  patternGroup.style.display = 'none';
  symbolGroup.style.display = 'none';
  atLeastGroup.style.display = 'none';
  exactCountGroup.style.display = 'none';
  startEndGroup.style.display = 'none';
  divisibleByGroup.style.display = 'none';
  equalPatternsGroup.style.display = 'none';
  lengthAtMostGroup.style.display = 'none';
  endWithOrEvenAfterGroup.style.display = 'none';
  symbolFollowedByPatternGroup.style.display = 'none';
  exactNAAtLeastMBGroup.style.display = 'none';
  eachSurroundedGroup.style.display = 'none';
  positionsSymbolGroup.style.display = 'none';
  onlySymbolsGroup.style.display = 'none';
  onlyOneSymbolGroup.style.display = 'none';
  startParityLengthGroup.style.display = 'none';

  // Show relevant fields
  if (['ends-with','starts-with','contains','exactly-pattern','not-contains'].includes(type)) {
    patternGroup.style.display = 'block';
  } else if (['even-count','odd-count','no-consecutive'].includes(type)) {
    symbolGroup.style.display = 'block';
  } else if (type === 'at-least') {
    atLeastGroup.style.display = 'grid';
  } else if (type === 'exact-count') {
    exactCountGroup.style.display = 'grid';
  } else if (type === 'equal-count-patterns') {
    equalPatternsGroup.style.display = 'grid';
  } else if (type === 'start-end-pattern') {
    startEndGroup.style.display = 'grid';
  } else if (type === 'divisible-by') {
    divisibleByGroup.style.display = 'block';
  } else if (type === 'length-at-most') {
    lengthAtMostGroup.style.display = 'block';
  } else if (type === 'end-with-or-even-after') {
    endWithOrEvenAfterGroup.style.display = 'grid';
  } else if (type === 'symbol-followed-by-pattern') {
    symbolFollowedByPatternGroup.style.display = 'grid';
  } else if (type === 'exact-n-a-at-least-m-b') {
    exactNAAtLeastMBGroup.style.display = 'grid';
  } else if (type === 'each-surrounded') {
    eachSurroundedGroup.style.display = 'grid';
  } else if (type === 'odd-positions-symbol' || type === 'even-positions-symbol') {
    positionsSymbolGroup.style.display = 'block';
  } else if (type === 'all-one-symbol-or-another') {
    onlySymbolsGroup.style.display = 'grid';
  } else if (type === 'only-one-symbol') {
    onlyOneSymbolGroup.style.display = 'block';
  } else if (type === 'start-parity-length') {
    startParityLengthGroup.style.display = 'grid';
  }
}

// ===== ENHANCED INPUT VALIDATION FOR BETTER ACCURACY =====
function validateInputs(type) {
  const alpha = alphabet.value.trim();
  
  // Validate alphabet
  if (!alpha || alpha.length === 0) {
    throw new Error('❌ Alphabet cannot be empty');
  }
  
  // Check for duplicate symbols
  const uniqueSymbols = new Set(alpha.split(''));
  if (uniqueSymbols.size !== alpha.length) {
    throw new Error('❌ Alphabet contains duplicate symbols');
  }
  
  // Check for whitespace
  if (/\s/.test(alpha)) {
    throw new Error('❌ Alphabet cannot contain spaces');
  }
  
  // Pattern validations
  if (['ends-with', 'starts-with', 'contains', 'exactly-pattern', 'not-contains'].includes(type)) {
    const pat = pattern.value.trim();
    if (!pat) throw new Error('❌ Pattern cannot be empty');
    for (let char of pat) {
      if (!alpha.includes(char)) {
        throw new Error(`❌ Pattern symbol '${char}' not in alphabet {${alpha}}`);
      }
    }
  }
  
  // Symbol validations
  if (['even-count', 'odd-count', 'no-consecutive'].includes(type)) {
    const sym = document.getElementById('symbol').value.trim();
    if (!sym) throw new Error('❌ Symbol cannot be empty');
    if (!alpha.includes(sym)) {
      throw new Error(`❌ Symbol '${sym}' not in alphabet`);
    }
  }
  
  // Count validations
  if (type === 'at-least' || type === 'exact-count') {
    const fieldId = type === 'at-least' ? 'atLeastCount' : 'exactCount';
    const count = parseInt(document.getElementById(fieldId).value);
    const minVal = type === 'at-least' ? 1 : 0;
    if (isNaN(count) || count < minVal) {
      throw new Error(`❌ Count must be at least ${minVal}`);
    }
    if (count > 20) throw new Error('❌ Count too large (max 20 for performance)');
  }
  
  // Divisor validations
  if (type === 'divisible-by') {
    const divisor = parseInt(document.getElementById('divisibleBy').value);
    if (isNaN(divisor) || divisor < 2) {
      throw new Error('❌ Divisor must be at least 2');
    }
    if (divisor > 100) throw new Error('❌ Divisor too large (max 100)');
  }
  
  return true;
}

// Generate DFA
function handleGenerate() {
  const done = withLoading(generateBtn, 'Generating...');
  const type = problemType.value;
  const alpha = alphabet.value;
  let dfa;

  try {
    // ✨ Validate inputs before generating
    validateInputs(type);
    
    switch(type) {
      case 'ends-with':
        dfa = generateEndsWithDFA(pattern.value, alpha); break;
      case 'contains':
        dfa = generateContainsDFA(pattern.value, alpha); break;
      case 'exactly-pattern':
        dfa = generateExactPatternDFA(pattern.value, alpha); break;
      case 'even-count':
        dfa = generateEvenCountDFA(document.getElementById('symbol').value || '0', alpha); break;
      case 'odd-count':
        dfa = generateOddCountDFA(document.getElementById('symbol').value || '0', alpha); break;
      case 'starts-with':
        dfa = generateStartsWithDFA(pattern.value, alpha); break;
      case 'same-start-end':
        dfa = generateSameStartEndDFA(alpha); break;
      case 'alternating':
        dfa = generateAlternatingDFA(alpha); break;
      case 'divisible-by':
        dfa = generateDivisibleByDFA(document.getElementById('divisibleBy').value, alpha); break;
      case 'length-at-most':
        dfa = generateLengthAtMostDFA(document.getElementById('lengthAtMost').value, alpha); break;
      case 'equal-count-patterns':
        dfa = generateEqualCountPatternsDFA(
          document.getElementById('pattern1').value || '01',
          document.getElementById('pattern2').value || '10',
          alpha
        ); break;
      case 'end-with-or-even-after':
        dfa = generateEndWithOrEvenAfterDFA(
          document.getElementById('endSymbol').value || '1',
          document.getElementById('countSymbol').value || '0',
          alpha
        ); break;
      case 'end-1-or-even-0s':
        dfa = generateEnd1OrEven0sAfterLast1DFA(alpha); break;
      case 'zero-surrounded':
        dfa = generateZeroSurroundedDFA(alpha); break;
      case 'each-surrounded':
        dfa = generateEachSurroundedDFA(
          document.getElementById('surroundedSymbol').value || '0',
          document.getElementById('surroundingSymbol').value || '1',
          alpha
        ); break;
      case 'exact-n-a-at-least-m-b': {
        const symbolA = document.getElementById('symbolA').value || '0';
        const exactN = parseInt(document.getElementById('exactN').value) || 4;
        const symbolB = document.getElementById('symbolB').value || '1';
        const atLeastM = parseInt(document.getElementById('atLeastM').value) || 2;
        dfa = generateExactNAAtLeastMBDFA(symbolA, exactN, symbolB, atLeastM, alpha);
        break;
      }
      case 'odd-positions-1':
        dfa = generateOddPositionsOneDFA(alpha); break;
      case 'start-parity-length': {
        const startOddSymbol = document.getElementById('startOddSymbol').value || '0';
        const startEvenSymbol = document.getElementById('startEvenSymbol').value || '1';
        dfa = generateStartParityLengthDFA(startOddSymbol, startEvenSymbol, alpha);
        break;
      }
      case 'zero-followed-11':
        dfa = generateZeroFollowed11DFA(alpha); break;
      case 'symbol-followed-by-pattern':
        dfa = generateSymbolFollowedByPatternDFA(
          document.getElementById('followedSymbol').value || '0',
          document.getElementById('followingPattern').value || '11',
          alpha
        ); break;
      case 'start-10-or-end-0-odd':
        dfa = generateStart10OrEnd0OddLengthDFA(alpha); break;
      case 'not-contains':
        dfa = generateNotContainsDFA(pattern.value, alpha); break;
      case 'at-least': {
        const atLeastSymbol = document.getElementById('atLeastSymbol').value || '1';
        const atLeastCount = document.getElementById('atLeastCount').value || '2';
        dfa = generateAtLeastCountDFA(atLeastSymbol, atLeastCount, alpha);
        break;
      }
      case 'exact-count':
        dfa = generateExactCountDFA(
          document.getElementById('exactSymbol').value || '0',
          document.getElementById('exactCount').value,
          alpha
        ); break;
      case 'start-end-pattern': {
        const startPattern = document.getElementById('startPattern').value || '11';
        const endPattern = document.getElementById('endPattern').value || '01';
        dfa = generateStartEndPatternDFA(startPattern, endPattern, alpha);
        break;
      }
      case 'no-consecutive':
        dfa = generateNoConsecutiveDFA(document.getElementById('symbol').value || '1', alpha); break;
      case 'odd-positions-symbol': {
        const sym = document.getElementById('positionsSymbol').value || '1';
        dfa = generatePositionsParityDFA(sym, 'odd', alpha); break;
      }
      case 'even-positions-symbol': {
        const sym = document.getElementById('positionsSymbol').value || '0';
        dfa = generatePositionsParityDFA(sym, 'even', alpha); break;
      }
      case 'all-one-symbol-or-another': {
        const symA = document.getElementById('onlySymbolA').value || '0';
        const symB = document.getElementById('onlySymbolB').value || '1';
        dfa = generateAllOneSymbolOrAnotherDFA(symA, symB, alpha); break;
      }
      case 'only-one-symbol': {
        const sym = document.getElementById('onlyOneSymbol').value || '0';
        dfa = generateOnlyOneSymbolDFA(sym, alpha); break;
      }
      default:
        dfa = generateEndsWithDFA(pattern.value, alpha);
    }

    // Normalize & render
    generatedDFA = normalizeStates(dfa);
    testString.disabled = false;
    testBtn.disabled = false;
    resultDiv.style.display = 'none';
    renderDFA(generatedDFA);
    document.querySelector('.empty-placeholder').style.display = 'none';
    showToast('DFA generated successfully');
  } catch (error) {
    // Enhanced error display with visual feedback
    const errorMessage = error.message || 'Unknown error occurred';
    resultDiv.style.display = 'block';
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `
      <div class="result-header error">
        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        Generation Error
      </div>
      <div class="result-details">
        <p style="color: #991b1b; font-weight: 600;">${errorMessage}</p>
        <p style="margin-top: 8px; font-size: 0.85rem; color: #64748b;">
          Please check your inputs and try again.
        </p>
      </div>
    `;
    console.error('DFA Generation Error:', error);
  } finally {
    done();
  }
}

// Test DFA
function handleTest() {
  if (!generatedDFA) {
    showResult({ error: 'Please generate a DFA first!' });
    return;
  }
  const done = withLoading(testBtn, 'Testing...');
  const simulationResult = simulateDFA(generatedDFA, testString.value || '');
  showResult(simulationResult);
  done();
}

// Clear form
function handleClear() {
  problemType.value = 'ends-with';
  pattern.value = '01';
  alphabet.value = '01';
  testString.value = '';
  testString.disabled = true;
  testBtn.disabled = true;
  resultDiv.style.display = 'none';
  dfaVisualization.style.display = 'none';
  document.querySelector('.empty-placeholder').style.display = 'block';
  generatedDFA = null;

  // Reset defaults
  document.getElementById('exactCount').value = '3';
  document.getElementById('atLeastCount').value = '2';
  document.getElementById('divisibleBy').value = '3';
  document.getElementById('lengthAtMost').value = '5';
  document.getElementById('pattern1').value = '01';
  document.getElementById('pattern2').value = '10';
  document.getElementById('startPattern').value = '11';
  document.getElementById('endPattern').value = '01';
  document.getElementById('atLeastSymbol').value = '1';
  document.getElementById('exactSymbol').value = '0';
  document.getElementById('symbol').value = '0';
  document.getElementById('endSymbol').value = '1';
  document.getElementById('countSymbol').value = '0';
  document.getElementById('followedSymbol').value = '0';
  document.getElementById('followingPattern').value = '11';
  document.getElementById('symbolA').value = '0';
  document.getElementById('exactN').value = '4';
  document.getElementById('symbolB').value = '1';
  document.getElementById('atLeastM').value = '2';
  document.getElementById('surroundedSymbol').value = '0';
  document.getElementById('surroundingSymbol').value = '1';
  document.getElementById('positionsSymbol').value = '1';
  document.getElementById('startOddSymbol').value = '0';
  document.getElementById('startEvenSymbol').value = '1';

  updateFormFields();
  showToast('Cleared');
}

// Result UI
function showResult(result) {
  resultDiv.style.display = 'block';

  if (result.error) {
    resultDiv.className = 'result error';
    resultDiv.innerHTML = `
      <div class="result-header error">
        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        ${result.error}
      </div>
    `;
    return;
  }

  resultDiv.className = result.accepted ? 'result accepted' : 'result rejected';
  resultDiv.innerHTML = `
    <div class="result-header ${result.accepted ? 'accepted' : 'rejected'}">
      <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        ${result.accepted
          ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
        }
      </svg>
      ${result.accepted ? 'ACCEPTED' : 'REJECTED'}
    </div>
    <div class="result-details">
      <p><strong>Computation path:</strong></p>
      <p class="result-path">${result.path.join(' → ')}</p>
      <p style="margin-top: 0.5rem;">Final state: <strong>${result.finalState}</strong></p>
    </div>
  `;
}

// Visualization render
function renderDFA(dfa) {
  dfaVisualization.style.display = 'block';
  document.querySelector('.empty-placeholder').style.display = 'none';

  document.getElementById('dfaDescription').textContent = dfa.description;
  renderStateDiagram(dfa);
  renderTransitionTable(dfa);

  document.getElementById('statesList').textContent = dfa.states.join(', ');
  document.getElementById('acceptStatesList').textContent = dfa.acceptStates.join(', ');
}

function renderStateDiagram(dfa) {
  const canvas = document.getElementById('stateDiagram');
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const radius = 28;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const states = dfa.states;
  const n = states.length;

  // Circular layout
  const angleStep = (2 * Math.PI) / n;
  const angleStart = Math.PI;
  const R = Math.min(centerX, centerY) - 80;

  const statePositions = {};
  states.forEach((state, i) => {
    const angle = angleStart + i * angleStep;
    const x = centerX + R * Math.cos(angle);
    const y = centerY + R * Math.sin(angle);
    statePositions[state] = { x, y };
  });

  // Group transitions by pair
  const transitionMap = new Map();
  Object.keys(dfa.transitions).forEach(from => {
    Object.entries(dfa.transitions[from]).forEach(([symbol, to]) => {
      const key = `${from}->${to}`;
      if (!transitionMap.has(key)) transitionMap.set(key, { from, to, labels: [] });
      transitionMap.get(key).labels.push(symbol);
    });
  });
  const transitions = Array.from(transitionMap.values()).map(t => ({ ...t, label: t.labels.join(',') }));

  // Draw states
  states.forEach(state => {
    const pos = statePositions[state];
    const isAccept = dfa.acceptStates.includes(state);
    const isStart = state === dfa.startState;

    if (isAccept) {
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = isAccept ? '#D1FAE5' : '#E8F0FE';
    ctx.strokeStyle = isAccept ? '#10B981' : '#3B82F6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Label
    ctx.fillStyle = '#0f172a';
    ctx.font = '16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(state, pos.x, pos.y + 5);

    // Start arrow
    if (isStart) {
      const startX = pos.x - radius - 50;
      const startY = pos.y;
      const endX = pos.x - radius - 5;
      const endY = pos.y;

      ctx.strokeStyle = '#4B5563';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.fillStyle = '#4B5563';
      drawArrow(ctx, endX + 5, endY, 0);

      ctx.fillStyle = '#334155';
      ctx.font = '13px Inter';
      ctx.fillText('start', pos.x - radius - 70, pos.y + 4);
    }
  });

  // Draw transitions on top
  transitions.forEach(trans => {
    const from = statePositions[trans.from];
    const to = statePositions[trans.to];

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#475569';

    if (trans.from === trans.to) {
      // Self loop
      const loopRadius = 22;
      const loopCenterY = from.y - radius - loopRadius + 6;

      ctx.beginPath();
      ctx.arc(from.x, loopCenterY, loopRadius, (2 * Math.PI) / 3, (3 * Math.PI) / 3 + (4 * Math.PI) / 3);
      ctx.stroke();

      const endAngle = (2 * Math.PI) / 3 + (5 * Math.PI) / 3;
      const arrowX = from.x + loopRadius * Math.cos(endAngle);
      const arrowY = loopCenterY + loopRadius * Math.sin(endAngle);
      drawArrow(ctx, arrowX, arrowY, endAngle + Math.PI / 2.3);

      ctx.fillStyle = '#0f172a';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(trans.label, from.x, loopCenterY - loopRadius - 6);
    } else {
      // Curve between states
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const angle = Math.atan2(dy, dx);

      const hasReverse = transitions.some(t => t.from === trans.to && t.to === trans.from);

      const px = -Math.sin(angle);
      const py = Math.cos(angle);

      let startX, startY, endX, endY, midX, midY;

      if (hasReverse) {
        const side = 1;
        const angularOffset = 0.25;
        const curveOffset = 36;

        startX = from.x + radius * Math.cos(angle + angularOffset * side);
        startY = from.y + radius * Math.sin(angle + angularOffset * side);

        endX = to.x - radius * Math.cos(angle - angularOffset * side);
        endY = to.y - radius * Math.sin(angle - angularOffset * side);

        midX = (from.x + to.x) / 2 + px * curveOffset * side;
        midY = (from.y + to.y) / 2 + py * curveOffset * side;
      } else {
        startX = from.x + radius * Math.cos(angle);
        startY = from.y + radius * Math.sin(angle);
        endX   = to.x   - radius * Math.cos(angle);
        endY   = to.y   - radius * Math.sin(angle);

        midX = (from.x + to.x) / 2;
        midY = (from.y + to.y) / 2;
      }

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();

      const arrowAngle = hasReverse ? Math.atan2(endY - midY, endX - midX) : angle;
      drawArrow(ctx, endX, endY, arrowAngle);

      // Label
      ctx.fillStyle = '#0f172a';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';

      const t = 0.5;
      const cx = (1-t)*(1-t)*startX + 2*(1-t)*t*midX + t*t*endX;
      const cy = (1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;

      const tx = 2*(1-t)*(midX-startX) + 2*t*(endX-midX);
      const ty = 2*(1-t)*(midY-startY) + 2*t*(endY-midY);

      const len = Math.hypot(tx, ty);
      let nx = -ty/len, ny = tx/len;

      const dot = (cx-(startX+endX)/2)*nx + (cy-(startY+endY)/2)*ny;
      if (dot < 0) { nx = -nx; ny = -ny; }

      let offsetDist = NORMAL_OFFSET;
      for (const other of transitions) {
        if (other === trans) continue;
        const ofrom = statePositions[other.from];
        const oto   = statePositions[other.to];
        if (isNearLine(cx, cy, ofrom.x, ofrom.y, oto.x, oto.y)) {
          offsetDist = CROSSING_OFFSET;
          break;
        }
      }

      let labelX = cx + nx * offsetDist;
      let labelY = cy + ny * offsetDist;

      const angleDeg = Math.abs(Math.atan2(endY - startY, endX - startX) * 180 / Math.PI);
      if (angleDeg > 75 && angleDeg < 105) labelY -= 5;

      ctx.fillText(trans.label, labelX, labelY);
    }
  });
}

function isNearLine(px, py, x1, y1, x2, y2, threshold = 10) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx*dx + dy*dy;
  if (len2 === 0) return Math.hypot(px - x1, py - y1) < threshold;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const lx = x1 + t * dx, ly = y1 + t * dy;
  return Math.hypot(px - lx, py - ly) < threshold;
}

function drawArrow(ctx, x, y, angle) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
  ctx.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
  ctx.closePath();
  ctx.fill();
}

function renderTransitionTable(dfa) {
  const table = document.getElementById('transitionTable');
  table.innerHTML = '';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const stateHeader = document.createElement('th');
  stateHeader.textContent = 'State';
  headerRow.appendChild(stateHeader);

  dfa.alphabet.forEach(symbol => {
    const th = document.createElement('th');
    th.textContent = symbol;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  dfa.states.forEach(state => {
    const row = document.createElement('tr');
    if (dfa.acceptStates.includes(state)) row.className = 'accept-state';

    const stateCell = document.createElement('td');
    stateCell.textContent = state;
    if (state === dfa.startState) stateCell.textContent += ' →';
    if (dfa.acceptStates.includes(state)) stateCell.textContent += ' ★';
    row.appendChild(stateCell);

    dfa.alphabet.forEach(symbol => {
      const td = document.createElement('td');
      td.textContent = dfa.transitions[state][symbol];
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
  table.appendChild(tbody);
}

function simulateDFA(dfa, inputString) {
  let currentState = dfa.startState;
  const path = [currentState];

  for (let symbol of inputString) {
    if (!dfa.alphabet.includes(symbol)) {
      return {
        accepted: false,
        path,
        error: `Invalid symbol '${symbol}' not in alphabet {${dfa.alphabet.join(', ')}}`
      };
    }
    currentState = dfa.transitions[currentState][symbol];
    path.push(currentState);
  }

  const accepted = dfa.acceptStates.includes(currentState);
  return { accepted, path, finalState: currentState };
}

/* DFA Generators (unchanged logic, cleaned descriptions) */

function generateEndsWithDFA(pattern, alphabet) {
  const states = [];
  const alphabetArray = alphabet.split('');

  for (let i = 0; i <= pattern.length; i++) states.push(`q${i}`);

  const transitions = {};
  states.forEach(state => transitions[state] = {});

  for (let i = 0; i < states.length; i++) {
    const currentPrefix = pattern.substring(0, i);
    alphabetArray.forEach(symbol => {
      const newString = currentPrefix + symbol;
      let nextState = 0;
      for (let j = Math.min(newString.length, pattern.length); j >= 0; j--) {
        if (pattern.startsWith(newString.substring(newString.length - j))) { nextState = j; break; }
      }
      transitions[`q${i}`][symbol] = `q${nextState}`;
    });
  }

  return {
    states,
    alphabet: alphabetArray,
    transitions,
    startState: 'q0',
    acceptStates: [`q${pattern.length}`],
    description: `Accepts strings ending with "${pattern}".`
  };
}

function generateContainsDFA(substring, alphabet) {
  const states = [];
  const alphabetArray = alphabet.split('');

  for (let i = 0; i <= substring.length; i++) states.push(`q${i}`);

  const transitions = {};
  states.forEach(state => transitions[state] = {});

  for (let i = 0; i < states.length; i++) {
    const currentPrefix = substring.substring(0, i);
    alphabetArray.forEach(symbol => {
      if (i === substring.length) {
        transitions[`q${i}`][symbol] = `q${substring.length}`;
      } else {
        const newString = currentPrefix + symbol;
        let nextState = 0;
        for (let j = Math.min(newString.length, substring.length); j >= 0; j--) {
          if (substring.startsWith(newString.substring(newString.length - j))) { nextState = j; break; }
        }
        transitions[`q${i}`][symbol] = `q${nextState}`;
      }
    });
  }

  return {
    states,
    alphabet: alphabetArray,
    transitions,
    startState: 'q0',
    acceptStates: [`q${substring.length}`],
    description: `Accepts strings containing "${substring}".`
  };
}

function generateOnlyOneSymbolDFA(symbol, alphabet) {
  const alphabetArray = alphabet.split('');
  if (!alphabetArray.includes(symbol)) throw new Error(`Alphabet must include '${symbol}'`);

  const states = ['Q0', 'Q1', 'QTrap'];
  const transitions = { Q0: {}, Q1: {}, QTrap: {} };

  alphabetArray.forEach(s => { transitions.Q0[s] = (s === symbol) ? 'Q1' : 'QTrap'; });
  alphabetArray.forEach(s => {
    transitions.Q1[s] = (s === symbol) ? 'Q1' : 'QTrap';
    transitions.QTrap[s] = 'QTrap';
  });

  return {
    states,
    alphabet: alphabetArray,
    transitions,
    startState: 'Q0',
    acceptStates: ['Q1'],
    description: `Accepts strings consisting only of '${symbol}'.`
  };
}

function generatePositionsParityDFA(symbol, parity, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['q0', 'q1', 'qReject'];
  const transitions = { q0: {}, q1: {}, qReject: {} };

  alphabetArray.forEach(s => {
    transitions.q0[s] = parity === 'odd' ? ((s === symbol) ? 'q1' : 'qReject') : 'q1';
    transitions.q1[s] = parity === 'even' ? ((s === symbol) ? 'q0' : 'qReject') : 'q0';
    transitions.qReject[s] = 'qReject';
  });

  return {
    states,
    alphabet: alphabetArray,
    transitions,
    startState: 'q0',
    acceptStates: ['q0', 'q1'],
    description: `Accepts strings with '${symbol}' at all ${parity} positions (1-based).`
  };
}

function generateEvenCountDFA(symbol, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['q0', 'q1'];
  const transitions = { q0: {}, q1: {} };

  alphabetArray.forEach(s => {
    if (s === symbol) { transitions.q0[s] = 'q1'; transitions.q1[s] = 'q0'; }
    else { transitions.q0[s] = 'q0'; transitions.q1[s] = 'q1'; }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: ['q0'],
    description: `Accepts strings with an even number of '${symbol}' (including zero).`
  };
}

function generateOddCountDFA(symbol, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['q0', 'q1'];
  const transitions = { q0: {}, q1: {} };

  alphabetArray.forEach(s => {
    if (s === symbol) { transitions.q0[s] = 'q1'; transitions.q1[s] = 'q0'; }
    else { transitions.q0[s] = 'q0'; transitions.q1[s] = 'q1'; }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: ['q1'],
    description: `Accepts strings with an odd number of '${symbol}'.`
  };
}

function generateSameStartEndDFA(alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['qStart'];
  const transitions = { qStart: {} };

  alphabetArray.forEach(sym => {
    states.push(`q${sym}_start`, `q${sym}_accept`);
    transitions[`q${sym}_start`] = {};
    transitions[`q${sym}_accept`] = {};
  });

  alphabetArray.forEach(startSym => {
    transitions.qStart[startSym] = `q${startSym}_start`;
    alphabetArray.forEach(nextSym => {
      if (nextSym === startSym) {
        transitions[`q${startSym}_start`][nextSym] = `q${startSym}_accept`;
        transitions[`q${startSym}_accept`][nextSym] = `q${startSym}_accept`;
      } else {
        transitions[`q${startSym}_start`][nextSym] = `q${startSym}_start`;
        transitions[`q${startSym}_accept`][nextSym] = `q${startSym}_start`;
      }
    });
  });

  const acceptStates = alphabetArray.map(sym => `q${sym}_accept`);

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart', acceptStates,
    description: 'Accepts strings that start and end with the same character.'
  };
}

function generateAlternatingDFA(alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['qStart', 'q0', 'q1', 'qReject'];
  const transitions = { qStart: {}, q0: {}, q1: {}, qReject: {} };

  transitions.qStart['0'] = 'q0';
  transitions.qStart['1'] = 'q1';
  transitions.q0['0'] = 'qReject';
  transitions.q0['1'] = 'q1';
  transitions.q1['0'] = 'q0';
  transitions.q1['1'] = 'qReject';
  transitions.qReject['0'] = 'qReject';
  transitions.qReject['1'] = 'qReject';

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart', acceptStates: ['qStart', 'q0', 'q1'],
    description: 'Accepts strings with alternating 0s and 1s.'
  };
}

function generateDivisibleByDFA(divisor, alphabet) {
  const alphabetArray = alphabet.split('');
  const n = parseInt(divisor);
  const states = [];
  const transitions = {};
  const base = alphabetArray.length;

  for (let i = 0; i < n; i++) { states.push(`q${i}`); transitions[`q${i}`] = {}; }

  for (let i = 0; i < n; i++) {
    alphabetArray.forEach((symbol, idx) => {
      const nextState = (i * base + idx) % n;
      transitions[`q${i}`][symbol] = `q${nextState}`;
    });
  }

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: ['q0'],
    description: `Accepts base-${base} numbers divisible by ${n}.`
  };
}

function generateNotContainsDFA(pattern, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = [];
  for (let i = 0; i <= pattern.length; i++) states.push(`q${i}`);

  const transitions = {};
  states.forEach(state => transitions[state] = {});

  for (let i = 0; i < pattern.length; i++) {
    const currentPrefix = pattern.substring(0, i);
    alphabetArray.forEach(symbol => {
      const newString = currentPrefix + symbol;
      let nextState = 0;
      for (let j = Math.min(newString.length, pattern.length); j >= 0; j--) {
        if (pattern.startsWith(newString.substring(newString.length - j))) { nextState = j; break; }
      }
      transitions[`q${i}`][symbol] = `q${nextState}`;
    });
  }

  alphabetArray.forEach(symbol => {
    transitions[`q${pattern.length}`][symbol] = `q${pattern.length}`;
  });

  const acceptStates = [];
  for (let i = 0; i < pattern.length; i++) acceptStates.push(`q${i}`);

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates,
    description: `Accepts strings that do NOT contain "${pattern}".`
  };
}

function generateAtLeastCountDFA(symbol, minCount, alphabet) {
  const alphabetArray = alphabet.split('');
  const count = parseInt(minCount);
  const states = [];
  for (let i = 0; i <= count; i++) states.push(`q${i}`);

  const transitions = {};
  states.forEach(state => transitions[state] = {});

  for (let i = 0; i <= count; i++) {
    alphabetArray.forEach(s => {
      if (s === symbol) transitions[`q${i}`][s] = (i < count) ? `q${i + 1}` : `q${count}`;
      else transitions[`q${i}`][s] = `q${i}`;
    });
  }

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: [`q${count}`],
    description: `Accepts strings with at least ${count} '${symbol}'.`
  };
}

function generateExactCountDFA(symbol, exactNum, alphabet) {
  const alphabetArray = alphabet.split('');
  const count = parseInt(exactNum);
  const states = [];
  for (let i = 0; i <= count; i++) states.push(`q${i}`);
  states.push('qReject');

  const transitions = {};
  states.forEach(state => transitions[state] = {});

  for (let i = 0; i <= count; i++) {
    alphabetArray.forEach(s => {
      if (s === symbol) transitions[`q${i}`][s] = (i < count) ? `q${i + 1}` : 'qReject';
      else transitions[`q${i}`][s] = `q${i}`;
    });
  }
  alphabetArray.forEach(s => transitions['qReject'][s] = 'qReject');

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: [`q${count}`],
    description: `Accepts strings with exactly ${count} '${symbol}'.`
  };
}

function generateStartEndPatternDFA(startPat, endPat, alphabet) {
  const alphabetArray = alphabet.split('');
  const startLen = startPat.length, endLen = endPat.length;
  const states = [], transitions = {};

  for (let i = 0; i < startLen; i++) { const name = `qS${i}`; states.push(name); transitions[name] = {}; }
  for (let i = 0; i <= endLen; i++) { const name = `qM${i}`; states.push(name); transitions[name] = {}; }

  states.push('qReject'); transitions['qReject'] = {};

  for (let i = 0; i < startLen - 1; i++) {
    alphabetArray.forEach(symbol => {
      transitions[`qS${i}`][symbol] = (symbol === startPat[i]) ? `qS${i + 1}` : 'qReject';
    });
  }

  const lastStartIdx = startLen - 1;
  alphabetArray.forEach(symbol => {
    if (symbol === startPat[lastStartIdx]) {
      let nextState = 0;
      for (let j = 1; j <= endLen; j++) if (endPat.substring(0, j) === symbol) nextState = j;
      transitions[`qS${lastStartIdx}`][symbol] = `qM${nextState}`;
    } else transitions[`qS${lastStartIdx}`][symbol] = 'qReject';
  });

  for (let i = 0; i <= endLen; i++) {
    const currentSuffix = endPat.substring(0, i);
    alphabetArray.forEach(symbol => {
      const newString = currentSuffix + symbol;
      let nextState = 0;
      for (let j = Math.min(newString.length, endLen); j >= 0; j--) {
        if (endPat.startsWith(newString.substring(newString.length - j))) { nextState = j; break; }
      }
      transitions[`qM${i}`][symbol] = `qM${nextState}`;
    });
  }

  alphabetArray.forEach(symbol => transitions['qReject'][symbol] = 'qReject');

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qS0', acceptStates: [`qM${endLen}`],
    description: `Accepts strings starting with "${startPat}" and ending with "${endPat}".`
  };
}

function normalizeStates(dfa) {
  const newStates = {};
  let counter = 0;

  dfa.states.forEach(old => { newStates[old] = `q${counter++}`; });

  const newTransitions = {};
  Object.keys(dfa.transitions).forEach(old => {
    const mappedState = newStates[old];
    newTransitions[mappedState] = {};
    Object.keys(dfa.transitions[old]).forEach(symbol => {
      const toOld = dfa.transitions[old][symbol];
      newTransitions[mappedState][symbol] = newStates[toOld];
    });
  });

  return {
    states: Object.values(newStates),
    alphabet: dfa.alphabet,
    transitions: newTransitions,
    startState: newStates[dfa.startState],
    acceptStates: dfa.acceptStates.map(s => newStates[s]),
    description: dfa.description
  };
}

function generateNoConsecutiveDFA(symbol, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['q0', 'q1', 'qReject'];
  const transitions = { q0: {}, q1: {}, qReject: {} };

  alphabetArray.forEach(s => {
    if (s === symbol) { transitions.q0[s] = 'q1'; transitions.q1[s] = 'qReject'; }
    else { transitions.q0[s] = 'q0'; transitions.q1[s] = 'q0'; }
  });
  alphabetArray.forEach(s => transitions.qReject[s] = 'qReject');

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: ['q0', 'q1'],
    description: `Accepts strings with no consecutive '${symbol}'.`
  };
}

function generateEqualCountPatternsDFA(pattern1, pattern2, alphabet) {
  const alphabetArray = alphabet.split('');
  const len1 = pattern1.length, len2 = pattern2.length;
  const stateMap = new Map(), states = [], transitions = {};

  function getStateName(s1, s2, diff) {
    const key = `${s1},${s2},${diff}`;
    if (!stateMap.has(key)) {
      const name = `q${states.length}`;
      stateMap.set(key, name);
      states.push(name);
      transitions[name] = {};
    }
    return stateMap.get(key);
  }

  const queue = [[0, 0, 0]];
  const visited = new Set(['0,0,0']);

  while (queue.length > 0) {
    const [s1, s2, diff] = queue.shift();
    const currentState = getStateName(s1, s2, diff);

    alphabetArray.forEach(symbol => {
      let newS1 = 0, completedP1 = false;
      const test1 = pattern1.substring(0, s1) + symbol;

      if (s1 === len1 - 1 && pattern1[s1] === symbol) {
        completedP1 = true;
        for (let k = len1 - 1; k >= 1; k--) {
          if (pattern1.substring(0, k) === pattern1.substring(len1 - k)) { newS1 = k; break; }
        }
      } else {
        for (let k = Math.min(test1.length, len1); k >= 0; k--) {
          if (pattern1.substring(0, k) === test1.substring(test1.length - k)) { newS1 = k; break; }
        }
      }

      let newS2 = 0, completedP2 = false;
      const test2 = pattern2.substring(0, s2) + symbol;

      if (s2 === len2 - 1 && pattern2[s2] === symbol) {
        completedP2 = true;
        for (let k = len2 - 1; k >= 1; k--) {
          if (pattern2.substring(0, k) === pattern2.substring(len2 - k)) { newS2 = k; break; }
        }
      } else {
        for (let k = Math.min(test2.length, len2); k >= 0; k--) {
          if (pattern2.substring(0, k) === test2.substring(test2.length - k)) { newS2 = k; break; }
        }
      }

      let newDiff = diff;
      if (completedP1) newDiff++;
      if (completedP2) newDiff--;
      newDiff = Math.max(-10, Math.min(10, newDiff));

      const nextState = getStateName(newS1, newS2, newDiff);
      transitions[currentState][symbol] = nextState;

      const nextKey = `${newS1},${newS2},${newDiff}`;
      if (!visited.has(nextKey)) { visited.add(nextKey); queue.push([newS1, newS2, newDiff]); }
    });
  }

  const acceptStates = [];
  stateMap.forEach((name, key) => {
    const [, , diff] = key.split(',').map(Number);
    if (diff === 0) acceptStates.push(name);
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: getStateName(0, 0, 0), acceptStates,
    description: `Accepts strings with equal counts of "${pattern1}" and "${pattern2}".`
  };
}

function generateEndWithOrEvenAfterDFA(endSymbol, countSymbol, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['qStart', 'qAfterEnd', 'qEvenCount', 'qOddCount'];
  const transitions = { qStart: {}, qAfterEnd: {}, qEvenCount: {}, qOddCount: {} };

  alphabetArray.forEach(symbol => {
    if (symbol === endSymbol) {
      transitions.qStart[symbol] = 'qAfterEnd';
      transitions.qAfterEnd[symbol] = 'qAfterEnd';
      transitions.qEvenCount[symbol] = 'qAfterEnd';
      transitions.qOddCount[symbol] = 'qAfterEnd';
    } else if (symbol === countSymbol) {
      transitions.qStart[symbol] = 'qEvenCount';
      transitions.qAfterEnd[symbol] = 'qEvenCount';
      transitions.qEvenCount[symbol] = 'qOddCount';
      transitions.qOddCount[symbol] = 'qEvenCount';
    } else {
      states.forEach(state => { transitions[state][symbol] = state; });
    }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart', acceptStates: ['qAfterEnd', 'qEvenCount'],
    description: `Accepts strings ending with '${endSymbol}' or with even '${countSymbol}' count after the last '${endSymbol}'.`
  };
}

function generateEnd1OrEven0sAfterLast1DFA(alphabet) {
  return generateEndWithOrEvenAfterDFA('1', '0', alphabet);
}

function generateZeroSurroundedDFA(alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['qStart', 'qAfter1', 'qAfter0', 'qReject'];
  const transitions = { qStart: {}, qAfter1: {}, qAfter0: {}, qReject: {} };

  alphabetArray.forEach(symbol => {
    if (symbol === '1') {
      transitions.qStart[symbol] = 'qAfter1';
      transitions.qAfter1[symbol] = 'qAfter1';
      transitions.qAfter0[symbol] = 'qAfter1';
      transitions.qReject[symbol] = 'qReject';
    } else if (symbol === '0') {
      transitions.qStart[symbol] = 'qReject';
      transitions.qAfter1[symbol] = 'qAfter0';
      transitions.qAfter0[symbol] = 'qReject';
      transitions.qReject[symbol] = 'qReject';
    } else {
      transitions.qStart[symbol] = 'qAfter1';
      transitions.qAfter1[symbol] = 'qAfter1';
      transitions.qAfter0[symbol] = 'qAfter1';
      transitions.qReject[symbol] = 'qReject';
    }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart', acceptStates: ['qStart', 'qAfter1'],
    description: 'Accepts strings where each 0 is immediately preceded and followed by 1.'
  };
}

function generateEachSurroundedDFA(surroundedSymbol, surroundingSymbol, alphabet) {
  const alphabetArray = alphabet.split('');

  if (surroundedSymbol === surroundingSymbol) {
    const states = ['qAccept', 'qReject'];
    const transitions = { qAccept: {}, qReject: {} };
    alphabetArray.forEach(s => {
      if (s === surroundedSymbol) { transitions.qAccept[s] = 'qReject'; transitions.qReject[s] = 'qReject'; }
      else { transitions.qAccept[s] = 'qAccept'; transitions.qReject[s] = 'qReject'; }
    });
    return {
      states, alphabet: alphabetArray, transitions,
      startState: 'qAccept', acceptStates: ['qAccept'],
      description: `Accepts strings with no '${surroundedSymbol}' (special case).`
    };
  }

  const states = ['qStart', 'qAfterSurrounding', 'qAfterSurrounded', 'qReject'];
  const transitions = { qStart: {}, qAfterSurrounding: {}, qAfterSurrounded: {}, qReject: {} };

  alphabetArray.forEach(symbol => {
    if (symbol === surroundingSymbol) {
      transitions.qStart[symbol] = 'qAfterSurrounding';
      transitions.qAfterSurrounding[symbol] = 'qAfterSurrounding';
      transitions.qAfterSurrounded[symbol] = 'qAfterSurrounding';
      transitions.qReject[symbol] = 'qReject';
    } else if (symbol === surroundedSymbol) {
      transitions.qStart[symbol] = 'qReject';
      transitions.qAfterSurrounding[symbol] = 'qAfterSurrounded';
      transitions.qAfterSurrounded[symbol] = 'qReject';
      transitions.qReject[symbol] = 'qReject';
    } else {
      transitions.qStart[symbol] = 'qAfterSurrounding';
      transitions.qAfterSurrounding[symbol] = 'qAfterSurrounding';
      transitions.qAfterSurrounded[symbol] = 'qAfterSurrounding';
      transitions.qReject[symbol] = 'qReject';
    }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart', acceptStates: ['qStart', 'qAfterSurrounding'],
    description: `Accepts strings where each '${surroundedSymbol}' is immediately preceded and followed by '${surroundingSymbol}'.`
  };
}

function generateExactNAAtLeastMBDFA(symbolA, N, symbolB, M, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = [], transitions = {};
  const stateMap = new Map();
  let stateCounter = 0;

  for (let countB = 0; countB <= M; countB++) {
    for (let countA = 0; countA <= N; countA++) {
      const stateName = `q${stateCounter}`;
      stateMap.set(`${countA},${countB}`, stateName);
      states.push(stateName);
      transitions[stateName] = {};
      stateCounter++;
    }
  }

  const trapState = `q${stateCounter}`;
  states.push(trapState);
  transitions[trapState] = {};

  for (let countB = 0; countB <= M; countB++) {
    for (let countA = 0; countA <= N; countA++) {
      const currentState = stateMap.get(`${countA},${countB}`);
      alphabetArray.forEach(symbol => {
        if (symbol === symbolA) {
          if (countA < N) {
            const nextState = stateMap.get(`${countA + 1},${countB}`);
            transitions[currentState][symbol] = nextState;
          } else transitions[currentState][symbol] = trapState;
        } else if (symbol === symbolB) {
          const newCountB = Math.min(M, countB + 1);
          const nextState = stateMap.get(`${countA},${newCountB}`);
          transitions[currentState][symbol] = nextState;
        } else {
          transitions[currentState][symbol] = currentState;
        }
      });
    }
  }

  alphabetArray.forEach(symbol => { transitions[trapState][symbol] = trapState; });

  const acceptState = stateMap.get(`${N},${M}`);
  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: [acceptState],
    description: `Accepts strings with exactly ${N} '${symbolA}' and at least ${M} '${symbolB}'.`
  };
}

function generateOddPositionsOneDFA(alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['qEven', 'qOdd', 'qReject'];
  const transitions = { qEven: {}, qOdd: {}, qReject: {} };

  alphabetArray.forEach(symbol => {
    if (symbol === '1') {
      transitions.qEven[symbol] = 'qOdd';
      transitions.qOdd[symbol] = 'qEven';
      transitions.qReject[symbol] = 'qReject';
    } else {
      transitions.qEven[symbol] = 'qReject';
      transitions.qOdd[symbol] = 'qReject';
      transitions.qReject[symbol] = 'qReject';
    }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qEven', acceptStates: ['qOdd'],
    description: 'Accepts strings where every odd position is 1 (1-based).'
  };
}

function generateStartParityLengthDFA(startOddSymbol, startEvenSymbol, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = [
    'qStart',
    `q${startOddSymbol}_odd`, `q${startOddSymbol}_even`,
    `q${startEvenSymbol}_odd`, `q${startEvenSymbol}_even`
  ];
  const transitions = {}; states.forEach(s => transitions[s] = {});

  alphabetArray.forEach(sym => {
    if (sym === startOddSymbol) transitions.qStart[sym] = `q${startOddSymbol}_odd`;
    else if (sym === startEvenSymbol) transitions.qStart[sym] = `q${startEvenSymbol}_odd`;
    else transitions.qStart[sym] = 'qStart';
  });

  alphabetArray.forEach(sym => {
    transitions[`q${startOddSymbol}_odd`][sym]   = `q${startOddSymbol}_even`;
    transitions[`q${startOddSymbol}_even`][sym]  = `q${startOddSymbol}_odd`;
    transitions[`q${startEvenSymbol}_odd`][sym]  = `q${startEvenSymbol}_even`;
    transitions[`q${startEvenSymbol}_even`][sym] = `q${startEvenSymbol}_odd`;
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'qStart',
    acceptStates: [`q${startOddSymbol}_odd`, `q${startEvenSymbol}_even`],
    description: `Accepts: starts with '${startOddSymbol}' and odd length, or starts with '${startEvenSymbol}' and even length.`
  };
}

function generateZeroFollowed11DFA(alphabet) {
  // If you had a preset for "0 followed by 11", placeholder retained.
  // Use generateSymbolFollowedByPatternDFA('0','11', alphabet) if needed.
  return generateSymbolFollowedByPatternDFA('0', '11', alphabet);
}

function generateSymbolFollowedByPatternDFA(symbol, pattern, alphabet) {
  const alphabetArray = alphabet.split('');
  const patternLen = pattern.length;
  const states = ['q0'], transitions = { q0: {} };

  for (let i = 1; i <= patternLen; i++) {
    const state = `q${i}`;
    states.push(state);
    transitions[state] = {};
  }
  states.push('qTrap'); transitions['qTrap'] = {};

  alphabetArray.forEach(s => { transitions['q0'][s] = (s === symbol) ? 'q1' : 'q0'; });

  for (let i = 1; i <= patternLen; i++) {
    alphabetArray.forEach(s => {
      if (s === pattern[i - 1]) transitions[`q${i}`][s] = (i === patternLen) ? 'q0' : `q${i + 1}`;
      else transitions[`q${i}`][s] = 'qTrap';
    });
  }
  alphabetArray.forEach(s => { transitions['qTrap'][s] = 'qTrap'; });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: ['q0'],
    description: `Accepts strings where every '${symbol}' is immediately followed by '${pattern}'.`
  };
}

function generateStart10OrEnd0OddLengthDFA(alphabet) {
  const alphabetArray = alphabet.split('');
  const states = ['Q0', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'];
  const transitions = { Q0: {}, Q1: {}, Q2: {}, Q3: {}, Q4: {}, Q5: {}, Q6: {} };

  alphabetArray.forEach(symbol => {
    if (symbol === '0') {
      transitions.Q0[symbol] = 'Q2';
      transitions.Q1[symbol] = 'Q3';
      transitions.Q2[symbol] = 'Q5';
      transitions.Q3[symbol] = 'Q3';
      transitions.Q4[symbol] = 'Q2';
      transitions.Q5[symbol] = 'Q2';
      transitions.Q6[symbol] = 'Q5';
    } else if (symbol === '1') {
      transitions.Q0[symbol] = 'Q1';
      transitions.Q1[symbol] = 'Q4';
      transitions.Q2[symbol] = 'Q4';
      transitions.Q3[symbol] = 'Q3';
      transitions.Q4[symbol] = 'Q6';
      transitions.Q5[symbol] = 'Q6';
      transitions.Q6[symbol] = 'Q4';
    }
  });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'Q0', acceptStates: ['Q2', 'Q3'],
    description: 'Accepts strings starting with 10 or ending with 0 and having odd length.'
  };
}

function generateExactPatternDFA(pattern, alphabet) {
  const alphabetArray = alphabet.split('');
  const states = [], transitions = {};

  for (let i = 0; i <= pattern.length; i++) { states.push(`q${i}`); transitions[`q${i}`] = {}; }
  states.push('qReject'); transitions['qReject'] = {};

  for (let i = 0; i < pattern.length; i++) {
    alphabetArray.forEach(symbol => {
      transitions[`q${i}`][symbol] = (symbol === pattern[i]) ? `q${i + 1}` : 'qReject';
    });
  }
  alphabetArray.forEach(symbol => { transitions[`q${pattern.length}`][symbol] = 'qReject'; });
  alphabetArray.forEach(symbol => { transitions['qReject'][symbol] = 'qReject'; });

  return {
    states, alphabet: alphabetArray, transitions,
    startState: 'q0', acceptStates: [`q${pattern.length}`],
    description: `Accepts strings that exactly match "${pattern}".`
  };
}
