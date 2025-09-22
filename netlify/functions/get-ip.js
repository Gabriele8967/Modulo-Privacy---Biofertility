exports.handler = async (event, context) => {
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Ottieni IP dal header della richiesta
        const clientIP = 
            event.headers['x-forwarded-for']?.split(',')[0] ||
            event.headers['x-real-ip'] ||
            event.headers['cf-connecting-ip'] ||
            event.headers['x-client-ip'] ||
            context.clientContext?.ip ||
            'Non disponibile';

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                ip: clientIP,
                timestamp: new Date().toISOString()
            })
        };

    } catch (error) {
        console.error('Errore get-ip:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                ip: 'Non disponibile',
                error: 'Errore interno'
            })
        };
    }
};