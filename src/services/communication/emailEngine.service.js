/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const { Resend } = require('resend');
const { EmailTemplate, EventRouting } = require('../../models/communication/notificationConfig.model');
const fs = require('fs');
const path = require('path');

// Initialize Resend only when the API key is present. Import-time
// construction should stay side-effect-free when the runtime does not
// yet provide a production email credential.
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

class EmailEngineService {
    
    // Helper to replace {{variables}} in a string
    _replaceVariables(templateStr, dataObj) {
        return templateStr.replace(/{{(.*?)}}/g, (match, key) => {
            return dataObj[key.trim()] || '';
        });
    }

    // Load the Unified HTML Wrapper
    _getUnifiedWrapper() {
        const wrapperPath = path.join(__dirname, '../../templates/email/unifiedWrapper.html');
        return fs.readFileSync(wrapperPath, 'utf8');
    }

    async dispatchEmail(eventName, recipientEmail, payloadData) {
        try {
            if (!resend) {
                console.warn(`[Email Engine] Skipping dispatch for '${eventName}' because RESEND_API_KEY is not configured.`);
                return false;
            }

            // 1. Fetch Configuration from Database (No Hardcoding)
            const routingConfig = await EventRouting.findOne({ eventName });
            const templateConfig = await EmailTemplate.findOne({ eventName, isActive: true });

            if (!routingConfig || !templateConfig) {
                console.warn(`[Email Engine] Configuration missing for event: ${eventName}`);
                return false;
            }

            // 2. Prepare Global Variables
            const globalVars = {
                currentYear: new Date().getFullYear(),
                supportEmail: 'support@oikyo.me', // Can also be fetched from global config
                privacyPolicyUrl: 'https://oikyo.me/privacy-policy',
                iconLogoUrl: 'https://res.cloudinary.com/your-cloud/image/upload/oikyo-icon.png', // Replaced with your actual icon
                ...payloadData
            };

            // 3. Render Subject and Body Content
            const renderedSubject = this._replaceVariables(templateConfig.subjectTemplate, globalVars);
            const renderedBodyContent = this._replaceVariables(templateConfig.bodyTemplate, globalVars);

            // 4. Inject into Unified Wrapper
            const masterWrapper = this._getUnifiedWrapper();
            const finalHtmlContent = this._replaceVariables(
                masterWrapper.replace('{{{dynamicContent}}}', renderedBodyContent),
                globalVars
            );

            // 5. Dispatch via Resend
            const emailPayload = {
                from: `${routingConfig.senderIdentity.name} <${routingConfig.senderIdentity.email}>`,
                to: recipientEmail,
                reply_to: routingConfig.replyTo,
                subject: renderedSubject,
                html: finalHtmlContent
            };

            const { data, error } = await resend.emails.send(emailPayload);

            if (error) {
                console.error(`[Resend API Error] ${error.message}`);
                return false;
            }

            return data;

        } catch (error) {
            console.error(`[Email Engine Failure] ${error.message}`);
            return false;
        }
    }
}

module.exports = new EmailEngineService();