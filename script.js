// Configurazione per Netlify Functions


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
    const doc = new jsPDF();
    
    let yPosition = 15;
    
    // Header principale
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESTAZIONE DEL CONSENSO PER IL TRATTAMENTO DEI DATI PERSONALI E SENSIBILI', 105, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text('PER I PAZIENTI DEL CENTRO DI PROCREAZIONE MEDICALMENTE ASSISTITA BIOFERTILITY', 105, yPosition, { align: 'center' });
    yPosition += 15;
    
    // === SEZIONE DATI PAZIENTI ===
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATI PAZIENTE PRINCIPALE', 10, yPosition);
    yPosition += 8;
    
    // Tabella dati paziente
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const leftCol = 10;
    const rightCol = 105;
    const lineHeight = 7;
    
    // Riga 1
    doc.setFont('helvetica', 'bold');
    doc.text('Nome e Cognome:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.nome} ${formData.cognome}`, leftCol + 35, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Data di Nascita:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.dataNascita, rightCol + 32, yPosition);
    yPosition += lineHeight;
    
    // Riga 2
    doc.setFont('helvetica', 'bold');
    doc.text('Luogo di Nascita:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.luogoNascita, leftCol + 35, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Professione:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.professione, rightCol + 25, yPosition);
    yPosition += lineHeight;
    
    // Riga 3
    doc.setFont('helvetica', 'bold');
    doc.text('Indirizzo:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.indirizzo}, ${formData.citta} ${formData.cap}`, leftCol + 22, yPosition);
    yPosition += lineHeight;
    
    // Riga 4
    doc.setFont('helvetica', 'bold');
    doc.text('Codice Fiscale:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.codiceFiscale, leftCol + 30, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Telefono:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.telefono, rightCol + 20, yPosition);
    yPosition += lineHeight;
    
    // Riga 5
    doc.setFont('helvetica', 'bold');
    doc.text('Documento N.:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.numeroDocumento, leftCol + 28, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Scadenza:', rightCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.scadenzaDocumento, rightCol + 22, yPosition);
    yPosition += lineHeight;
    
    // Riga 6
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.email, leftCol + 15, yPosition);
    yPosition += lineHeight;
    
    // Riga 7
    doc.setFont('helvetica', 'bold');
    doc.text('Email Comunicazioni:', leftCol, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.emailComunicazioni, leftCol + 40, yPosition);
    yPosition += 12;
    
    // Dati partner se presenti
    if (formData.includePartner && formData.nomePartner) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DATI PARTNER', 10, yPosition);
        yPosition += 8;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Tabella partner
        doc.setFont('helvetica', 'bold');
        doc.text('Nome e Cognome:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.nomePartner} ${formData.cognomePartner}`, leftCol + 35, yPosition);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Data di Nascita:', rightCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.dataNascitaPartner, rightCol + 32, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Luogo di Nascita:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.luogoNascitaPartner, leftCol + 35, yPosition);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Professione:', rightCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.professionePartner, rightCol + 25, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Indirizzo:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(`${formData.indirizzoPartner}, ${formData.cittaPartner} ${formData.capPartner}`, leftCol + 22, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Codice Fiscale:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.codiceFiscalePartner, leftCol + 30, yPosition);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Telefono:', rightCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.telefonoPartner, rightCol + 20, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Documento N.:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.numeroDocumentoPartner, leftCol + 28, yPosition);
        
        doc.setFont('helvetica', 'bold');
        doc.text('Scadenza:', rightCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.scadenzaDocumentoPartner, rightCol + 22, yPosition);
        yPosition += lineHeight;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Email:', leftCol, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.emailPartner, leftCol + 15, yPosition);
        yPosition += 12;
    }
    
    // === SEZIONE CONSENSO ===
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const consentText = `Il/La sottoscritto/a ${formData.nome} ${formData.cognome}${formData.includePartner ? ` e ${formData.nomePartner} ${formData.cognomePartner}` : ''}, pienamente consapevole della importanza della presente dichiarazione, dichiara di essere stato esaustivamente e chiaramente informato su:

• le finalità e le modalità del trattamento cui sono destinati i dati, connesse con le attività di prevenzione, diagnosi, cura e riabilitazione, svolte dal medico a tutela della salute;

• i soggetti o le categorie di soggetti ai quali i dati personali possono essere comunicati (medici sostituti, laboratorio analisi, medici specialisti, aziende ospedaliere, case di cura private e fiscalisti, ministero Finanze, Enti pubblici quali INPS, Inail ecc.) o che possono venirne a conoscenza in qualità di incaricati;

• il diritto di accesso ai dati personali, la facoltà di chiederne l'aggiornamento, la rettifica, l'integrazione e la cancellazione e/o la limitazione nell'utilizzo degli stessi;

• il nome del medico titolare del trattamento dei dati personali ed i suoi dati di contatto;

• la necessità di fornire dati richiesti per poter ottenere l'erogazione di prestazioni mediche adeguate e la fruizione dei servizi sanitari secondo la attuale disciplina.

Il/La sottoscritto/a ${formData.nome} ${formData.cognome}, chiede che le comunicazioni, anche relative a referti, siano inviati all'indirizzo mail: ${formData.emailComunicazioni}

A tal proposito, dichiaro che il detto indirizzo e-mail appartiene alla mia persona ed è in mio esclusivo utilizzo esonerando la Junior srl, da ogni e qualsivoglia responsabilità in riferimento alla conoscenza che dei referti e/o informazioni sul mio stato di salute, possano avere terze persone che riescano ad accedere lecitamente od illecitamente al detto indirizzo mail.

Il sottoscritto esprime quindi il libero e consapevole consenso al trattamento dei dati personali e sensibili, esclusivamente a fini di prevenzione, diagnosi, cura, esecuzione delle tecniche di PMA, prescrizione farmaceutica, interventi ambulatoriali e chirurgici e visita specialistica e per ogni prestazione da me richiesta.`;
    
    const consentLines = doc.splitTextToSize(consentText, 190);
    consentLines.forEach(line => {
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 15;
        }
        doc.text(line, 10, yPosition);
        yPosition += 5;
    });
    
    yPosition += 10;
    
    // Responsabile trattamento
    if (yPosition > 260) {
        doc.addPage();
        yPosition = 15;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Dr Claudio Manna, Responsabile trattamento dei dati medesimi.', 10, yPosition);
    yPosition += 15;
    
    // Data compilazione
    const now = new Date();
    const timestamp = now.toLocaleString('it-IT', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Data: ${timestamp}`, 10, yPosition);
    yPosition += 15;
    
    // === SEZIONE VALIDITÀ LEGALE ===
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('VALIDITÀ LEGALE DIGITALE:', 10, yPosition);
    yPosition += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Compilato il: ${timestamp}`, 10, yPosition);
    yPosition += 4;
    doc.text(`Indirizzo IP: ${userIP}`, 10, yPosition);
    yPosition += 8;
    
    // Note legali
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('NOTE: la responsabilità della eliminazione delle copie obsolete dell\'istruzione è del destinatario di questa documentazione.', 10, yPosition);
    yPosition += 10;
    
    // Footer centro
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Centro Biofertility - Junior s.r.l.', 10, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Sede operativa: Viale degli Eroi di Rodi 214, 00128-Roma Tel 06-5083375 Fax 06-5083375', 10, yPosition);
    yPosition += 4;
    doc.text('E-mail: centrimanna2@gmail.com', 10, yPosition);
    yPosition += 4;
    doc.text('Sede legale: Via Velletri 7, 00198 Roma Tel 06-8415269 E-mail centrimanna2@gmail.com', 10, yPosition);
    
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
        
        // Reset form dopo 3 secondi
        setTimeout(() => {
            this.reset();
            success.style.display = 'none';
            document.getElementById('partnerSection').style.display = 'none';
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