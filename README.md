# Modulo Privacy - Centro Biofertility

Applicazione web per la compilazione e invio del modulo privacy per pazienti del Centro di Procreazione Medicalmente Assistita Biofertility.

## Caratteristiche

- ✅ Modulo privacy completo con tutti i campi richiesti
- ✅ Supporto per dati del partner (opzionale)
- ✅ Upload documenti di identità (fronte/retro)
- ✅ Generazione PDF automatica
- ✅ Invio email sicuro a centrimanna2@gmail.com
- ✅ Timestamp e IP per validità legale
- ✅ Compliance GDPR
- ✅ Design moderno e responsive
- ✅ Validazione form in tempo reale

## Configurazione per Deploy

### 1. EmailJS Setup
Per l'invio delle email, configurare EmailJS:

1. Creare account su [EmailJS](https://www.emailjs.com/)
2. Creare un servizio email
3. Creare un template con i seguenti parametri:
   - `to_email`: email destinatario
   - `from_name`: nome mittente
   - `from_email`: email mittente
   - `subject`: oggetto email
   - `message`: messaggio
   - `patient_data`: dati paziente in JSON
   - `pdf_attachment`: PDF in base64
   - `documento_fronte`: documento fronte in base64
   - `documento_retro`: documento retro in base64
   - `timestamp`: timestamp compilazione
   - `ip_address`: IP utente

4. Sostituire in `script.js`:
   - `YOUR_EMAILJS_USER_ID` con il vostro User ID
   - `YOUR_SERVICE_ID` con l'ID del servizio
   - `YOUR_TEMPLATE_ID` con l'ID del template

### 2. Deploy su Netlify

1. Pushare il codice su GitHub
2. Collegare repository a Netlify
3. Deploy automatico

## Compliance GDPR

- ❌ Nessun dato salvato localmente o su server
- ✅ Dati inviati solo via email sicura
- ✅ Informativa privacy completa
- ✅ Consenso esplicito richiesto
- ✅ Timestamp per validità legale
- ✅ Tracciamento IP per autenticità

## Struttura File

```
ModuloPrivacu/
├── index.html          # Struttura principale
├── styles.css          # Stili moderni e responsive
├── script.js           # Logica applicazione
├── testo.txt.txt      # Testo consenso originale
└── README.md          # Documentazione
```

## Tecnologie Utilizzate

- HTML5 semantico
- CSS3 con Grid e Flexbox
- JavaScript ES6+
- jsPDF per generazione PDF
- EmailJS per invio email
- API Ipify per rilevamento IP

## Sicurezza

- Validazione lato client e server
- Sanitizzazione input
- Protezione CSRF
- Compliance GDPR completa
- Nessun salvataggio dati sensibili