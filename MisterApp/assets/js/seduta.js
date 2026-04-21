// MisterApp - Seduta Page (Vercel version)
// Visualizzazione seduta con tutti i campi

let currentSeduta = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSeduta();
    initDownloadButton();
});

function loadSeduta() {
    const stored = sessionStorage.getItem('currentSeduta');
    
    if (!stored) {
        showError('Nessuna seduta trovata. Torna alla home e genera una nuova seduta.');
        return;
    }
    
    try {
        currentSeduta = JSON.parse(stored);
        renderSeduta(currentSeduta);
    } catch (e) {
        showError('Errore nel caricamento della seduta');
    }
}

function renderSeduta(seduta) {
    // Render Attivazione
    renderSection('attivazione', seduta.attivazione);
    
    // Render Esercitazione 1
    renderSection('esercitazione1', seduta.esercitazione1);
    
    // Render Esercitazione 2
    renderSection('esercitazione2', seduta.esercitazione2);
    
    // Render Partita a tema
    renderSection('partita', seduta.partita);
    
    // Draw canvas for each section if canvas.js is available
    if (typeof drawCanvas === 'function') {
        setTimeout(() => {
            if (seduta.attivazione?.schema) drawCanvas('canvas-attivazione', seduta.attivazione.schema);
            if (seduta.esercitazione1?.schema) drawCanvas('canvas-esercitazione1', seduta.esercitazione1.schema);
            if (seduta.esercitazione2?.schema) drawCanvas('canvas-esercitazione2', seduta.esercitazione2.schema);
            if (seduta.partita?.schema) drawCanvas('canvas-partita', seduta.partita.schema);
        }, 100);
    }
}

function renderSection(sectionId, data) {
    const container = document.getElementById(sectionId);
    if (!container || !data) return;
    
    const duration = data.durata || 0;
    const name = data.nome || 'Esercizio';
    const description = data.descrizione || 'Descrizione non disponibile';
    const materials = data.materiali || 'Materiali non specificati';
    const rules = data.regole || 'Regole non specificate';
    const variants = data.varianti || 'Varianti non specificate';
    const obiettivoAtletico = data.obiettivoAtletico || 'Non specificato';
    const obiettivoPsicologico = data.obiettivoPsicologico || 'Non specificato';
    const progressioneDifficolta = data.progressioneDifficolta || 'Non specificata';
    
    container.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
            <div class="flex justify-between items-center mb-3 border-b pb-2">
                <h3 class="text-xl font-bold text-primary">${escapeHtml(name)}</h3>
                <span class="bg-secondary text-white px-3 py-1 rounded-full text-sm">${duration}'</span>
            </div>
            
            <div class="mb-3">
                <p class="text-gray-700">${escapeHtml(description)}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div class="bg-green-50 p-2 rounded">
                    <h4 class="font-semibold text-secondary">💪 Obiettivo Atletico</h4>
                    <p class="text-gray-700 text-sm">${escapeHtml(obiettivoAtletico)}</p>
                </div>
                <div class="bg-blue-50 p-2 rounded">
                    <h4 class="font-semibold text-primary">🧠 Obiettivo Psicologico</h4>
                    <p class="text-gray-700 text-sm">${escapeHtml(obiettivoPsicologico)}</p>
                </div>
            </div>
            
            <div class="mb-3">
                <h4 class="font-semibold text-primary">Materiali:</h4>
                <p class="text-gray-700">${escapeHtml(materials)}</p>
            </div>
            
            <div class="mb-3">
                <h4 class="font-semibold text-primary">Regole:</h4>
                <p class="text-gray-700">${escapeHtml(rules)}</p>
            </div>
            
            <div class="mb-3">
                <h4 class="font-semibold text-primary">Varianti:</h4>
                <p class="text-gray-700">${escapeHtml(variants)}</p>
            </div>
            
            <div class="mb-3 bg-yellow-50 p-2 rounded">
                <h4 class="font-semibold text-yellow-700">📈 Progressione di difficoltà</h4>
                <p class="text-gray-700 text-sm">${escapeHtml(progressioneDifficolta)}</p>
            </div>
            
            <div class="mt-4">
                <h4 class="font-semibold text-primary mb-2">Schema tattico:</h4>
                <canvas id="canvas-${sectionId}" class="w-full border border-gray-300 rounded bg-gray-50" width="400" height="300" style="max-width:100%; height:auto; background:#f9f9f9"></canvas>
                <p class="text-xs text-gray-400 mt-1 text-center">${escapeHtml(data.schema || 'Schema indicativo - campo da calcio')}</p>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initDownloadButton() {
    const btn = document.getElementById('download-pdf');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        if (!currentSeduta) {
            alert('Nessuna seduta da scaricare');
            return;
        }
        downloadPDF();
    });
}

function downloadPDF() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        alert('Libreria PDF non caricata. Riprova tra un momento.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(15, 32, 39);
    doc.text('MisterApp - Scheda Allenamento', 20, y);
    y += 15;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Attivazione
    if (currentSeduta.attivazione) {
        y = addSectionToPDF(doc, 'ATTIVAZIONE', currentSeduta.attivazione, y);
    }
    
    // Esercitazione 1
    if (currentSeduta.esercitazione1) {
        y = addSectionToPDF(doc, 'ESERCITAZIONE 1', currentSeduta.esercitazione1, y);
    }
    
    // Esercitazione 2
    if (currentSeduta.esercitazione2) {
        y = addSectionToPDF(doc, 'ESERCITAZIONE 2', currentSeduta.esercitazione2, y);
    }
    
    // Partita
    if (currentSeduta.partita) {
        y = addSectionToPDF(doc, 'PARTITA A TEMA', currentSeduta.partita, y);
    }
    
    // Save
    doc.save('seduta-allenamento.pdf');
}

function addSectionToPDF(doc, title, data, startY) {
    let y = startY;
    
    if (y > 250) {
        doc.addPage();
        y = 20;
    }
    
    doc.setFontSize(14);
    doc.setTextColor(0, 176, 155);
    doc.text(title, 20, y);
    y += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Nome: ${data.nome || '-'} (${data.durata || 0} minuti)`, 20, y);
    y += 7;
    
    doc.text('Descrizione:', 20, y);
    y += 5;
    const descLines = doc.splitTextToSize(data.descrizione || '-', 170);
    doc.text(descLines, 25, y);
    y += (descLines.length * 5) + 3;
    
    doc.text('Obiettivo Atletico:', 20, y);
    y += 5;
    const atlLines = doc.splitTextToSize(data.obiettivoAtletico || '-', 170);
    doc.text(atlLines, 25, y);
    y += (atlLines.length * 5) + 3;
    
    doc.text('Obiettivo Psicologico:', 20, y);
    y += 5;
    const psiLines = doc.splitTextToSize(data.obiettivoPsicologico || '-', 170);
    doc.text(psiLines, 25, y);
    y += (psiLines.length * 5) + 3;
    
    doc.text('Materiali:', 20, y);
    y += 5;
    const matLines = doc.splitTextToSize(data.materiali || '-', 170);
    doc.text(matLines, 25, y);
    y += (matLines.length * 5) + 3;
    
    doc.text('Regole:', 20, y);
    y += 5;
    const ruleLines = doc.splitTextToSize(data.regole || '-', 170);
    doc.text(ruleLines, 25, y);
    y += (ruleLines.length * 5) + 3;
    
    doc.text('Varianti:', 20, y);
    y += 5;
    const varLines = doc.splitTextToSize(data.varianti || '-', 170);
    doc.text(varLines, 25, y);
    y += (varLines.length * 5) + 3;
    
    doc.text('Progressione difficoltà:', 20, y);
    y += 5;
    const progLines = doc.splitTextToSize(data.progressioneDifficolta || '-', 170);
    doc.text(progLines, 25, y);
    y += (progLines.length * 5) + 12;
    
    return y;
}

function showError(message) {
    const container = document.getElementById('seduta-container');
    if (container) {
        container.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>Errore:</strong> ${escapeHtml(message)}
                <div class="mt-4">
                    <a href="/" class="bg-primary text-white px-4 py-2 rounded hover:opacity-90">Torna alla Home</a>
                </div>
            </div>
        `;
    }
}