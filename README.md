# Modulo Privacy Digitale - Centro Biofertility

Sistema web completo per la raccolta, validazione e invio sicuro del consenso al trattamento dei dati personali per pazienti del Centro di Procreazione Medicalmente Assistita Biofertility.

## 🎯 Panoramica del Progetto

Applicazione web moderna sviluppata per sostituire i moduli cartacei con un sistema digitale sicuro, conforme GDPR e con validità legale secondo la normativa italiana sui documenti informatici.

## ✨ Caratteristiche Principali

### 📋 Modulo Digitale
- **Raccolta dati completa**: tutti i campi richiesti per consenso PMA
- **Supporto partner opzionale**: sezione dedicata per dati del partner
- **Upload documenti**: gestione documenti identità fronte/retro (max 5MB)
- **Validazione real-time**: controllo immediato dati inseriti
- **Design responsive**: ottimizzato per desktop, tablet e mobile

### 📄 Generazione PDF Professionale
- **Layout tabellare**: dati organizzati in tabelle con bordi per massima leggibilità
- **Font Times**: tipografia professionale per documentazione medica
- **Struttura ottimizzata**: margini 15mm, spaziatura uniforme
- **Gestione pagine multiple**: auto-break per contenuti lunghi
- **Testo consenso integrato**: dati compilati inseriti nel testo originale

### 🔐 Validità Legale Digitale
- **Timestamp preciso**: data/ora completa con fuso orario
- **Identificazione univoca**: hash documento basato su contenuto
- **Metadati tecnici**: IP, User Agent, risoluzione schermo, piattaforma
- **Conformità CAD**: art. 20 Codice Amministrazione Digitale
- **Efficacia probatoria**: art. 2712 Codice Civile
- **Log server immutabili**: tracciabilità completa su infrastruttura Netlify

### 📧 Sistema di Invio Sicuro
- **Netlify Functions**: backend serverless per gestione email
- **Gmail SMTP**: invio tramite account aziendale centrimanna2@gmail.com
- **Allegati multipli**: PDF + documenti identità come attachment reali
- **Nessun salvataggio**: dati processati solo in memoria e inviati
- **Crittografia in transito**: comunicazione HTTPS end-to-end

### 🛡️ Compliance e Sicurezza
- **GDPR compliant**: consenso esplicito, informativa completa, diritti utente
- **Content Security Policy**: protezione XSS e injection attacks
- **Validazione robusta**: sanitizzazione input lato client e server
- **Headers sicurezza**: X-Frame-Options, X-Content-Type-Options
- **Nessuna persistenza**: zero salvataggio dati sensibili

## 🏗️ Architettura Tecnica

### Frontend (Client-side)
```
index.html          # Struttura semantica HTML5
├── styles.css      # CSS3 moderno con Grid/Flexbox
└── script.js       # JavaScript ES6+ per logica applicazione
```

### Backend (Serverless)
```
netlify/functions/
└── send-email.js   # Function Node.js per invio email con allegati
```

### Configurazione
```
netlify.toml        # Configurazione deploy e security headers
package.json        # Dipendenze e script npm
.env.example        # Template variabili d'ambiente
.gitignore          # Esclusione file sensibili
```

## 🚀 Setup e Deployment

### 1. Configurazione Gmail
**Prerequisito**: Account Gmail con autenticazione a due fattori attiva

1. **Genera App Password:**
   - Google Account → Sicurezza → Verifica in 2 passaggi → Password per app
   - Seleziona "Mail" → Genera password

2. **Configura variabili ambiente:**
   ```
   GMAIL_USER=centrimanna2@gmail.com
   GMAIL_APP_PASSWORD=your-16-digit-password
   ```

### 2. Deploy su Netlify

1. **Collegamento Repository:**
   ```bash
   # Repository già configurata
   https://github.com/Gabriele8967/Modulo-Privacy---Biofertility
   ```

2. **Configurazione Netlify:**
   - Collega repository GitHub
   - Build Command: `npm run build`
   - Publish Directory: `.`
   - Functions Directory: `netlify/functions`

3. **Environment Variables:**
   - Dashboard Netlify → Site Settings → Environment Variables
   - Aggiungi `GMAIL_USER` e `GMAIL_APP_PASSWORD`

### 3. Test Locale

```bash
# Avvio development server con functions
npx netlify dev

# Server disponibile su http://localhost:8888
# Functions endpoint: /.netlify/functions/send-email
```

## 🔧 Funzionalità Implementate

### Validazione Form
- **Codice Fiscale**: formato standard italiano (16 caratteri)
- **CAP**: 5 cifre numeriche
- **Email**: formato RFC standard
- **File Upload**: JPG, PNG, PDF max 5MB
- **Consensi GDPR**: obbligatori per submit
- **Campi obbligatori**: controllo completezza dati

### Generazione PDF
- **Header**: titolo centrato BIOFERTILITY
- **Tabella dati**: layout professionale a 4 colonne
- **Consenso**: testo completo con dati inseriti
- **Firma digitale**: Dr Claudio Manna + timestamp
- **Validità legale**: sezione dedicata con metadati
- **Footer**: dati centro formattati

### Sistema Email
- **Destinatario fisso**: centrimanna2@gmail.com
- **Allegati reali**: PDF + documenti identità
- **Template HTML**: email formattata per lettura
- **Log tracciabilità**: ogni invio loggato su server
- **Gestione errori**: feedback utente in caso di problemi

## 📊 Dati Raccolti

### Paziente Principale (Obbligatori)
- Nome e Cognome
- Luogo e Data di Nascita  
- Professione
- Indirizzo completo (via, città, CAP)
- Codice Fiscale
- Numero documento identità + scadenza
- Telefono e Email
- Email per comunicazioni mediche
- Documenti identità (fronte/retro)

### Partner (Opzionali)
- Stessi campi del paziente principale
- Attivazione tramite checkbox "Includi dati partner"
- Validazione condizionale solo se abilitato

### Consensi GDPR
- Consenso trattamento dati GDPR
- Consenso specifico dati sensibili PMA
- Validazione obbligatoria per entrambi

## 🔒 Sicurezza e Privacy

### Protezione Dati
- **Zero persistenza**: nessun dato salvato su database
- **Elaborazione in memoria**: processing temporaneo solo
- **Trasmissione sicura**: HTTPS + Gmail SMTP crittografato
- **Headers sicurezza**: CSP, HSTS, X-Frame-Options

### Compliance GDPR
- **Informativa trasparente**: scopo, destinatari, diritti utente
- **Consenso esplicito**: checkbox separati per ogni finalità  
- **Diritto oblio**: nessun dato persistente da cancellare
- **Portabilità**: dati esportabili tramite PDF
- **Minimizzazione**: raccolta solo dati strettamente necessari

### Validità Legale
- **Timestamp certificato**: server-side con fuso orario
- **Identificazione univoca**: hash crittografico documento
- **Metadati tecnici**: fingerprint dispositivo completo
- **Riferimenti normativi**: CAD art. 20, Codice Civile art. 2712
- **Audit trail**: log immutabili su infrastruttura Netlify

## 📈 Flusso Operativo

### 1. Compilazione Utente
```
Utente → Form Web → Validazione Real-time → Upload Documenti
```

### 2. Elaborazione Dati
```
Submit Form → Validazione Completa → Generazione PDF → Preparazione Allegati
```

### 3. Invio Sicuro
```
Netlify Function → Gmail SMTP → Email con Allegati → Log Tracciabilità
```

### 4. Risultato Finale
```
PDF Professionale + Documenti Identità → centrimanna2@gmail.com
```

## 🎨 Design e UX

### Frontend Moderno
- **CSS Grid/Flexbox**: layout responsive avanzato
- **Gradient backgrounds**: design professionale ma accogliente
- **Animazioni CSS**: feedback visivo per interazioni
- **Loading states**: indicatori progresso operazioni
- **Error handling**: messaggi chiari per utente

### PDF Professionale  
- **Typography**: Font Times per aspetto formale
- **Layout**: Tabelle con bordi per massima chiarezza
- **Spaziatura**: Margini e interlinea ottimizzati
- **Paginazione**: Gestione automatica contenuti lunghi
- **Branding**: Header/footer Centro Biofertility

## 🛠️ Stack Tecnologico

### Core Technologies
- **HTML5**: Struttura semantica e accessibile
- **CSS3**: Styling moderno con custom properties
- **JavaScript ES6+**: Logica applicazione moderna
- **Node.js**: Runtime per Netlify Functions

### Libraries & APIs
- **jsPDF 2.5.1**: Generazione PDF client-side
- **Nodemailer 6.9.8**: Invio email server-side  
- **Ipify API**: Rilevamento IP pubblico utente
- **Netlify Functions**: Backend serverless

### Hosting & Deploy
- **GitHub**: Version control e repository
- **Netlify**: Hosting statico + functions serverless
- **Gmail SMTP**: Servizio email aziendale
- **CDN Global**: Performance ottimizzate

## 📱 Supporto Dispositivi

### Desktop
- **Chrome/Firefox/Safari**: Supporto completo
- **Edge**: Compatibilità moderna
- **Risoluzione**: Ottimizzato da 1024px in su

### Mobile
- **iOS Safari**: iPhone/iPad compatibile
- **Android Chrome**: Smartphone/tablet supportati
- **Touch interface**: Controlli ottimizzati per touch

### Accessibilità
- **WCAG 2.1**: Standard accessibilità rispettati
- **Screen readers**: Markup semantico
- **Keyboard navigation**: Navigazione completa da tastiera
- **High contrast**: Colori accessibili

## 🚨 Considerazioni Legali

### Validità Documento Informatico
Il sistema implementa tutti i requisiti del **Codice dell'Amministrazione Digitale** per la validità legale:

- **Art. 20 CAD**: Documento informatico con efficacia probatoria
- **Art. 2712 CC**: Valore probatorio delle riproduzioni informatiche
- **Identificazione**: Hash univoco per ogni documento
- **Integrità**: Metadati tecnici immutabili
- **Tracciabilità**: Log server-side permanenti

### Compliance Sanitaria
- **Privacy Medica**: Trattamento dati sensibili sanitari
- **Consenso Informato**: Procedura completa secondo normativa
- **Conservazione**: Responsabilità destinatario (centro medico)
- **Accesso**: Solo personale autorizzato Centro Biofertility

## 📞 Supporto e Contatti

### Centro Biofertility - Junior s.r.l.
- **Sede Operativa**: Viale degli Eroi di Rodi 214, 00128-Roma  
- **Tel/Fax**: 06-5083375
- **Email**: centrimanna2@gmail.com
- **Sede Legale**: Via Velletri 7, 00198 Roma
- **Tel**: 06-8415269

### Supporto Tecnico
- **Repository**: https://github.com/Gabriele8967/Modulo-Privacy---Biofertility
- **Issues**: GitHub Issues per segnalazioni bug
- **Documentazione**: README.md sempre aggiornato

---

## 📝 Log delle Modifiche

### v1.0.0 - Implementazione Completa
- ✅ Sistema modulo privacy digitale completo
- ✅ PDF professionale con validità legale
- ✅ Netlify Functions per invio email
- ✅ Compliance GDPR e normativa italiana
- ✅ Design moderno e accessibile
- ✅ Sistema pronto per produzione

### Sviluppo e Test
- **Test Gmail SMTP**: ✅ Verificato funzionante
- **Test PDF Generation**: ✅ Layout professionale confermato  
- **Test Upload Files**: ✅ Gestione allegati operativa
- **Test Validazione**: ✅ Controlli robustiverificati
- **Test Mobile**: ✅ Responsive design validato

---

*Sistema sviluppato seguendo le migliori pratiche di sicurezza, privacy e usabilità per garantire un'esperienza utente ottimale e compliance normativa completa.*