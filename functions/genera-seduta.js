// MisterApp - Genera Seduta API (Cloudflare Pages version)
// Primary: Groq (llama-3.3-70b-versatile)
// Fallback: Gemini 2.5 Flash-Lite

export async function onRequest(context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    // Handle preflight
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }
    
    // Only POST allowed
    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers
        });
    }
    
    try {
        const body = await context.request.json();
        const { categoria, obiettivoPrimario, obiettiviSecondari } = body;
        
        // Validate required fields
        if (!categoria || !obiettivoPrimario) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Categoria e obiettivo primario sono obbligatori'
            }), { status: 400, headers });
        }
        
        // Build prompt
        const prompt = buildPrompt(categoria, obiettivoPrimario, obiettiviSecondari || []);
        
        // Try Groq first
        let result = null;
        let error = null;
        
        try {
            result = await callGroq(prompt, context.env.GROQ_API_KEY);
        } catch (e) {
            error = e;
            console.error('Groq failed:', e.message);
        }
        
        // Fallback to Gemini if Groq fails
        if (!result) {
            try {
                result = await callGemini(prompt, context.env.GEMINI_API_KEY);
            } catch (e) {
                error = e;
                console.error('Gemini failed:', e.message);
            }
        }
        
        if (!result) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Entrambi i servizi AI non sono riusciti a generare la seduta. Riprova.'
            }), { status: 500, headers });
        }
        
        // Parse and validate result
        const seduta = parseSeduta(result);
        
        return new Response(JSON.stringify({
            success: true,
            seduta: seduta
        }), { status: 200, headers });
        
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Errore interno del server'
        }), { status: 500, headers });
    }
}

function buildPrompt(categoria, obiettivoPrimario, obiettiviSecondari) {
    let secondariText = '';
    if (obiettiviSecondari.length > 0) {
        secondariText = `\nObiettivi secondari: ${obiettiviSecondari.join(', ')}`;
    }
    
    return `Sei un allenatore di calcio di livello mondiale, con 20+ anni di esperienza. 
Unisci la saggezza del calcio italiano tradizionale ai concetti moderni di occupazione spazi e principi posizionali.
Per i più piccoli (Pulcini, Esordienti) privilegia gioco e divertimento. Per i più grandi (Giovanissimi, Allievi, Prima Squadra) enfatizza tattica e intensità.

Categoria: ${categoria}
Obiettivo primario: ${obiettivoPrimario}${secondariText}

LINEE GUIDA PER CATEGORIA:
- PULCINI (U8-U10): esercizi brevi (max 6 minuti per blocco), tanta pausa attiva, ludicità, motricità di base
- ESORDIENTI (U11-U13): tecnica individuale, primi principi tattici, competitività sana
- GIOVANISSIMI (U14-U16): tattica di squadra, preparazione atletica base, intensità media
- ALLIEVI (U17-U19): sistemi di gioco, intensità alta, gestione partita
- PRIMA SQUADRA: performance, lettura di gioco, gestione pressione, recuperi

Genera una seduta di allenamento della durata totale di 1 ora e 45 minuti (105 minuti).

Struttura in 4 fasi:
1. ATTIVAZIONE (20 minuti) - Riscaldamento dinamico + attivazione neuromuscolare
2. ESERCITAZIONE 1 (25 minuti) - Esercizio tecnico-tattico a difficoltà crescente
3. ESERCITAZIONE 2 (30 minuti) - Situazione di gioco condizionata
4. PARTITA A TEMA (30 minuti) - Partita con regole legate agli obiettivi

Per OGNI fase, fornisci esattamente questi campi:

- nome: nome dell'esercizio (creativo ma chiaro)
- durata: numero intero di minuti
- descrizione: spiegazione dettagliata (come si svolge, disposizione in campo)
- materiali: elenco preciso (palloni, coni, pettorine, porte, etc.)
- regole: regole specifiche dell'esercizio
- varianti: 2-3 varianti per alzare/abbassare difficoltà
- obiettivoAtletico: cosa si allena fisicamente (es. accelerazioni, cambi direzione, resistenza, esplosività)
- obiettivoPsicologico: aspetto mentale (es. concentrazione, fiducia, leadership, gestione errore, comunicazione)
- progressioneDifficolta: come rendere l'esercizio più facile (per principianti) o più difficile (per avanzati)
- schema: descrizione testuale del posizionamento in campo (es. "Quadrato 20x20, 4 coni ai vertici, giocatori divisi equamente")
- schemaCanvas: oggetto JSON con questo formato {"tipo": "quadrato", "dimensioni": "20x20", "elementi": ["4 coni", "1 pallone al centro", "8 giocatori"]}

Tutti i contenuti devono essere adattati ALLA CATEGORIA ${categoria}.

RISPOSTA: Solo un oggetto JSON valido, senza testo prima o dopo. Nessun messaggio introduttivo.

Formato JSON richiesto:
{
  "attivazione": {
    "nome": "",
    "durata": 20,
    "descrizione": "",
    "materiali": "",
    "regole": "",
    "varianti": "",
    "obiettivoAtletico": "",
    "obiettivoPsicologico": "",
    "progressioneDifficolta": "",
    "schema": "",
    "schemaCanvas": {"tipo": "", "dimensioni": "", "elementi": []}
  },
  "esercitazione1": {
    "nome": "",
    "durata": 25,
    "descrizione": "",
    "materiali": "",
    "regole": "",
    "varianti": "",
    "obiettivoAtletico": "",
    "obiettivoPsicologico": "",
    "progressioneDifficolta": "",
    "schema": "",
    "schemaCanvas": {"tipo": "", "dimensioni": "", "elementi": []}
  },
  "esercitazione2": {
    "nome": "",
    "durata": 30,
    "descrizione": "",
    "materiali": "",
    "regole": "",
    "varianti": "",
    "obiettivoAtletico": "",
    "obiettivoPsicologico": "",
    "progressioneDifficolta": "",
    "schema": "",
    "schemaCanvas": {"tipo": "", "dimensioni": "", "elementi": []}
  },
  "partita": {
    "nome": "",
    "durata": 30,
    "descrizione": "",
    "materiali": "",
    "regole": "",
    "varianti": "",
    "obiettivoAtletico": "",
    "obiettivoPsicologico": "",
    "progressioneDifficolta": "",
    "schema": "",
    "schemaCanvas": {"tipo": "", "dimensioni": "", "elementi": []}
  }
}`;
}

async function callGroq(prompt, apiKey) {
    if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured');
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGemini(prompt, apiKey) {
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

function parseSeduta(aiResponse) {
    // Try to extract JSON from response
    let jsonStr = aiResponse;
    
    // Find JSON object in text
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        jsonStr = jsonMatch[0];
    }
    
    try {
        const parsed = JSON.parse(jsonStr);
        
        // Default schemaCanvas
        const defaultSchemaCanvas = {"tipo": "campo", "dimensioni": "standard", "elementi": []};
        
        // Validate and ensure all fields exist
        const defaultSection = {
            nome: 'Esercizio',
            durata: 20,
            descrizione: 'Descrizione non disponibile',
            materiali: 'Materiali non specificati',
            regole: 'Regole non specificate',
            varianti: 'Varianti non specificate',
            obiettivoAtletico: 'Non specificato',
            obiettivoPsicologico: 'Non specificato',
            progressioneDifficolta: 'Non specificata',
            schema: 'Schema non disponibile',
            schemaCanvas: defaultSchemaCanvas
        };
        
        return {
            attivazione: { ...defaultSection, ...parsed.attivazione, durata: parsed.attivazione?.durata || 20, schemaCanvas: parsed.attivazione?.schemaCanvas || defaultSchemaCanvas },
            esercitazione1: { ...defaultSection, ...parsed.esercitazione1, durata: parsed.esercitazione1?.durata || 25, schemaCanvas: parsed.esercitazione1?.schemaCanvas || defaultSchemaCanvas },
            esercitazione2: { ...defaultSection, ...parsed.esercitazione2, durata: parsed.esercitazione2?.durata || 30, schemaCanvas: parsed.esercitazione2?.schemaCanvas || defaultSchemaCanvas },
            partita: { ...defaultSection, ...parsed.partita, durata: parsed.partita?.durata || 30, schemaCanvas: parsed.partita?.schemaCanvas || defaultSchemaCanvas }
        };
    } catch (e) {
        console.error('JSON parse error:', e);
        // Return a fallback seduta
        return getFallbackSeduta();
    }
}

function getFallbackSeduta() {
    const defaultSchemaCanvas = {"tipo": "campo", "dimensioni": "standard", "elementi": []};
    
    return {
        attivazione: {
            nome: 'Attivazione neuromuscolare',
            durata: 20,
            descrizione: 'Corsa leggera + esercizi di mobilità articolare',
            materiali: 'Nessun materiale',
            regole: 'Esecuzione corretta degli esercizi',
            varianti: 'Aumentare intensità progressivamente',
            obiettivoAtletico: 'Riscaldamento generale',
            obiettivoPsicologico: 'Concentrazione e ascolto',
            progressioneDifficolta: 'Iniziare lenti, aumentare gradualmente',
            schema: 'Mezzo campo, giocatori in cerchio',
            schemaCanvas: defaultSchemaCanvas
        },
        esercitazione1: {
            nome: 'Controllo e passaggio',
            durata: 25,
            descrizione: 'Esercizio di tecnica individuale',
            materiali: 'Palloni, coni',
            regole: 'Due tocchi massimo',
            varianti: 'Ridurre tocchi, aumentare distanza',
            obiettivoAtletico: 'Coordinazione',
            obiettivoPsicologico: 'Attenzione',
            progressioneDifficolta: 'Ridurre spazio a disposizione',
            schema: 'Quadrato 20x20',
            schemaCanvas: defaultSchemaCanvas
        },
        esercitazione2: {
            nome: 'Situazione di gioco',
            durata: 30,
            descrizione: 'Possesso palla condizionato',
            materiali: 'Palloni, pettorine, porte piccole',
            regole: 'Obbligo di 3 passaggi prima di tirare',
            varianti: 'Cambiare numero tocchi',
            obiettivoAtletico: 'Resistenza',
            obiettivoPsicologico: 'Lettura di gioco',
            progressioneDifficolta: 'Aumentare pressing avversario',
            schema: 'Campo ridotto 30x20',
            schemaCanvas: defaultSchemaCanvas
        },
        partita: {
            nome: 'Partita a tema',
            durata: 30,
            descrizione: 'Partita con regole specifiche sull\'obiettivo',
            materiali: 'Pallone, porte, pettorine',
            regole: 'Rispettare i principi tattici lavorati',
            varianti: 'Aggiungere jolly, cambiare dimensioni campo',
            obiettivoAtletico: 'Esplosività',
            obiettivoPsicologico: 'Gestione pressione',
            progressioneDifficolta: 'Ridurre tempo di giocata',
            schema: 'Campo intero',
            schemaCanvas: defaultSchemaCanvas
        }
    };
}