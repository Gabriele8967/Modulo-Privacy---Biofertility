const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        
        // Configura trasportatore Gmail
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        // Prepara allegati
        const attachments = [
            {
                filename: `modulo_privacy_${data.nome}_${data.cognome}.pdf`,
                content: data.pdfBase64,
                encoding: 'base64'
            }
        ];

        // Aggiungi documenti di identità se presenti
        if (data.documentoFrente) {
            attachments.push({
                filename: `documento_fronte_${data.nome}.${data.documentoFrenteExt}`,
                content: data.documentoFrente,
                encoding: 'base64'
            });
        }

        if (data.documentoRetro) {
            attachments.push({
                filename: `documento_retro_${data.nome}.${data.documentoRetroExt}`,
                content: data.documentoRetro,
                encoding: 'base64'
            });
        }

        // Aggiungi documenti partner se presenti
        if (data.includePartner && data.documentoFrentePartner) {
            attachments.push({
                filename: `documento_fronte_${data.nomePartner}.${data.documentoFrentePartnerExt}`,
                content: data.documentoFrentePartner,
                encoding: 'base64'
            });
        }

        if (data.includePartner && data.documentoRetroPartner) {
            attachments.push({
                filename: `documento_retro_${data.nomePartner}.${data.documentoRetroPartnerExt}`,
                content: data.documentoRetroPartner,
                encoding: 'base64'
            });
        }

        // Configura email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: 'centrimanna2@gmail.com',
            subject: `Nuovo Modulo Privacy - ${data.nome} ${data.cognome}`,
            html: `
                <h2>Nuovo Modulo Privacy Compilato</h2>
                
                <h3>Dati Paziente Principale:</h3>
                <ul>
                    <li><strong>Nome:</strong> ${data.nome} ${data.cognome}</li>
                    <li><strong>Data nascita:</strong> ${data.dataNascita}</li>
                    <li><strong>Luogo nascita:</strong> ${data.luogoNascita}</li>
                    <li><strong>Professione:</strong> ${data.professione}</li>
                    <li><strong>Indirizzo:</strong> ${data.indirizzo}, ${data.citta} ${data.cap}</li>
                    <li><strong>Codice Fiscale:</strong> ${data.codiceFiscale}</li>
                    <li><strong>Documento:</strong> ${data.numeroDocumento} (scad. ${data.scadenzaDocumento})</li>
                    <li><strong>Telefono:</strong> ${data.telefono}</li>
                    <li><strong>Email:</strong> ${data.email}</li>
                    <li><strong>Email comunicazioni:</strong> ${data.emailComunicazioni}</li>
                </ul>

                ${data.includePartner ? `
                <h3>Dati Partner:</h3>
                <ul>
                    <li><strong>Nome:</strong> ${data.nomePartner} ${data.cognomePartner}</li>
                    <li><strong>Data nascita:</strong> ${data.dataNascitaPartner}</li>
                    <li><strong>Luogo nascita:</strong> ${data.luogoNascitaPartner}</li>
                    <li><strong>Professione:</strong> ${data.professionePartner}</li>
                    <li><strong>Indirizzo:</strong> ${data.indirizzoPartner}, ${data.cittaPartner} ${data.capPartner}</li>
                    <li><strong>Codice Fiscale:</strong> ${data.codiceFiscalePartner}</li>
                    <li><strong>Documento:</strong> ${data.numeroDocumentoPartner} (scad. ${data.scadenzaDocumentoPartner})</li>
                    <li><strong>Telefono:</strong> ${data.telefonoPartner}</li>
                    <li><strong>Email:</strong> ${data.emailPartner}</li>
                </ul>
                ` : ''}

                <h3>Informazioni Legali:</h3>
                <ul>
                    <li><strong>Data compilazione:</strong> ${data.timestamp}</li>
                    <li><strong>Indirizzo IP:</strong> ${data.ipAddress}</li>
                    <li><strong>Browser:</strong> ${data.userAgent}</li>
                </ul>

                <p><em>Modulo compilato con consenso GDPR esplicito per il Centro Biofertility.</em></p>
                
                <hr>
                <p><small>Centro Biofertility - Junior s.r.l.<br>
                Viale degli Eroi di Rodi 214, 00128-Roma<br>
                Tel: 06-5083375</small></p>
            `,
            attachments: attachments
        };

        // Log di sicurezza per tracciabilità
        const securityLog = {
            timestamp: new Date().toISOString(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            paziente: `${data.nome} ${data.cognome}`,
            codiceFiscale: data.codiceFiscale,
            documentHash: Buffer.from(JSON.stringify({
                nome: data.nome,
                cognome: data.cognome,
                cf: data.codiceFiscale,
                timestamp: Date.now(),
                ip: data.ipAddress
            })).toString('base64').substring(0, 16),
            action: 'CONSENSO_PRIVACY_INVIATO'
        };
        
        console.log('PRIVACY_CONSENT_LOG:', JSON.stringify(securityLog));

        // Invia email
        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST'
            },
            body: JSON.stringify({ 
                success: true, 
                message: 'Email inviata con successo',
                documentId: securityLog.documentHash,
                timestamp: securityLog.timestamp
            })
        };

    } catch (error) {
        console.error('Errore invio email:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Errore nell\'invio dell\'email' })
        };
    }
};