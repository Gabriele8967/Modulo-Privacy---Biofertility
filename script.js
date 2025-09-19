// Configurazione per Netlify Functions

// Variabile per tracciare invio completato con successo
let formSubmittedSuccessfully = false;

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

// Esegui protezione all'avvio e periodicamente
document.addEventListener('DOMContentLoaded', forceGDPRCheckboxesVisible);
window.addEventListener('load', forceGDPRCheckboxesVisible);

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

// Funzione per ottenere l'indirizzo IP del client
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Errore nel recupero IP:', error);
        return 'Non disponibile';
    }
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
                showFieldError(field, 'Consenso obbligatorio');
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
        showFieldError(cf, 'Codice fiscale non valido');
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
        showFieldError(cap, 'CAP non valido (5 cifre)');
        isValid = false;
    }
    
    // Validazione CAP partner se presente
    const capPartner = document.getElementById('capPartner');
    if (capPartner.value && !validateCAP(capPartner.value)) {
        showFieldError(capPartner, 'CAP partner non valido (5 cifre)');
        isValid = false;
    }
    
    // Validazione email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value && !emailRegex.test(email.value)) {
        showFieldError(email, 'Email non valida');
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

// Generazione PDF
async function generatePDF(formData, userIP) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = 20;
    
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
    doc.setFont('times', 'bold');
    doc.text('DATI PAZIENTE PRINCIPALE', margin, yPosition);
    yPosition += 8;
    
    // Tabella dati paziente con bordi
    const tableStartY = yPosition;
    const rowHeight = 8;
    const col1Width = 45;
    const col2Width = 60;
    const col3Width = 40;
    const col4Width = 45;
    
    // Header tabella
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.rect(margin, yPosition, contentWidth, rowHeight);
    doc.text('CAMPO', margin + 2, yPosition + 6);
    doc.text('VALORE', margin + col1Width + 2, yPosition + 6);
    doc.text('CAMPO', margin + col1Width + col2Width + 2, yPosition + 6);
    doc.text('VALORE', margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    doc.setFont('times', 'normal');
    
    // Riga 1
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    doc.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    doc.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    
    doc.text('Nome e Cognome', margin + 2, yPosition + 6);
    doc.text(`${formData.nome} ${formData.cognome}`, margin + col1Width + 2, yPosition + 6);
    doc.text('Data Nascita', margin + col1Width + col2Width + 2, yPosition + 6);
    doc.text(formData.dataNascita, margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 2
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    doc.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    doc.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    
    doc.text('Luogo Nascita', margin + 2, yPosition + 6);
    doc.text(formData.luogoNascita, margin + col1Width + 2, yPosition + 6);
    doc.text('Professione', margin + col1Width + col2Width + 2, yPosition + 6);
    doc.text(formData.professione, margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 3 - Indirizzo completo
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width + col3Width + col4Width, rowHeight);
    
    doc.text('Indirizzo Completo', margin + 2, yPosition + 6);
    doc.text(`${formData.indirizzo}, ${formData.citta} ${formData.cap}`, margin + col1Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 4
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    doc.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    doc.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    
    doc.text('Codice Fiscale', margin + 2, yPosition + 6);
    doc.text(formData.codiceFiscale, margin + col1Width + 2, yPosition + 6);
    doc.text('Telefono', margin + col1Width + col2Width + 2, yPosition + 6);
    doc.text(formData.telefono, margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 5
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width, rowHeight);
    doc.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
    doc.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
    
    doc.text('Documento N.', margin + 2, yPosition + 6);
    doc.text(formData.numeroDocumento, margin + col1Width + 2, yPosition + 6);
    doc.text('Scadenza', margin + col1Width + col2Width + 2, yPosition + 6);
    doc.text(formData.scadenzaDocumento, margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 6 - Email
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width + col3Width + col4Width, rowHeight);
    
    doc.text('Email', margin + 2, yPosition + 6);
    doc.text(formData.email, margin + col1Width + 2, yPosition + 6);
    yPosition += rowHeight;
    
    // Riga 7 - Email Comunicazioni
    doc.rect(margin, yPosition, col1Width, rowHeight);
    doc.rect(margin + col1Width, yPosition, col2Width + col3Width + col4Width, rowHeight);
    
    doc.text('Email Comunicazioni', margin + 2, yPosition + 6);
    doc.text(formData.emailComunicazioni, margin + col1Width + 2, yPosition + 6);
    yPosition += 15;
    
    // === DATI PARTNER SE PRESENTI ===
    if (formData.includePartner && formData.nomePartner) {
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text('DATI PARTNER', margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('times', 'normal');
        
        // Header tabella partner
        doc.setFont('times', 'bold');
        doc.rect(margin, yPosition, contentWidth, rowHeight);
        doc.text('CAMPO', margin + 2, yPosition + 6);
        doc.text('VALORE', margin + col1Width + 2, yPosition + 6);
        doc.text('CAMPO', margin + col1Width + col2Width + 2, yPosition + 6);
        doc.text('VALORE', margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
        yPosition += rowHeight;
        
        doc.setFont('times', 'normal');
        
        // Dati partner con stesso formato
        const partnerData = [
            ['Nome e Cognome', `${formData.nomePartner} ${formData.cognomePartner}`, 'Data Nascita', formData.dataNascitaPartner],
            ['Luogo Nascita', formData.luogoNascitaPartner, 'Professione', formData.professionePartner],
            ['Indirizzo', `${formData.indirizzoPartner}, ${formData.cittaPartner} ${formData.capPartner}`, '', ''],
            ['Codice Fiscale', formData.codiceFiscalePartner, 'Telefono', formData.telefonoPartner],
            ['Documento N.', formData.numeroDocumentoPartner, 'Scadenza', formData.scadenzaDocumentoPartner],
            ['Email', formData.emailPartner, '', '']
        ];
        
        partnerData.forEach(row => {
            if (row[0] === 'Indirizzo' || row[0] === 'Email') {
                doc.rect(margin, yPosition, col1Width, rowHeight);
                doc.rect(margin + col1Width, yPosition, col2Width + col3Width + col4Width, rowHeight);
                doc.text(row[0], margin + 2, yPosition + 6);
                doc.text(row[1], margin + col1Width + 2, yPosition + 6);
            } else {
                doc.rect(margin, yPosition, col1Width, rowHeight);
                doc.rect(margin + col1Width, yPosition, col2Width, rowHeight);
                doc.rect(margin + col1Width + col2Width, yPosition, col3Width, rowHeight);
                doc.rect(margin + col1Width + col2Width + col3Width, yPosition, col4Width, rowHeight);
                doc.text(row[0], margin + 2, yPosition + 6);
                doc.text(row[1], margin + col1Width + 2, yPosition + 6);
                if (row[2]) doc.text(row[2], margin + col1Width + col2Width + 2, yPosition + 6);
                if (row[3]) doc.text(row[3], margin + col1Width + col2Width + col3Width + 2, yPosition + 6);
            }
            yPosition += rowHeight;
        });
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
    
    let consentLines = doc.splitTextToSize(consentTextFinal, contentWidth);
    consentLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 6;
    });
    yPosition += 5;
    
    // Elenco puntato informazioni
    const infoPoints = [
        'le finalità e le modalità del trattamento cui sono destinati i dati, connesse con le attività di prevenzione, diagnosi, cura e riabilitazione, svolte dal medico a tutela della salute;',
        'i soggetti o le categorie di soggetti ai quali i dati personali possono essere comunicati (medici sostituti, laboratorio analisi, medici specialisti, aziende ospedaliere, case di cura private e fiscalisti, ministero Finanze, Enti pubblici quali INPS, Inail ecc.) o che possono venirne a conoscenza in qualità di incaricati;',
        'il diritto di accesso ai dati personali, la facoltà di chiederne l\'aggiornamento, la rettifica, l\'integrazione e la cancellazione e/o la limitazione nell\'utilizzo degli stessi;',
        'il nome del medico titolare del trattamento dei dati personali ed i suoi dati di contatto;',
        'la necessità di fornire dati richiesti per poter ottenere l\'erogazione di prestazioni mediche adeguate e la fruizione dei servizi sanitari secondo la attuale disciplina.'
    ];
    
    infoPoints.forEach(point => {
        const pointLines = doc.splitTextToSize(`• ${point}`, contentWidth - 5);
        pointLines.forEach((line, index) => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }
            doc.text(line, margin + (index === 0 ? 0 : 5), yPosition);
            yPosition += 5;
        });
        yPosition += 2;
    });
    
    yPosition += 5;
    
    // Dichiarazione email
    const emailDeclaration = `Il/La sottoscritto/a ${formData.nome} ${formData.cognome}, chiede che le comunicazioni, anche relative a referti, siano inviati all'indirizzo mail: ${formData.emailComunicazioni}
    
A tal proposito, dichiaro che il detto indirizzo e-mail appartiene alla mia persona ed è in mio esclusivo utilizzo esonerando la Junior srl, da ogni e qualsivoglia responsabilità in riferimento alla conoscenza che dei referti e/o informazioni sul mio stato di salute, possano avere terze persone che riescano ad accedere lecitamente od illecitamente al detto indirizzo mail.

Il sottoscritto esprime quindi il libero e consapevole consenso al trattamento dei dati personali e sensibili, esclusivamente a fini di prevenzione, diagnosi, cura, esecuzione delle tecniche di PMA, prescrizione farmaceutica, interventi ambulatoriali e chirurgici e visita specialistica e per ogni prestazione da me richiesta.`;
    
    const emailLines = doc.splitTextToSize(emailDeclaration, contentWidth);
    emailLines.forEach(line => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
    });
    
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
    
    // Data
    const now = new Date();
    const timestamp = now.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    doc.setFont('times', 'bold');
    doc.text(`Data: ${timestamp}`, margin, yPosition);
    yPosition += 15;
    
    // === VALIDITÀ LEGALE DIGITALE ===
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('VALIDITÀ LEGALE DIGITALE', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    
    // Timestamp preciso con secondi
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
    
    // Hash unico documento basato su contenuto + timestamp
    const documentHash = btoa(JSON.stringify({
        nome: formData.nome,
        cognome: formData.cognome,
        cf: formData.codiceFiscale,
        timestamp: now.getTime(),
        ip: userIP
    })).substring(0, 16);
    
    // Geolocalizzazione approssimativa da IP (se disponibile)
    const geoInfo = 'Italia'; // In produzione si può usare un servizio di geolocalizzazione
    
    doc.text(`Documento compilato il: ${preciseTimestamp}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Indirizzo IP mittente: ${userIP} (${geoInfo})`, margin, yPosition);
    yPosition += 4;
    doc.text(`User Agent: ${navigator.userAgent.substring(0, 80)}`, margin, yPosition);
    yPosition += 4;
    doc.text(`ID Univoco Documento: ${documentHash}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Risoluzione Schermo: ${screen.width}x${screen.height}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Piattaforma: ${navigator.platform}`, margin, yPosition);
    yPosition += 4;
    doc.text(`Lingua Browser: ${navigator.language}`, margin, yPosition);
    yPosition += 6;
    
    // Dichiarazione di autenticità
    doc.setFont('times', 'bold');
    doc.setFontSize(9);
    doc.text('DICHIARAZIONE DI AUTENTICITÀ DIGITALE', margin, yPosition);
    yPosition += 4;
    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    const authenticityText = 'Il presente documento è stato compilato digitalmente tramite interfaccia web sicura. I dati tecnici sopra riportati certificano l\'autenticità della compilazione e l\'identità del dispositivo utilizzato. Ai sensi dell\'art. 20 del CAD (Codice dell\'Amministrazione Digitale), il documento informatico soddisfa il requisito della forma scritta e ha l\'efficacia probatoria prevista dall\'art. 2712 del Codice Civile.';
    const authLines = doc.splitTextToSize(authenticityText, contentWidth);
    authLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 3.5;
    });
    yPosition += 4;
    
    // Note legali
    doc.setFont('times', 'italic');
    doc.setFontSize(8);
    const noteText = 'NOTE: la responsabilità della eliminazione delle copie obsolete dell\'istruzione è del destinatario di questa documentazione.';
    const noteLines = doc.splitTextToSize(noteText, contentWidth);
    noteLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 4;
    });
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
        const userIP = await getUserIP();
        
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
        
        // Invia tramite Netlify Function
        const response = await fetch('/.netlify/functions/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(functionData)
        });
        
        if (!response.ok) {
            throw new Error('Errore nell\'invio dell\'email');
        }
        
        loading.style.display = 'none';
        success.style.display = 'block';
        
        // Imposta flag per disabilitare avviso uscita
        formSubmittedSuccessfully = true;
        
        // Reindirizza al sito di prenotazione dopo 3 secondi
        setTimeout(() => {
            window.location.href = 'https://www.centroinfertilita.it/prenota-una-visita/';
        }, 3000);
        
    } catch (error) {
        console.error('Errore nell\'invio:', error);
        alert('Errore nell\'invio del modulo. Riprova più tardi.');
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

// Validazione file upload
function validateFileUpload(input) {
    const file = input.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (file) {
        if (file.size > maxSize) {
            alert('Il file è troppo grande. Massimo 5MB consentiti.');
            input.value = '';
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert('Formato file non supportato. Usa JPG, PNG o PDF.');
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
        e.preventDefault();
        e.returnValue = '';
    }
});