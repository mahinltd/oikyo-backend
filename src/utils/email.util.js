/* ©2026 OIKYO Mahin Ltd develop by (Tanvir). */

const { Resend } = require('resend');
const ApiError = require('./ApiError');

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// HTML Template Generator for Enterprise-Level Design
const generateEmailTemplate = ({ title, message, link, btnText, expiryText, securityText }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6f8; padding: 40px 0;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea;">
                        <!-- Header with Text Logo -->
                        <tr>
                            <td align="center" style="padding: 40px 20px 30px; border-bottom: 1px solid #f0f0f0;">
                                <a href="https://oikyo.me" target="_blank" style="text-decoration: none;">
                                    <img src="https://res.cloudinary.com/damfcrt68/image/upload/v1784455592/oikyo_text_uhi9w5.png" alt="OIKYO" width="160" style="display: block; border: 0; outline: none;">
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 40px 40px 20px; color: #333333; line-height: 1.6; font-size: 16px;">
                                <h2 style="margin-top: 0; color: #111111; font-size: 22px; font-weight: 600; text-align: center;">${title}</h2>
                                <p style="margin-bottom: 30px; color: #444444;">${message}</p>
                                
                                <!-- CTA Button -->
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td align="center">
                                            <a href="${link}" target="_blank" style="display: inline-block; padding: 14px 35px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">${btnText}</a>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Fallback Plain Text Link -->
                                <p style="margin-top: 30px; font-size: 13px; color: #666666; background-color: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px dashed #dddddd; word-break: break-all;">
                                    If the button doesn't work, copy and paste the following link into your browser:<br>
                                    <a href="${link}" target="_blank" style="color: #0056b3; text-decoration: underline; display: inline-block; margin-top: 5px;">${link}</a>
                                </p>
                                
                                <!-- Validity & Security Warning -->
                                <p style="margin-top: 25px; font-size: 14px; color: #555555; font-weight: 500;">⏳ ${expiryText}</p>
                                <p style="margin-top: 10px; font-size: 13px; color: #777777; line-height: 1.5; border-left: 3px solid #ffcc00; padding-left: 10px;">🔒 ${securityText}</p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #fafbfc; padding: 30px 40px; text-align: center; border-top: 1px solid #f0f0f0;">
                                <img src="https://res.cloudinary.com/damfcrt68/image/upload/v1784311427/oikyo_icon_ceiilh.webp" alt="OIKYO Icon" width="32" style="display: block; margin: 0 auto 15px; border: 0; outline: none; opacity: 0.8;">
                                <p style="margin: 0 0 10px; font-size: 13px; color: #888888; line-height: 1.5;">
                                    &copy; 2026 OIKYO Mahin Ltd. All rights reserved.<br>
                                    Need help? Contact our <a href="mailto:support@oikyo.me" style="color: #666666; text-decoration: underline; font-weight: 500;">Support Team</a>.
                                </p>
                                <p style="margin: 0; font-size: 11px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 0.5px;">
                                    This is an automated email, please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

class EmailUtil {
    async sendVerificationEmail(toEmail, token) {
        const verificationLink = `https://oikyo.me/verify-email?token=${token}`;
        
        const emailHtml = generateEmailTemplate({
            title: 'Verify your OIKYO Account',
            message: 'Welcome to OIKYO! To complete your registration and unlock full access to our enterprise platform, please verify your email address by clicking the button below.',
            link: verificationLink,
            btnText: 'Verify Email Address',
            expiryText: 'This verification link is valid for 24 hours.',
            securityText: 'If you did not create an account using this email address, please ignore this email. No action is required.'
        });

        if (!resend) {
            return;
        }

        try {
            await resend.emails.send({
                from: 'OIKYO Security <security@oikyo.me>',
                to: toEmail,
                subject: 'Verify your OIKYO Account',
                html: emailHtml
            });
        } catch (error) {
            throw new ApiError(500, 'Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(toEmail, token) {
        const resetLink = `https://oikyo.me/reset-password?token=${token}`;
        
        const emailHtml = generateEmailTemplate({
            title: 'Reset your OIKYO Password',
            message: 'We received a request to reset the password for your OIKYO account. If you initiated this request, please click the button below to set a new secure password.',
            link: resetLink,
            btnText: 'Reset Password',
            expiryText: 'This password reset link will expire in 24 hours.',
            securityText: 'If you did not request a password reset, please ignore this email immediately to ensure your account security remains intact.'
        });

        if (!resend) {
            return;
        }

        try {
            await resend.emails.send({
                from: 'OIKYO Security <security@oikyo.me>',
                to: toEmail,
                subject: 'Reset your OIKYO Password',
                html: emailHtml
            });
        } catch (error) {
            throw new ApiError(500, 'Failed to send password reset email');
        }
    }
}

module.exports = new EmailUtil();