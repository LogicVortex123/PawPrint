const nodemailer = require('nodemailer');
const { email: emailCfg, nodeEnv } = require('../config/env');

// Real SMTP transporter (Gmail etc.). Nodemailer is lazy — it won't actually
// connect to the SMTP server until the first sendMail call.
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: emailCfg.host,
      port: emailCfg.port,
      secure: emailCfg.port === 465, // true for 465, false for 587 (STARTTLS)
      auth: {
        user: emailCfg.user,
        pass: emailCfg.pass,
      },
    });
  }
  return _transporter;
}

function isConfigured() {
  if (!emailCfg.user || !emailCfg.pass) return false;
  if (emailCfg.user === 'your_gmail@gmail.com' || emailCfg.pass === 'your_gmail_app_password') return false;
  return true;
}

// Development fallback when no SMTP is configured: a throwaway Ethereal
// (https://ethereal.email) inbox. Mail sent there is never delivered to anyone,
// but each message gets a preview link where it can be viewed in the browser —
// so email features can be checked end to end without a Gmail App Password.
let _devTransporterPromise = null;

function getDevTransporter() {
  if (!_devTransporterPromise) {
    _devTransporterPromise = nodemailer
      .createTestAccount()
      .then((account) => nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass },
      }))
      .catch((err) => {
        // Let the next send try again (e.g. after the network comes back)
        _devTransporterPromise = null;
        throw err;
      });
  }
  return _devTransporterPromise;
}

/**
 * Send an email.
 * @param {Object} options
 * @param {string|string[]} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {string} [options.text] — plain-text fallback
 * @param {Object[]} [options.attachments] — Nodemailer attachments (e.g. an .ics invite)
 * @returns {Promise<{ delivered: boolean, simulated: boolean, messageId?: string, previewUrl?: string }>}
 *   delivered: really sent to the recipient's inbox.
 *   simulated: not delivered; previewUrl (development only) shows what would have been sent.
 */
async function sendMail({ to, subject, html, text, attachments }) {
  const message = { from: emailCfg.from, to, subject, html, text, attachments };

  if (isConfigured()) {
    const info = await getTransporter().sendMail(message);
    return { delivered: true, simulated: false, messageId: info.messageId };
  }

  // Automated tests never touch the network
  if (nodeEnv === 'development') {
    try {
      const info = await (await getDevTransporter()).sendMail(message);
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[email] [Preview Mode] "${subject}" for ${to} was NOT delivered (no SMTP in backend/.env). View it here: ${previewUrl}`);
      return { delivered: false, simulated: true, messageId: info.messageId, previewUrl };
    } catch (err) {
      console.warn(`[email] Could not create a preview inbox (${err.message}).`);
    }
  }

  console.log(`[email] [Simulation Mode] Real SMTP credentials not set in backend/.env — simulated email send to ${to}: "${subject}"`);
  return { delivered: false, simulated: true };
}

module.exports = { sendMail, isConfigured };
