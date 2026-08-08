/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

let admin = null;

try {
    admin = require('firebase-admin');
} catch (error) {
    console.warn('⚠️ Firebase Admin SDK package is not installed. Push notifications will be bypassed.');
    module.exports = null;
}

if (admin) {
    try {
        // Pull a real Firebase service-account JSON string from either of the
        // production env names we currently support. The repository is observed
        // to expose FIREBASE_SERVICE_ACCOUNT_KEY in the environment file instead of
        // FIREBASE_SERVICE_ACCOUNT, so both names are treated as supported inputs.
        const credentialSource = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (credentialSource) {
            const serviceAccount = typeof credentialSource === 'string'
                ? JSON.parse(credentialSource)
                : credentialSource;

            const hasApps = admin && typeof admin.getApps === 'function' && admin.getApps().length > 0;
            if (!hasApps) {
                admin.initializeApp({
                    credential: admin.cert(serviceAccount)
                });

                console.log('✅ Firebase Admin SDK Initialized Successfully');
            } else {
                console.log('✅ Firebase Admin SDK already initialized');
            }
        } else {
            console.warn('⚠️ Firebase credentials missing. Push notifications will be bypassed.');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error.message);
    }
}

module.exports = admin;