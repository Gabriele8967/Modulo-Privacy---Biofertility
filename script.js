// Configurazione per Netlify Functions

// Variabile per tracciare invio completato con successo
let formSubmittedSuccessfully = false;

// Sistema di logging per debug
const DebugLogger = {
    logs: [],
    
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.logs.push(logEntry);
        console.log(`[${level}] ${message}`, data);
        
        // Mantieni solo gli ultimi 50 log
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(-50);
        }
        
        // Salva in localStorage per debug persistente
        try {
            localStorage.setItem('privacyForm_debug', JSON.stringify(this.logs));
        } catch (e) {
            console.warn('Impossibile salvare log in localStorage:', e);
        }
    },
    
    error(message, error = null) {
        this.log('ERROR', message, {
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : null
        });
    },
    
    warn(message, data = null) {
        this.log('WARN', message, data);
    },
    
    info(message, data = null) {
        this.log('INFO', message, data);
    },
    
    getLogs() {
        return this.logs;
    },
    
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
};

// Funzione per rilevare problemi del browser
function detectBrowserIssues() {
    const issues = [];
    
    // Controlla supporto APIs critiche
    if (!window.fetch) issues.push('fetch API non supportata');
    if (!window.FormData) issues.push('FormData non supportata');
    if (!window.FileReader) issues.push('FileReader non supportato');
    if (!window.AbortController) issues.push('AbortController non supportato');
    
    // Controlla JavaScript abilitato
    if (!window.navigator) issues.push('Navigator non disponibile');
    
    // Controlla localStorage
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('localStorage non disponibile');
    }
    
    // Controlla UserAgent
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('chrome') && ua.includes('edg')) {
        DebugLogger.info('Browser rilevato: Microsoft Edge');
    } else if (ua.includes('chrome')) {
        DebugLogger.info('Browser rilevato: Chrome');
    } else if (ua.includes('firefox')) {
        DebugLogger.info('Browser rilevato: Firefox');
    } else if (ua.includes('safari')) {
        DebugLogger.info('Browser rilevato: Safari');
    } else {
        DebugLogger.warn('Browser non riconosciuto', { userAgent: navigator.userAgent });
    }
    
    if (issues.length > 0) {
        DebugLogger.error('Problemi di compatibilità rilevati', { issues });
        return issues;
    }
    
    DebugLogger.info('Browser supportato completamente');
    return null;
}

// Protezione per garantire visibilità checkbox GDPR
function forceGDPRCheckboxesVisible() {
    const gdprConsent = document.getElementById('gdprConsent');
    const privacyConsent = document.getElementById('privacyConsent');
    
    if (gdprConsent) {
        gdprConsent.style.display = 'inline-block';
        gdprConsent.style.visibility = 'visible';
        gdprConsent.style.opacity = '1';
        gdprConsent.style.position = 'static';
    }
    
    if (privacyConsent) {
        privacyConsent.style.display = 'inline-block';
        privacyConsent.style.visibility = 'visible';
        privacyConsent.style.opacity = '1';
        privacyConsent.style.position = 'static';
    }
}

// Inizializzazione con controlli di compatibilità
document.addEventListener('DOMContentLoaded', function() {
    DebugLogger.info('DOM caricato, inizializzazione modulo');
    
    // Controlla compatibilità browser (silenzioso)
    const browserIssues = detectBrowserIssues();
    if (browserIssues && browserIssues.length > 2) { // Solo per problemi gravi
        DebugLogger.error('Browser non compatibile', { issues: browserIssues });
        
        const warningMessage = `Il tuo browser potrebbe non essere aggiornato.\n\n` +
            `Per evitare problemi:\n` +
            `• Usa Chrome, Firefox o Safari aggiornati\n` +
            `• Aggiorna il browser se possibile\n\n` +
            `Puoi continuare, ma se hai problemi chiama il centro.`;
            
        if (confirm(warningMessage + '\n\nVuoi continuare?')) {
            DebugLogger.info('Utente ha scelto di continuare nonostante problemi browser');
        } else {
            DebugLogger.info('Utente ha scelto di non continuare');
            document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial;"><h2>Browser da aggiornare</h2><p>Chiama il centro per assistenza: 06-5083375</p></div>';
            return;
        }
    }
    
    forceGDPRCheckboxesVisible();
});

window.addEventListener('load', function() {
    DebugLogger.info('Pagina completamente caricata');
    forceGDPRCheckboxesVisible();
});

// Protezione aggiuntiva ogni 500ms per i primi 5 secondi
let protectionInterval = setInterval(forceGDPRCheckboxesVisible, 500);
setTimeout(() => clearInterval(protectionInterval), 5000);

// Observer per monitorare modifiche alle checkbox GDPR
function setupGDPRObserver() {
    const gdprConsent = document.getElementById('gdprConsent');
    const privacyConsent = document.getElementById('privacyConsent');
    
    if (gdprConsent || privacyConsent) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                    setTimeout(forceGDPRCheckboxesVisible, 10);
                }
            });
        });
        
        if (gdprConsent) {
            observer.observe(gdprConsent, { attributes: true, attributeFilter: ['style', 'class'] });
        }
        if (privacyConsent) {
            observer.observe(privacyConsent, { attributes: true, attributeFilter: ['style', 'class'] });
        }
    }
}

// Avvia observer
setTimeout(setupGDPRObserver, 1000);

// Gestione visibilità sezione partner
document.getElementById('includePartner').addEventListener('change', function() {
    const partnerSection = document.getElementById('partnerSection');
    const partnerInputs = partnerSection.querySelectorAll('input');
    
    if (this.checked) {
        partnerSection.style.display = 'block';
        partnerInputs.forEach(input => {
            if (input.type !== 'file') {
                input.required = true;
            }
        });
    } else {
        partnerSection.style.display = 'none';
        partnerInputs.forEach(input => {
            input.required = false;
            input.value = '';
        });
    }
});

// Validazione Codice Fiscale
function validateCodiceFiscale(cf) {
    const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    return regex.test(cf.toUpperCase());
}

// Validazione CAP
function validateCAP(cap) {
    const regex = /^[0-9]{5}$/;
    return regex.test(cap);
}

// Funzione per ottenere l'indirizzo IP del client con fallback multipli
async function getUserIP() {
    const ipServices = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.ip.sb/ip'
    ];
    
    for (const service of ipServices) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(service, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                return data.ip || data.query || 'Non disponibile';
            }
        } catch (error) {
            console.warn(`Errore servizio IP ${service}:`, error.message);
            continue;
        }
    }
    
    // Fallback finale: usa header del server se disponibile
    try {
        const response = await fetch('/.netlify/functions/get-ip', {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
            const data = await response.json();
            return data.ip || 'Non disponibile';
        }
    } catch (error) {
        console.warn('Fallback IP server failed:', error.message);
    }
    
    return 'Non disponibile';
}

// Funzione per convertire file in base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Validazione form
function validateForm() {
    let isValid = true;
    const requiredFields = document.querySelectorAll('input[required]');
    
    // Rimuovi messaggi di errore precedenti
    document.querySelectorAll('.error-message').forEach(msg => msg.remove());
    document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
    
    requiredFields.forEach(field => {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                showFieldError(field, 'Spunta per continuare');
                isValid = false;
            }
        } else if (!field.value.trim()) {
            showFieldError(field, 'Campo obbligatorio');
            isValid = false;
        }
    });
    
    // Validazione specifica per codice fiscale
    const cf = document.getElementById('codiceFiscale');
    if (cf.value && !validateCodiceFiscale(cf.value)) {
        showFieldError(cf, 'Codice fiscale non valido (es: RSSMRA85M01H501Z)');
        isValid = false;
    }
    
    // Validazione codice fiscale partner se presente
    const cfPartner = document.getElementById('codiceFiscalePartner');
    if (cfPartner.value && !validateCodiceFiscale(cfPartner.value)) {
        showFieldError(cfPartner, 'Codice fiscale partner non valido');
        isValid = false;
    }
    
    // Validazione CAP
    const cap = document.getElementById('cap');
    if (cap.value && !validateCAP(cap.value)) {
        showFieldError(cap, 'CAP deve essere 5 cifre (es: 00100)');
        isValid = false;
    }
    
    // Validazione CAP partner se presente
    const capPartner = document.getElementById('capPartner');
    if (capPartner.value && !validateCAP(capPartner.value)) {
        showFieldError(capPartner, 'CAP partner deve essere 5 cifre');
        isValid = false;
    }
    
    // Validazione email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        showFieldError(email, 'Email non valida (es: mario@gmail.com)');
        isValid = false;
    }
    
    // Validazione email comunicazioni
    const emailCom = document.getElementById('emailComunicazioni');
    if (emailCom.value && !emailRegex.test(emailCom.value)) {
        showFieldError(emailCom, 'Email comunicazioni non valida');
        isValid = false;
    }
    
    // Validazione email partner se presente
    const emailPartner = document.getElementById('emailPartner');
    if (emailPartner.value && !emailRegex.test(emailPartner.value)) {
        showFieldError(emailPartner, 'Email partner non valida');
        isValid = false;
    }
    
    // Validazione consensi GDPR obbligatori
    const gdprConsent = document.getElementById('gdprConsent');
    if (!gdprConsent.checked) {
        showFieldError(gdprConsent, 'Consenso GDPR obbligatorio');
        isValid = false;
    }
    
    const privacyConsent = document.getElementById('privacyConsent');
    if (!privacyConsent.checked) {
        showFieldError(privacyConsent, 'Consenso privacy obbligatorio');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// Helper per rendering righe tabella ottimizzato
function renderTableRow(doc, yPos, margin, widths, data, isMerged = false) {
    const rowHeight = 8;
    const [col1W, col2W, col3W, col4W] = widths;

    if (isMerged) {
        doc.rect(margin, yPos, col1W, rowHeight);
        doc.rect(margin + col1W, yPos, col2W + col3W + col4W, rowHeight);
        doc.text(data[0], margin + 2, yPos + 6);
        doc.text(data[1], margin + col1W + 2, yPos + 6);
    } else {
        doc.rect(margin, yPos, col1W, rowHeight);
        doc.rect(margin + col1W, yPos, col2W, rowHeight);
        doc.rect(margin + col1W + col2W, yPos, col3W, rowHeight);
        doc.rect(margin + col1W + col2W + col3W, yPos, col4W, rowHeight);
        doc.text(data[0], margin + 2, yPos + 6);
        doc.text(data[1], margin + col1W + 2, yPos + 6);
        if (data[2]) doc.text(data[2], margin + col1W + col2W + 2, yPos + 6);
        if (data[3]) doc.text(data[3], margin + col1W + col2W + col3W + 2, yPos + 6);
    }

    return yPos + rowHeight;
}

// Cache per testi statici pre-processati
const PDF_STATIC_TEXTS = {
    infoPoints: null,
    authenticityText: null,
    noteText: null,
    emailTemplate: null
};

// Pre-calcola splitTextToSize per testi statici (chiamato solo una volta)
function initPDFStaticTexts(doc, contentWidth) {
    if (PDF_STATIC_TEXTS.infoPoints) return; // Già inizializzato

    const infoPointsRaw = [
        'le finalità e le modalità del trattamento cui sono destinati i dati, connesse con le attività di prevenzione, diagnosi, cura e riabilitazione, svolte dal medico a tutela della salute;',
        'i soggetti o le categorie di soggetti ai quali i dati personali possono essere comunicati (medici sostituti, laboratorio analisi, medici specialisti, aziende ospedaliere, case di cura private e fiscalisti, ministero Finanze, Enti pubblici quali INPS, Inail ecc.) o che possono venirne a conoscenza in qualità di incaricati;',
        'il diritto di accesso ai dati personali, la facoltà di chiederne l\'aggiornamento, la rettifica, l\'integrazione e la cancellazione e/o la limitazione nell\'utilizzo degli stessi;',
        'il nome del medico titolare del trattamento dei dati personali ed i suoi dati di contatto;',
        'la necessità di fornire dati richiesti per poter ottenere l\'erogazione di prestazioni mediche adeguate e la fruizione dei servizi sanitari secondo la attuale disciplina.'
    ];

    PDF_STATIC_TEXTS.infoPoints = infoPointsRaw.map(point =>
        doc.splitTextToSize(`• ${point}`, contentWidth - 5)
    );

    PDF_STATIC_TEXTS.authenticityText = doc.splitTextToSize(
        'Il presente documento è stato compilato digitalmente tramite interfaccia web sicura. I dati tecnici sopra riportati certificano l\'autenticità della compilazione e l\'identità del dispositivo utilizzato. Ai sensi dell\'art. 20 del CAD (Codice dell\'Amministrazione Digitale), il documento informatico soddisfa il requisito della forma scritta e ha l\'efficacia probatoria prevista dall\'art. 2712 del Codice Civile.',
        contentWidth
    );

    PDF_STATIC_TEXTS.noteText = doc.splitTextToSize(
        'NOTE: la responsabilità della eliminazione delle copie obsolete dell\'istruzione è del destinatario di questa documentazione.',
        contentWidth
    );

    PDF_STATIC_TEXTS.emailTemplate = `A tal proposito, dichiaro che il detto indirizzo e-mail appartiene alla mia persona ed è in mio esclusivo utilizzo esonerando la Junior srl, da ogni e qualsivoglia responsabilità in riferimento alla conoscenza che dei referti e/o informazioni sul mio stato di salute, possano avere terze persone che riescano ad accedere lecitamente od illecitamente al detto indirizzo mail.

Il sottoscritto esprime quindi il libero e consapevole consenso al trattamento dei dati personali e sensibili, esclusivamente a fini di prevenzione, diagnosi, cura, esecuzione delle tecniche di PMA, prescrizione farmaceutica, interventi ambulatoriali e chirurgici e visita specialistica e per ogni prestazione da me richiesta.`;
}

// Generazione PDF ottimizzata
async function generatePDF(formData, userIP) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const rowHeight = 8;
    const colWidths = [45, 60, 40, 45];
    let yPosition = 20;

    // Inizializza cache testi statici
    initPDFStaticTexts(doc, contentWidth);

    // === INTESTAZIONE ===
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('PRESTAZIONE DEL CONSENSO PER IL TRATTAMENTO', pageWidth/2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.text('DEI DATI PERSONALI E SENSIBILI PER I PAZIENTI DEL', pageWidth/2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.text('CENTRO DI PROCREAZIONE MEDICALMENTE ASSISTITA', pageWidth/2, yPosition, { align: 'center' });
    yPosition += 6;
    doc.text('BIOFERTILITY', pageWidth/2, yPosition, { align: 'center' });
    yPosition += 15;

    // Linea separatrice
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // === DATI PAZIENTE PRINCIPALE ===
    doc.setFontSize(14);
    doc.text('DATI PAZIENTE PRINCIPALE', margin, yPosition);
    yPosition += 8;

    // Header tabella
    doc.setFontSize(10);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths, ['CAMPO', 'VALORE', 'CAMPO', 'VALORE']);

    // Righe dati paziente - batching font changes
    doc.setFont('times', 'normal');
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Nome e Cognome', `${formData.nome} ${formData.cognome}`, 'Data Nascita', formData.dataNascita]);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Luogo Nascita', formData.luogoNascita, 'Professione', formData.professione]);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Indirizzo Completo', `${formData.indirizzo}, ${formData.citta} ${formData.cap}`], true);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Codice Fiscale', formData.codiceFiscale, 'Telefono', formData.telefono]);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Documento N.', formData.numeroDocumento, 'Scadenza', formData.scadenzaDocumento]);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Email', formData.email], true);
    yPosition = renderTableRow(doc, yPosition, margin, colWidths,
        ['Email Comunicazioni', formData.emailComunicazioni], true);
    yPosition += 15;

    // === DATI PARTNER SE PRESENTI ===
    if (formData.includePartner && formData.nomePartner) {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('DATI PARTNER', margin, yPosition);
        yPosition += 8;

        // Header tabella partner
        doc.setFontSize(10);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths, ['CAMPO', 'VALORE', 'CAMPO', 'VALORE']);

        // Righe dati partner
        doc.setFont('times', 'normal');
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Nome e Cognome', `${formData.nomePartner} ${formData.cognomePartner}`, 'Data Nascita', formData.dataNascitaPartner]);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Luogo Nascita', formData.luogoNascitaPartner, 'Professione', formData.professionePartner]);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Indirizzo', `${formData.indirizzoPartner}, ${formData.cittaPartner} ${formData.capPartner}`], true);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Codice Fiscale', formData.codiceFiscalePartner, 'Telefono', formData.telefonoPartner]);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Documento N.', formData.numeroDocumentoPartner, 'Scadenza', formData.scadenzaDocumentoPartner]);
        yPosition = renderTableRow(doc, yPosition, margin, colWidths,
            ['Email', formData.emailPartner], true);
        yPosition += 10;
    }
    
    // === DICHIARAZIONE CONSENSO ===
    if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('DICHIARAZIONE DI CONSENSO', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont('times', 'normal');

    const consentTextFinal = `Il/La sottoscritto/a ${formData.nome} ${formData.cognome}${formData.includePartner ? ` e ${formData.nomePartner} ${formData.cognomePartner}` : ''}, pienamente consapevole della importanza della presente dichiarazione, dichiara di essere stato esaustivamente e chiaramente informato su:`;

    const consentLines = doc.splitTextToSize(consentTextFinal, contentWidth);
    for (const line of consentLines) {
        doc.text(line, margin, yPosition);
        yPosition += 6;
    }
    yPosition += 5;

    // Elenco puntato informazioni (usa cache pre-calcolata)
    for (const pointLines of PDF_STATIC_TEXTS.infoPoints) {
        for (let i = 0; i < pointLines.length; i++) {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(pointLines[i], margin + (i === 0 ? 0 : 5), yPosition);
            yPosition += 5;
        }
        yPosition += 2;
    }

    yPosition += 5;

    // Dichiarazione email (usa template cached)
    const emailDeclaration = `Il/La sottoscritto/a ${formData.nome} ${formData.cognome}, chiede che le comunicazioni, anche relative a referti, siano inviati all'indirizzo mail: ${formData.emailComunicazioni}\n    \n${PDF_STATIC_TEXTS.emailTemplate}`;

    const emailLines = doc.splitTextToSize(emailDeclaration, contentWidth);
    for (const line of emailLines) {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
    }

    yPosition += 10;

    // === FIRMA E DATA ===
    if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
    }

    doc.setFont('times', 'bold');
    doc.text('Dr Claudio Manna', margin, yPosition);
    doc.setFont('times', 'normal');
    doc.text('Responsabile trattamento dei dati', margin, yPosition + 6);
    yPosition += 15;

    // Data e hash (batch calculations)
    const now = new Date();
    const timestamp = now.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const preciseTimestamp = now.toLocaleString('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    });

    const documentHash = btoa(JSON.stringify({
        nome: formData.nome,
        cognome: formData.cognome,
        cf: formData.codiceFiscale,
        timestamp: now.getTime(),
        ip: userIP
    })).substring(0, 16);

    doc.setFont('times', 'bold');
    doc.text(`Data: ${timestamp}`, margin, yPosition);
    yPosition += 15;

    // === VALIDITÀ LEGALE DIGITALE ===
    doc.setFontSize(10);
    doc.text('VALIDITÀ LEGALE DIGITALE', margin, yPosition);
    yPosition += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(9);

    // Batch text rendering per info tecniche
    const technicalInfo = [
        `Documento compilato il: ${preciseTimestamp}`,
        `Indirizzo IP mittente: ${userIP} (Italia)`,
        `User Agent: ${navigator.userAgent.substring(0, 80)}`,
        `ID Univoco Documento: ${documentHash}`,
        `Risoluzione Schermo: ${screen.width}x${screen.height}`,
        `Piattaforma: ${navigator.platform}`,
        `Lingua Browser: ${navigator.language}`
    ];

    for (const info of technicalInfo) {
        doc.text(info, margin, yPosition);
        yPosition += 4;
    }
    yPosition += 2;

    // Dichiarazione di autenticità (usa cache)
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('DICHIARAZIONE DI AUTENTICITÀ DIGITALE', margin, yPosition);
    yPosition += 4;

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    for (const line of PDF_STATIC_TEXTS.authenticityText) {
        doc.text(line, margin, yPosition);
        yPosition += 3.5;
    }
    yPosition += 4;

    // Note legali (usa cache)
    doc.setFont('times', 'italic');
    for (const line of PDF_STATIC_TEXTS.noteText) {
        doc.text(line, margin, yPosition);
        yPosition += 4;
    }
    yPosition += 8;

    // === FOOTER CENTRO ===
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('Centro Biofertility - Junior s.r.l.', margin, yPosition);
    yPosition += 6;

    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('Sede operativa: Viale degli Eroi di Rodi 214, 00128-Roma', margin, yPosition);
    yPosition += 4;
    doc.text('Tel: 06-5083375 | Fax: 06-5083375 | E-mail: centrimanna2@gmail.com', margin, yPosition);
    yPosition += 4;
    doc.text('Sede legale: Via Velletri 7, 00198 Roma | Tel: 06-8415269', margin, yPosition);

    return doc;
}

// Gestione submit form
document.getElementById('privacyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const success = document.getElementById('success');
    
    submitBtn.disabled = true;
    loading.style.display = 'block';
    success.style.display = 'none';
    
    try {
        // Raccolta dati form
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        // Ottieni IP utente
        DebugLogger.info('Inizio richiesta IP utente');
        const userIP = await getUserIP();
        DebugLogger.info('IP utente ottenuto', { ip: userIP });
        
        // Genera PDF
        const pdf = await generatePDF(data, userIP);
        const pdfBlob = pdf.output('blob');
        
        // Converti documenti di identità in base64
        const documentoFrente = document.getElementById('documentoFrente').files[0];
        const documentoRetro = document.getElementById('documentoRetro').files[0];
        
        let documentiFronteB64 = '';
        let documentiRetroB64 = '';
        
        if (documentoFrente) {
            documentiFronteB64 = await fileToBase64(documentoFrente);
        }
        
        if (documentoRetro) {
            documentiRetroB64 = await fileToBase64(documentoRetro);
        }
        
        // Documenti partner se presenti
        let documentoFrentePartnerB64 = '';
        let documentoRetroPartnerB64 = '';
        
        if (data.includePartner) {
            const docFrentePartner = document.getElementById('documentoFrentePartner').files[0];
            const docRetroPartner = document.getElementById('documentoRetroPartner').files[0];
            
            if (docFrentePartner) {
                documentoFrentePartnerB64 = await fileToBase64(docFrentePartner);
            }
            
            if (docRetroPartner) {
                documentoRetroPartnerB64 = await fileToBase64(docRetroPartner);
            }
        }
        
        // Prepara dati per Netlify Function
        const functionData = {
            ...data,
            pdfBase64: btoa(pdf.output()),
            documentoFrente: documentiFronteB64.split(',')[1] || '',
            documentoRetro: documentiRetroB64.split(',')[1] || '',
            documentoFrenteExt: documentoFrente ? documentoFrente.name.split('.').pop() : '',
            documentoRetroExt: documentoRetro ? documentoRetro.name.split('.').pop() : '',
            documentoFrentePartner: documentoFrentePartnerB64.split(',')[1] || '',
            documentoRetroPartner: documentoRetroPartnerB64.split(',')[1] || '',
            documentoFrentePartnerExt: data.includePartner && document.getElementById('documentoFrentePartner').files[0] ? 
                document.getElementById('documentoFrentePartner').files[0].name.split('.').pop() : '',
            documentoRetroPartnerExt: data.includePartner && document.getElementById('documentoRetroPartner').files[0] ? 
                document.getElementById('documentoRetroPartner').files[0].name.split('.').pop() : '',
            timestamp: new Date().toLocaleString('it-IT'),
            ipAddress: userIP,
            userAgent: navigator.userAgent
        };
        
        // Funzione con retry logic e timeout intelligente
        async function sendWithRetry(data, maxRetries = 3) {
            let lastError = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondi timeout

                    const response = await fetch('/.netlify/functions/send-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const result = await response.json();
                        return { success: true, data: result };
                    } else {
                        const errorData = await response.text();

                        // Se è 404, non ha senso ritentare (endpoint non esiste)
                        if (response.status === 404) {
                            DebugLogger.error('Endpoint non trovato (404) - stop retry');
                            return {
                                success: false,
                                error: 'ENDPOINT_NOT_FOUND',
                                httpStatus: 404,
                                noRetry: true
                            };
                        }

                        throw new Error(`HTTP ${response.status}: ${errorData}`);
                    }
                } catch (error) {
                    lastError = error;

                    DebugLogger.error(`Tentativo ${attempt}/${maxRetries} fallito`, {
                        attempt,
                        maxRetries,
                        errorName: error.name,
                        errorMessage: error.message,
                        isTimeout: error.name === 'AbortError',
                        isNetwork: error.message.includes('fetch')
                    });

                    // Non ritentare se è un errore 404 o errore di rete critico
                    if (error.message.includes('404') || error.message.includes('ENDPOINT_NOT_FOUND')) {
                        return {
                            success: false,
                            error: 'ENDPOINT_NOT_FOUND',
                            noRetry: true
                        };
                    }

                    if (attempt === maxRetries) {
                        return {
                            success: false,
                            error: error.message,
                            isTimeout: error.name === 'AbortError',
                            isNetwork: error.message.includes('fetch')
                        };
                    }

                    // Attesa progressiva tra i tentativi (solo se ha senso ritentare)
                    const waitTime = attempt * 2000;
                    DebugLogger.info(`Attesa ${waitTime}ms prima del prossimo tentativo`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }

            return {
                success: false,
                error: lastError?.message || 'Errore sconosciuto'
            };
        }
        
        const result = await sendWithRetry(functionData);
        
        if (!result.success) {
            throw new Error(result.error || 'Errore sconosciuto');
        }
        
        loading.style.display = 'none';
        success.style.display = 'block';
        
        // Imposta flag per disabilitare avviso uscita
        formSubmittedSuccessfully = true;
        
        // Mostra finestra di conferma invece del reindirizzamento
        setTimeout(() => {
            alert('INVIO COMPLETATO\n\nPUOI CHIUDERE LA PAGINA E TORNARE ALLA PAGINA DI PARTENZA');
        }, 3000);
        
    } catch (error) {
        console.error('Errore nell\'invio:', error);

        // Log dettagliato per debug (invisibile all'utente)
        DebugLogger.error('Errore finale invio modulo', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });

        // Messaggi SEMPLICI per pazienti (no termini tecnici)
        let errorMessage = '';
        let errorTitle = '⚠️ NON È STATO POSSIBILE INVIARE';

        // Determina il tipo di errore e mostra messaggio appropriato
        if (error.message.includes('ENDPOINT_NOT_FOUND') || error.message.includes('404')) {
            // Errore 404 - probabilmente test locale
            errorTitle = '⚠️ ATTENZIONE';
            errorMessage = `Il modulo non può essere inviato da questa pagina.

COSA DEVI FARE:
1. Assicurati di usare il link ufficiale che ti è stato dato dal centro
2. Se stai facendo una prova, questa pagina è solo per TEST
3. Per inviare davvero il modulo, usa il link: https://tuosito.netlify.app

SERVE AIUTO?
📞 Chiama il centro: 06-5083375
📧 Email: centrimanna2@gmail.com

I tuoi dati NON sono stati inviati.
Compila il modulo dal link ufficiale.`;

        } else if (error.message.includes('AbortError') || error.message.includes('timeout')) {
            // Timeout
            errorMessage = `La connessione internet è troppo lenta.

COSA FARE:
1. Controlla di essere connesso a internet
2. Prova a connetterti al WiFi (se sei su dati mobili)
3. Aspetta 1 minuto e clicca di nuovo INVIA

SERVE AIUTO?
📞 Chiama il centro: 06-5083375
Possono aiutarti a compilare il modulo per telefono.

I tuoi dati sono SICURI e non si perdono.`;

        } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            // Errore di rete
            errorMessage = `Non c'è connessione a internet.

COSA FARE:
1. Controlla di essere connesso a WiFi o dati mobili
2. Prova a disattivare e riattivare il WiFi
3. Riprova tra 1 minuto

SE IL PROBLEMA CONTINUA:
📞 Chiama il centro: 06-5083375
Ti aiuteranno a completare il modulo.

I tuoi dati sono SICURI.`;

        } else if (error.message.includes('500') || error.message.includes('503')) {
            // Errore server
            errorMessage = `Il sistema è momentaneamente occupato.

COSA FARE:
1. Aspetta 2-3 minuti
2. Clicca di nuovo INVIA
3. Se non funziona, riprova tra 10 minuti

È UN PROBLEMA TEMPORANEO:
Il sistema si risolverà da solo.
Non c'è niente che tu debba fare.

FRETTA?
📞 Chiama: 06-5083375

I tuoi dati sono SICURI.`;

        } else {
            // Errore generico
            errorMessage = `Si è verificato un problema tecnico.

COSA CONTROLLARE:
1. Tutti i campi sono compilati?
2. Le foto sono più piccole di 5MB?
3. Hai compilato email e telefono?

COSA FARE:
1. Controlla i punti sopra
2. Clicca di nuovo INVIA
3. Se non funziona, chiama il centro

SERVE AIUTO?
📞 Chiama: 06-5083375
📧 Email: centrimanna2@gmail.com

I tuoi dati sono SICURI.`;
        }

        // Mostra messaggio con alert semplice
        alert(errorTitle + '\n\n' + errorMessage);

        loading.style.display = 'none';
    } finally {
        submitBtn.disabled = false;
    }
});

// Validazione in tempo reale
document.getElementById('codiceFiscale').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});

document.getElementById('codiceFiscalePartner').addEventListener('input', function() {
    this.value = this.value.toUpperCase();
});

// Validazione file upload con messaggi esplicativi
function validateFileUpload(input) {
    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (file) {
        if (file.size > maxSize) {
            const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
            alert(`File troppo grande: ${fileSizeMB}MB\nMassimo consentito: 5MB\n\nComprimi l'immagine e riprova.`);
            input.value = '';
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`Formato non supportato.\nUsa: JPG, PNG o PDF`);
            input.value = '';
            return false;
        }
    }
    
    return true;
}

// Aggiungi validatori ai file input
document.getElementById('documentoFrente').addEventListener('change', function() {
    validateFileUpload(this);
});

document.getElementById('documentoRetro').addEventListener('change', function() {
    validateFileUpload(this);
});

document.getElementById('documentoFrentePartner').addEventListener('change', function() {
    validateFileUpload(this);
});

document.getElementById('documentoRetroPartner').addEventListener('change', function() {
    validateFileUpload(this);
});

// Prevenzione accidentale chiusura pagina
window.addEventListener('beforeunload', function(e) {
    // Se il form è stato inviato con successo, non mostrare l'avviso
    if (formSubmittedSuccessfully) {
        return;
    }
    
    const form = document.getElementById('privacyForm');
    const inputs = form.querySelectorAll('input');
    let hasData = false;
    
    inputs.forEach(input => {
        if (input.value.trim() || input.files?.length > 0) {
            hasData = true;
        }
    });
    
    if (hasData) {
        DebugLogger.info('Utente tenta di chiudere pagina con dati compilati');
        e.preventDefault();
        e.returnValue = '';
    }
});

// Sistema di debug invisibile agli utenti finali
// Accessibile solo tramite console per il supporto tecnico
if (window.location.hostname === 'localhost' || window.location.hostname.includes('netlify')) {
    // Debug accessibile solo tramite comando nascosto
    Object.defineProperty(window, 'getFormDebugInfo', {
        value: function() {
            const logs = DebugLogger.getLogs();
            const summary = {
                totalErrors: logs.filter(l => l.level === 'ERROR').length,
                lastError: logs.filter(l => l.level === 'ERROR').pop(),
                browserInfo: navigator.userAgent,
                timestamp: new Date().toISOString(),
                formStatus: document.getElementById('privacyForm') ? 'loaded' : 'missing'
            };
            
            console.log('=== INFORMAZIONI DEBUG MODULO PRIVACY ===');
            console.log('Per il supporto tecnico - Non condividere pubblicamente');
            console.log(JSON.stringify(summary, null, 2));
            
            // Copia automaticamente negli appunti se supportato
            if (navigator.clipboard) {
                navigator.clipboard.writeText(JSON.stringify(summary, null, 2))
                    .then(() => console.log('✅ Debug info copiato negli appunti'))
                    .catch(() => console.log('ℹ️ Copia manualmente le info sopra'));
            }
            
            return summary;
        },
        enumerable: false,
        writable: false
    });
    
    // Log nascosto per debug sviluppatori
    console.log('%c🔧 Debug disponibile', 'color: #888; font-size: 10px;', 'Usa getFormDebugInfo() per supporto tecnico');
}