// State Management
let state = {
    numVectors: 0,
    lenVectors: 0,
    numVectorsDisp: 0,
    lenVectorsDisp: 0, // Keep track for UI generation
    vectors: []
};
const API = {
    post: async (endpoint, data) => {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};
// DOM Elements
const els = {
    steps: {
        config: document.getElementById('step-config'),
        vectors: document.getElementById('step-vectors'),
        matrix: document.getElementById('step-matrix'),
        rank: document.getElementById('step-rank'),
        indep: document.getElementById('step-independence'),
        relation: document.getElementById('step-relation'),
        viz: document.getElementById('step-viz')
    },
    inputs: {
        k: document.getElementById('num-vectors'),
        n: document.getElementById('len-vectors')
    },
    containers: {
        vectors: document.getElementById('vector-inputs-container'),
        matrix: document.getElementById('matrix-input-container'),
        relation: document.getElementById('relation-inputs-container')
    },
    btns: {
        start: document.getElementById('btn-start-vectors'),
        submitVectors: document.getElementById('btn-submit-vectors'),
        checkMatrix: document.getElementById('btn-check-matrix'),
        checkRank: document.getElementById('btn-check-rank'),
        checkRelation: document.getElementById('btn-check-relation'),
        relationNext: document.getElementById('btn-next-relation')
    },
    feedback: {
        matrix: document.getElementById('matrix-feedback'),
        rank: document.getElementById('rank-feedback'),
        indep: document.getElementById('indep-feedback'),
        relation: document.getElementById('relation-feedback')
    },
    score: document.getElementById('marks-value')
};
// Utils
function showStep(el) {
    // Hide all step cards first to make it a singular slide section
    document.querySelectorAll('.step-card').forEach(card => {
        card.classList.add('hidden');
    });
    
    // Show the requested step card
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function updateScore(score) {
    els.score.innerText = score;
    els.score.parentElement.style.transform = 'scale(1.1)';
    setTimeout(() => els.score.parentElement.style.transform = 'scale(1)', 200);
}
function showError(el, msg, step = null) {
    el.innerHTML = `<span class="feedback-error"> ${msg}</span>`;
    if (step) {
        let btn = document.createElement('button');
        btn.className = 'btn-hint';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px; vertical-align:middle;"><path d="M9 18h6m-5 3h4m1-7.08c1.32-.9 2-2.38 2-3.92a6 6 0 10-12 0c0 1.54.68 3.02 2 3.92V17a1 1 0 001 1h6a1 1 0 001-1v-3.08z"/></svg> Get Hint';
        btn.onclick = () => {
            btn.remove();
            getHint(step, el);
        };
        el.appendChild(btn);
    }
}
async function getHint(step, feedbackEl) {
    let res = await API.post('get_hint', { step: step });
    if (res.hint) {
        let hintBox = document.createElement('div');
        hintBox.className = 'hint-box active';
        hintBox.innerHTML = `
            <div class="hint-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6m-5 3h4m1-7.08c1.32-.9 2-2.38 2-3.92a6 6 0 10-12 0c0 1.54.68 3.02 2 3.92V17a1 1 0 001 1h6a1 1 0 001-1v-3.08z"/></svg>
                <span>HINT</span>
            </div>
            <div class="hint-text">${res.hint}</div>
        `;
        feedbackEl.appendChild(hintBox);
    }
}
function showSuccess(el, msg) {
    el.innerHTML = `<span class="feedback-success"> ${msg}</span>`;
}
function showRestartButton(containerEl) {
    if (document.getElementById('btn-restart-lab')) return;
    
    // Check if we can visualize (2D or 3D)
    if (state.lenVectors >= 2 && state.lenVectors <= 3) {
        let vizBtn = document.createElement('button');
        vizBtn.id = 'btn-show-viz';
        vizBtn.className = 'btn-primary';
        vizBtn.style.marginTop = '20px';
        vizBtn.style.width = '100%';
        vizBtn.style.padding = '1rem';
        vizBtn.style.fontSize = '1.1rem';
        vizBtn.style.boxShadow = '0 0 15px var(--primary-color)';
        vizBtn.innerText = 'Graphical Representation';
        vizBtn.onclick = () => {
            vizBtn.disabled = true;
            vizBtn.style.opacity = '0.5';
            vizBtn.style.cursor = 'not-allowed';
            visualizeVectors(state.vectors);
            setTimeout(() => {
                document.getElementById('step-viz').scrollIntoView({ behavior: 'smooth' });
            }, 100);
        };
        containerEl.appendChild(vizBtn);
    }

    let btn = document.createElement('button');
    btn.id = 'btn-restart-lab';
    btn.className = 'btn-primary';
    btn.style.marginTop = '10px';
    btn.style.width = '100%';
    btn.style.padding = '1rem';
    btn.style.fontSize = '1.1rem';
    btn.style.boxShadow = '0 0 15px var(--primary-color)';
    btn.innerText = 'Solve Another Question';
    btn.onclick = () => window.location.reload();
    containerEl.appendChild(btn);
}

function visualizeVectors(vectors) {
    const n = state.lenVectors;
    const k = state.numVectors;
    const plotEl = document.getElementById('vector-plot');
    const msgEl = document.getElementById('viz-message');
    
    els.steps.viz.classList.remove('hidden');
    
    if (n < 2 || n > 3) {
        plotEl.classList.add('hidden');
        msgEl.classList.remove('hidden');
        return;
    }
    
    plotEl.classList.remove('hidden');
    msgEl.classList.add('hidden');
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#f8fafc' : '#1e293b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    
    let data = [];
    
    vectors.forEach((vec, i) => {
        const color = colors[i % colors.length];
        if (n === 2) {
            // 2D Plot
            data.push({
                x: [0, vec[0]],
                y: [0, vec[1]],
                mode: 'lines+markers',
                type: 'scatter',
                name: `v${i+1}`,
                line: { color: color, width: 4 },
                marker: { size: 8, symbol: 'arrow-bar-up', angleref: 'previous' }
            });
        } else {
            // 3D Plot
            data.push({
                x: [0, vec[0]],
                y: [0, vec[1]],
                z: [0, vec[2]],
                mode: 'lines+markers',
                type: 'scatter3d',
                name: `v${i+1}`,
                line: { color: color, width: 6 },
                marker: { size: 4 }
            });
        }
    });

    const layout = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { l: 50, r: 30, b: 50, t: 50 },
        showlegend: true,
        legend: { font: { color: textColor } },
        scene: {
            xaxis: { gridcolor: gridColor, zerolinecolor: textColor, color: textColor, title: 'X', showticklabels: true },
            yaxis: { gridcolor: gridColor, zerolinecolor: textColor, color: textColor, title: 'Y', showticklabels: true },
            zaxis: { gridcolor: gridColor, zerolinecolor: textColor, color: textColor, title: 'Z', showticklabels: true }
        },
        xaxis: { gridcolor: gridColor, zerolinecolor: textColor, color: textColor, title: 'X', showticklabels: true },
        yaxis: { gridcolor: gridColor, zerolinecolor: textColor, color: textColor, title: 'Y', showticklabels: true }
    };
    
    const config = { responsive: true, displayModeBar: false };
    
    Plotly.newPlot('vector-plot', data, layout, config);
}
// 1. Config
if (els.btns.start) {
els.btns.start.addEventListener('click', async () => {
    let k = parseInt(els.inputs.k.value);
    let n = parseInt(els.inputs.n.value);
        if (k > 0 && n > 0) {
        state.numVectors = k;
        state.lenVectors = n;
        await API.post('init', { k: k, n: n });
        // Generate Inputs
        els.containers.vectors.innerHTML = '';
        for (let i = 0; i < k; i++) {
            const row = document.createElement('div');
            row.className = 'vec-input-row';
            row.innerHTML = `<span class="vec-label">Vector ${i + 1}:</span>`;
            for (let j = 0; j < n; j++) {
                row.innerHTML += `<input type="number" step="any" class="vec-val"
data-v="${i}" data-idx="${j}" placeholder="x${j + 1}">`;
            }
            els.containers.vectors.appendChild(row);
        }
        showStep(els.steps.vectors);
        els.btns.start.disabled = true;
        els.btns.start.style.opacity = '0.5';
        els.btns.start.style.cursor = 'not-allowed';
    }
});
// 2. Submit Vectors
els.btns.submitVectors.addEventListener('click', async () => {
    // Collect vectors
    let vectors = Array(state.numVectors).fill().map(() =>
        Array(state.lenVectors).fill(0));
    let inputs = document.querySelectorAll('.vec-val');
    let valid = true;
    inputs.forEach(inp => {
        let val = parseFloat(inp.value);
        if (isNaN(val)) valid = false;
        let v = parseInt(inp.dataset.v);
        let idx = parseInt(inp.dataset.idx);
        vectors[v][idx] = val;
    });
    if (!valid) {
        alert("Please enter valid numbers.");
        return;
    }
    // Send to API
    await API.post('submit_vectors', { vectors: vectors });
    
    // Store in state to visualize later
    state.vectors = vectors;

    // Setup Matrix Grid
    els.containers.matrix.style.gridTemplateColumns = `repeat(${state.numVectors}, minmax(80px, 1fr))`;
    els.containers.matrix.innerHTML = '';
    for (let r = 0; r < state.lenVectors; r++) {
        for (let c = 0; c < state.numVectors; c++) {
            let inp = document.createElement('input');
            inp.type = 'number';
            inp.className = 'matrix-cell';
            inp.dataset.r = r;
            inp.dataset.c = c;
            els.containers.matrix.appendChild(inp);
        }
    }
    // Setup complete - advance to Matrix step automatically
    showStep(els.steps.matrix);
    els.btns.submitVectors.disabled = true;
    els.btns.submitVectors.style.opacity = '0.5';
    els.btns.submitVectors.style.cursor = 'not-allowed';
});
// 3. Check Matrix
els.btns.checkMatrix.addEventListener('click', async () => {
    // Disable button immediately to prevent double clicks
    els.btns.checkMatrix.disabled = true;
    // Build user matrix
    let matrix = [];
    for (let r = 0; r < state.lenVectors; r++) {
        let row = [];
        for (let c = 0; c < state.numVectors; c++) {
            let val =
                parseFloat(document.querySelector(`.matrix-cell[data-r="${r}"][data-c="${c}"]`).value);
            row.push(isNaN(val) ? 0 : val);
        }
        matrix.push(row);
    }
    let res = await API.post('check_matrix', { matrix: matrix });
    // Disable inputs
    document.querySelectorAll('.matrix-cell').forEach(inp => inp.disabled = true);
    if (res.correct) {
        showSuccess(els.feedback.matrix, "Correct! Matrix A captured.");
        updateScore(res.score);
        els.btns.checkMatrix.classList.add('hidden');
    } else {
        if (res.show_answer) {
            showError(els.feedback.matrix, res.message);
            let expected = res.expected;
            for (let r = 0; r < state.lenVectors; r++) {
                for (let c = 0; c < state.numVectors; c++) {
                    let cell = document.querySelector(`.matrix-cell[data-r="${r}"][data-c="${c}"]`);
                    cell.value = expected[r][c];
                    cell.style.borderColor = 'var(--primary-color)';
                }
            }
            els.btns.checkMatrix.classList.add('hidden');
        } else {
            showError(els.feedback.matrix, res.message, 'matrix');
            // Re-enable inputs for second try
            document.querySelectorAll('.matrix-cell').forEach(inp => inp.disabled = false);
            els.btns.checkMatrix.disabled = false;
        }
    }
});
// 4. Check Rank
els.btns.checkRank.addEventListener('click', async () => {
    // Disable immediate
    els.btns.checkRank.disabled = true;
    let r = parseInt(document.getElementById('input-rank').value);
    let res = await API.post('check_rank', { rank: r });
    document.getElementById('input-rank').disabled = true;
    if (res.correct) {
        showSuccess(els.feedback.rank, "Correct Rank!");
        state.rank = res.rank; 
        updateScore(res.score);
        els.btns.checkRank.classList.add('hidden');
    } else {
        if (res.show_answer) {
            showError(els.feedback.rank, res.message);
            state.rank = res.expected; 
            if (res.ref_matrix) {
                let matDiv = document.createElement('div');
                matDiv.style.marginTop = '10px';
                matDiv.innerHTML = "<strong>Row Echelon Form:</strong><br>";
                let table = document.createElement('div');
                table.style.display = 'grid';
                table.style.gap = '5px';
                table.style.gridTemplateColumns = `repeat(${state.numVectors}, 50px)`;
                res.ref_matrix.forEach(row => {
                    row.forEach(val => {
                        let cell = document.createElement('div');
                        cell.textContent = val;
                        cell.style.background = 'rgba(255,255,255,0.1)';
                        cell.style.padding = '5px';
                        table.appendChild(cell);
                    });
                });
                matDiv.appendChild(table);
                els.feedback.rank.appendChild(matDiv);
            }
            let stepsDiv = document.createElement('div');
            stepsDiv.className = 'steps-box';
            stepsDiv.innerHTML = "<strong>Solution Steps:</strong><br>" + res.steps.join('<br>');
            els.feedback.rank.appendChild(stepsDiv);
            els.btns.checkRank.classList.add('hidden');
        } else {
            showError(els.feedback.rank, res.message, 'rank');
            document.getElementById('input-rank').disabled = false;
            els.btns.checkRank.disabled = false;
        }
    }
});
// 5. Independence
let indepChoice = null;
document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        // If already selected/disabled, return
        if (document.querySelector('.choice-btn.disabled')) return;
        document.querySelectorAll('.choice-btn').forEach(b =>
            b.classList.remove('selected'));
        btn.classList.add('selected');
        indepChoice = btn.dataset.choice;
        // Disable buttons
        document.querySelectorAll('.choice-btn').forEach(b => {
            b.classList.add('disabled');
            b.style.pointerEvents = 'none';
        });
        let res = await API.post('check_independence', { choice: indepChoice });
        // Construct detailed reason
        let rankVal = state.rank || "known";
        let reason = res.is_independent
            ? `Because Rank (${rankVal}) = Number of Vectors (${state.numVectors})`
            : `Because Rank (${rankVal}) < Number of Vectors (${state.numVectors})`;
        
        if (res.correct) {
            updateScore(res.score);
            showSuccess(els.feedback.indep, `Correct! ${reason}`);
        } else {
            if (res.show_answer) {
                showError(els.feedback.indep, `Incorrect. It is actually ${res.is_independent ? 'Independent' : 'Dependent'}. <br>${reason}`);
            } else {
                showError(els.feedback.indep, `Wrong guess. Try again or get a hint!`, 'indep');
                // Re-enable buttons for the second chance
                document.querySelectorAll('.choice-btn').forEach(b => {
                    b.classList.remove('disabled', 'selected');
                    b.style.pointerEvents = 'auto';
                });
                return; // Wait for second click
            }
        }
        // Always proceed logic
        if (!res.is_independent) {
            // Logic says Dependent (either user guessed right or we corrected them)
            // Show relation step IF the vectors are confirmed dependent, regardless of user choice
            setTimeout(() => {
                prepareRelationStep();
                if (els.btns.relationNext) {
                    els.btns.relationNext.classList.remove('hidden');
                }
            }, 1000);
        } else {
            // Logic says Independent
            setTimeout(() => {
                let msg = document.createElement('div');
                msg.innerHTML = "<em>Since vectors are Independent, the only solution is trivial(all c = 0).</em> ";
                msg.style.color = '#aaa';
                els.feedback.indep.appendChild(msg);
                showRestartButton(els.feedback.indep);
            }, 1000);
        }
    });
});
function prepareRelationStep() {
    els.containers.relation.innerHTML = '';
    for (let i = 0; i < state.numVectors; i++) {
        els.containers.relation.innerHTML += `
 <input type="number" class="coeff-input" data-idx="${i}"
placeholder="c${i + 1}">
 <span>v${i + 1} ${i < state.numVectors - 1 ? '+' : '= 0'}</span>
 `;
    }
}
// 6. Check Relation
els.btns.checkRelation.addEventListener('click', async () => {
    let inputs = document.querySelectorAll('.coeff-input');
    let coeffs = [];
    inputs.forEach(inp => coeffs.push(parseFloat(inp.value) || 0));
    // Disable
    inputs.forEach(inp => inp.disabled = true);
    let res = await API.post('check_relation', { coeffs: coeffs });
    if (res.correct) {
        showSuccess(els.feedback.relation, "Correct Relation!");
        updateScore(res.score);
        showRestartButton(els.feedback.relation);
    } else {
        if (res.show_answer) {
            showError(els.feedback.relation, "Mistakes were made. Here is the solution:");
            let container = document.createElement('div');
            container.style.marginTop = '15px';
            container.className = 'explanation-box';
            if (res.explanation) {
                container.innerHTML = "<h3>Step-by-Step Solution:</h3>";
                res.explanation.forEach(item => {
                    let div = document.createElement('div');
                    div.style.marginBottom = '8px';
                    if (typeof item === 'string') {
                        div.innerHTML = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        container.appendChild(div);
                    } else if (item.type === 'matrix') {
                        let table = document.createElement('div');
                        table.style.display = 'grid';
                        table.style.gap = '2px';
                        let cols = item.content[0].length;
                        table.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                        table.style.maxWidth = '300px';
                        table.style.margin = '10px 0';
                        table.style.background = 'rgba(255,255,255,0.05)';
                        table.style.padding = '10px';
                        table.style.borderRadius = '8px';
                        item.content.forEach(row => {
                            row.forEach(val => {
                                let cell = document.createElement('div');
                                cell.textContent = val;
                                cell.style.textAlign = 'center';
                                cell.style.fontFamily = 'monospace';
                                table.appendChild(cell);
                            });
                        });
                        container.appendChild(table);
                    } else if (item.type === 'list') {
                        let ul = document.createElement('ul');
                        ul.style.paddingLeft = '20px';
                        item.content.forEach(liText => {
                            let li = document.createElement('li');
                            li.innerHTML = liText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            ul.appendChild(li);
                        })
                        container.appendChild(ul);
                    }
                });
            }
            els.feedback.relation.appendChild(container);
            showRestartButton(els.feedback.relation);
        } else {
            showError(els.feedback.relation, res.message, 'relation');
            // Re-enable
            inputs.forEach(inp => inp.disabled = false);
            els.btns.checkRelation.disabled = false;
        }
    }
});
} // End if (els.btns.start)

// --- Theme Switcher Logic ---
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);
if (toggleSwitch) {
    toggleSwitch.checked = (currentTheme === 'light');
}

if (toggleSwitch) {
    toggleSwitch.addEventListener('change', function(e) {
        const theme = e.target.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Re-render the plot if it is already visible to update colors
        if (state.vectors && state.vectors.length > 0 && els.steps.viz && !els.steps.viz.classList.contains('hidden')) {
            visualizeVectors(state.vectors);
        }
    });
}

// --- END Theme Switcher Logic ---

// --- Floating Math Symbols Logic ---
const mathSymbols = ['∫', '∑', '∏', '√', '∞', '≈', '≠', '≡', '≤', '≥', 'π', 'θ', 'λ', 'μ', 'Δ', '∇', '∂', '∈', '∉', '⊂', '∪', '∩'];
const mathBackground = document.getElementById('math-background');

function createMathSymbol() {
    if (!mathBackground) return;
    const symbol = document.createElement('div');
    symbol.classList.add('math-symbol');
    symbol.innerText = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
    
    const colors = [
        'var(--sym-1)',
        'var(--sym-2)',
        'var(--sym-3)',
        'var(--sym-4)',
        'var(--sym-5)'
    ];
    
    const leftPos = Math.random() * 100;
    const animationDuration = 15 + Math.random() * 20;
    const fontSize = 1 + Math.random() * 2.5;
    const delay = Math.random() * 20;
    
    symbol.style.left = `${leftPos}vw`;
    symbol.style.animationDuration = `${animationDuration}s`;
    symbol.style.animationDelay = `-${delay}s`;
    symbol.style.fontSize = `${fontSize}rem`;
    symbol.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    mathBackground.appendChild(symbol);
}

const numSymbols = 40;
for (let i = 0; i < numSymbols; i++) {
    createMathSymbol();
}

// --- Free Slide Navigation Logic ---
document.querySelectorAll('.btn-next-slide').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Prevent form submission or accidental API calls
        e.preventDefault();
        
        const nextId = e.target.getAttribute('data-next');
        const nextEl = document.getElementById(nextId);
        
        if (nextEl) {
            showStep(nextEl);
        }
    });
});

// --- Dropdown Click Logic ---
document.addEventListener('click', function(e) {
    let btn = e.target.closest('.nav-avatar-btn');
    if (btn) {
        let dropdown = btn.nextElementSibling;
        if (dropdown && dropdown.classList.contains('dropdown-content')) {
            dropdown.classList.toggle('show');
        }
        return;
    }
    
    if (!e.target.closest('.dropdown-content')) {
        document.querySelectorAll('.dropdown-content.show').forEach(dd => {
            dd.classList.remove('show');
        });
    }
});