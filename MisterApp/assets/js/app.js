// MisterApp - Main Application (Vercel version)
// Cloudflare Pages version

let selectedSecondary = [];

// Lista degli obiettivi secondari disponibili
window.secondaryObjectives = [
    "Dribbling",
    "Passaggio",
    "Tiro in porta",
    "Contrasto",
    "Heading (gioco di testa)",
    "Transizioni",
    "Possesso palla",
    "Pressing",
    "Cross e finalizzazione",
    "Uscita dal pressing",
    "Lettura dello spazio",
    "Difesa a zona",
    "Difesa a uomo",
    "Sviluppo manovra",
    "Calci piazzati"
];

document.addEventListener('DOMContentLoaded', () => {
    initForm();
    initSecondaryAccordion();
});

function initForm() {
    const form = document.getElementById('training-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const categoria = document.getElementById('categoria')?.value;
        const obiettivoPrimario = document.getElementById('obiettivo-primario')?.value;
        
        if (!categoria || !obiettivoPrimario) {
            showError('Seleziona categoria e obiettivo primario');
            return;
        }
        
        // Show loader
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Genera Seduta';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Generazione in corso...';
        }
        
        try {
            const response = await fetch('/api/genera-seduta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoria: categoria,
                    obiettivoPrimario: obiettivoPrimario,
                    obiettiviSecondari: selectedSecondary
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Errore nella generazione');
            }
            
            // Save to sessionStorage
            sessionStorage.setItem('currentSeduta', JSON.stringify(data.seduta));
            
            // Redirect to seduta page
            window.location.href = '/seduta.html';
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'Errore durante la generazione. Riprova.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
}

function initSecondaryAccordion() {
    const header = document.getElementById('secondary-header');
    const content = document.getElementById('secondary-content');
    const chipsContainer = document.getElementById('secondary-chips');
    
    if (!header || !content) return;
    
    // Accordion toggle
    header.addEventListener('click', () => {
        content.classList.toggle('hidden');
    });
    
    // Load chips if container exists
    if (chipsContainer && window.secondaryObjectives) {
        renderChips(chipsContainer, window.secondaryObjectives);
    }
}

function renderChips(container, objectives) {
    container.innerHTML = '';
    
    objectives.forEach(obj => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.textContent = obj;
        chip.addEventListener('click', () => toggleChip(chip, obj));
        container.appendChild(chip);
    });
    
    updateSelectedSummary();
}

function toggleChip(chip, value) {
    chip.classList.toggle('selected');
    
    if (chip.classList.contains('selected')) {
        if (!selectedSecondary.includes(value)) {
            selectedSecondary.push(value);
        }
    } else {
        selectedSecondary = selectedSecondary.filter(v => v !== value);
    }
    
    updateSelectedSummary();
}

function updateSelectedSummary() {
    const summary = document.getElementById('selected-summary');
    if (!summary) return;
    
    if (selectedSecondary.length === 0) {
        summary.innerHTML = '<span class="text-gray-500">Nessun obiettivo secondario selezionato</span>';
        return;
    }
    
    summary.innerHTML = `
        <div class="flex flex-wrap gap-2">
            ${selectedSecondary.map(v => `<span class="chip selected small">${v}</span>`).join('')}
        </div>
    `;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    } else {
        alert(message);
    }
}

// Modal resources functions
window.openResourcesModal = async () => {
    const modal = document.getElementById('resources-modal');
    if (!modal) return;
    
    modal.classList.remove('hidden');
    
    const contentDiv = document.getElementById('resources-content');
    if (contentDiv) {
        contentDiv.innerHTML = '<p class="text-center">🔍 Ricerca risorse in corso...</p>';
    }
    
    try {
        const response = await fetch('/api/cerca-risorse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: 'esercizi calcio allenamento' })
        });
        
        const data = await response.json();
        
        if (data.success && contentDiv) {
            let html = '';
            
            if (data.links && data.links.length > 0) {
                html += '<h3 class="font-bold mt-2 mb-2">📚 Link utili</h3><ul class="list-disc pl-5">';
                data.links.forEach(link => {
                    html += `<li class="mb-1"><a href="${link.url}" target="_blank" class="text-accent hover:underline">${link.title || link.url}</a></li>`;
                });
                html += '</ul>';
            }
            
            if (data.images && data.images.length > 0) {
                html += '<h3 class="font-bold mt-4 mb-2">🖼️ Immagini e schemi</h3><div class="grid grid-cols-2 gap-2">';
                data.images.forEach(img => {
                    html += `<img src="${img}" class="rounded border border-gray-300 p-1" alt="Schema" loading="lazy">`;
                });
                html += '</div>';
            }
            
            if (!data.links?.length && !data.images?.length) {
                html = '<p>Nessuna risorsa trovata.</p>';
            }
            
            contentDiv.innerHTML = html;
        } else if (contentDiv) {
            contentDiv.innerHTML = '<p>Errore nel caricamento delle risorse. Riprova.</p>';
        }
    } catch (error) {
        console.error('Resources error:', error);
        if (contentDiv) {
            contentDiv.innerHTML = '<p>Errore nel caricamento delle risorse. Riprova.</p>';
        }
    }
};

window.closeResourcesModal = () => {
    const modal = document.getElementById('resources-modal');
    if (modal) modal.classList.add('hidden');
};