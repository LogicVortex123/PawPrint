/**
 * Email Templates
 * HTML + plain-text bodies for every email PawPrint sends: the daily reminder
 * digest, appointment confirmations and password resets. All share one layout.
 */

const { appUrl } = require('../config/env');

const BRAND_COLOR = '#245C4A'; // paw-forest green
const ACCENT_COLOR = '#f59e0b'; // amber for upcoming
const INFO_COLOR = '#6b7280'; // slate for info

const URGENCY_CONFIG = {
  urgent: { color: '#ef4444', label: '🔴 Urgent', bg: '#fef2f2' },
  upcoming: { color: ACCENT_COLOR, label: '🟡 Upcoming', bg: '#fffbeb' },
  info: { color: INFO_COLOR, label: 'ℹ️ Info', bg: '#f9fafb' },
};

const TYPE_ICON = {
  vaccination: '💉',
  appointment: '🏥',
  weight: '⚖️',
  medication: '💊',
};

// Pet names, vaccine names, notes etc. are typed by users — never trust them as HTML
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function button(href, label) {
  return `
    <div style="text-align: center; margin-top: 28px;">
      <a href="${escapeHtml(href)}"
        style="display: inline-block; background: ${BRAND_COLOR}; color: #ffffff; font-size: 14px; font-weight: 700;
        padding: 12px 28px; border-radius: 999px; text-decoration: none;">
        ${label}
      </a>
    </div>`;
}

// Shared outer layout: green header, white body card, grey footer
function layout({ title, subtitle, bodyHtml, footerHtml }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px;">
          <tr>
            <td style="background: ${BRAND_COLOR}; border-radius: 16px 16px 0 0; padding: 28px 32px;">
              <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">🐾 PawPrint</div>
              <div style="font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 4px;">${escapeHtml(subtitle)}</div>
            </td>
          </tr>
          <tr>
            <td style="background: #ffffff; padding: 28px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background: #f9fafb; border-radius: 0 0 16px 16px; padding: 20px 32px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">${footerHtml}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const REMINDER_FOOTER = `You're receiving this because you turned on email reminders in PawPrint.<br />
  To stop them, go to <strong>Account Settings → Reminders</strong> and turn off <em>Email reminders</em>.`;

/**
 * Daily reminder digest.
 * @param {{ userName: string, reminders: object[], leadDays: number }} options
 * @returns {{ subject: string, html: string, text: string }}
 */
function buildReminderEmail({ userName, reminders, leadDays }) {
  const urgentCount = reminders.filter((r) => r.urgency === 'urgent').length;
  const allClear = reminders.length === 0;
  const subject = urgentCount > 0
    ? `🐾 PawPrint — ${urgentCount} urgent reminder${urgentCount > 1 ? 's' : ''} for your pet${new Set(reminders.map((r) => r.petId)).size > 1 ? 's' : ''}`
    : allClear
      ? '🐾 PawPrint — All caught up, nothing due'
      : '🐾 PawPrint — Your pet health reminders for today';

  const reminderCards = reminders
    .map((r) => {
      const cfg = URGENCY_CONFIG[r.urgency];
      const icon = TYPE_ICON[r.type] || '📋';
      return `
        <tr>
          <td style="padding: 8px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: ${cfg.bg}; border-left: 4px solid ${cfg.color}; border-radius: 8px; padding: 14px 16px;">
              <tr>
                <td>
                  <div style="font-size: 11px; font-weight: 700; color: ${cfg.color}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
                    ${cfg.label} &nbsp;·&nbsp; ${icon} ${r.type.charAt(0).toUpperCase() + r.type.slice(1)} &nbsp;·&nbsp; 🐾 ${escapeHtml(r.petName)}
                  </div>
                  <div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 3px;">${escapeHtml(r.title)}</div>
                  <div style="font-size: 13px; color: #6b7280;">${escapeHtml(r.message)}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
    })
    .join('');

  const html = layout({
    title: subject,
    subtitle: 'Pet Health Reminders',
    bodyHtml: `
      <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111827;">Hi ${escapeHtml(userName)} 👋</p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #6b7280;">
        ${allClear
          ? `Good news — nothing is overdue or due in the next ${leadDays} days. Email reminders are working, and you'll hear from us when something comes up.`
          : `Here are your pet health reminders for today. You have <strong>${reminders.length} reminder${reminders.length !== 1 ? 's' : ''}</strong> based on your ${leadDays}-day look-ahead window.`}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${reminderCards}</table>
      ${button(appUrl, 'Open PawPrint Dashboard →')}`,
    footerHtml: REMINDER_FOOTER,
  });

  const text = [
    `Hi ${userName},`,
    '',
    allClear
      ? `Nothing is overdue or due in the next ${leadDays} days — you're all caught up.`
      : `Here are your PawPrint pet health reminders (${leadDays}-day window):`,
    '',
    ...reminders.map((r) => `[${r.urgency.toUpperCase()}] ${r.petName} — ${r.title}: ${r.message}`),
    '',
    `Open PawPrint: ${appUrl}`,
    '',
    'To stop these emails, go to Account Settings → Reminders → Email reminders.',
  ].join('\n');

  return { subject, html, text };
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Sent right after an appointment is booked or moved to a new time.
 * @param {{ userName: string, petName: string, appointment: object, kind: 'booked' | 'rescheduled' }} options
 */
function buildAppointmentEmail({ userName, petName, appointment, kind }) {
  const reason = appointment.reason || 'Vet appointment';
  const when = formatDateTime(appointment.date);
  const clinic = [appointment.clinic?.name, appointment.clinic?.address].filter(Boolean).join(', ');
  const verb = kind === 'rescheduled' ? 'moved' : 'booked';
  const subject = `🐾 ${petName}'s ${reason.toLowerCase()} is ${verb} — ${when}`;

  const row = (label, value) => value ? `
    <tr>
      <td style="padding: 6px 0; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; width: 90px; vertical-align: top;">${label}</td>
      <td style="padding: 6px 0; font-size: 14px; color: #111827; font-weight: 600;">${escapeHtml(value)}</td>
    </tr>` : '';

  const html = layout({
    title: subject,
    subtitle: kind === 'rescheduled' ? 'Appointment Rescheduled' : 'Appointment Confirmed',
    bodyHtml: `
      <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111827;">Hi ${escapeHtml(userName)} 👋</p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #6b7280;">
        ${kind === 'rescheduled' ? `${escapeHtml(petName)}'s appointment has a new time.` : `${escapeHtml(petName)}'s appointment is booked.`}
        The calendar invite attached to this email adds it to Google Calendar, Apple Calendar or Outlook in one tap.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f7f3; border-left: 4px solid ${BRAND_COLOR}; border-radius: 8px; padding: 14px 16px;">
        ${row('Pet', petName)}
        ${row('What', reason)}
        ${row('When', when)}
        ${row('Where', clinic)}
        ${row('Notes', appointment.notes)}
      </table>
      <p style="margin: 18px 0 0; font-size: 13px; color: #6b7280;">We'll also include it in your daily reminder email as the day gets closer.</p>
      ${button(`${appUrl}/features?pet=${appointment.pet}&tab=vet-appointments`, 'View in PawPrint →')}`,
    footerHtml: REMINDER_FOOTER,
  });

  const text = [
    `Hi ${userName},`,
    '',
    `${petName}'s appointment is ${verb}.`,
    '',
    `What: ${reason}`,
    `When: ${when}`,
    clinic ? `Where: ${clinic}` : null,
    appointment.notes ? `Notes: ${appointment.notes}` : null,
    '',
    `View in PawPrint: ${appUrl}/features?tab=vet-appointments`,
  ].filter((line) => line !== null).join('\n');

  return { subject, html, text };
}

/**
 * Password reset link. The link carries a one-time token and expires.
 * @param {{ userName: string, resetUrl: string, expiresInMinutes: number }} options
 */
function buildPasswordResetEmail({ userName, resetUrl, expiresInMinutes }) {
  const subject = '🐾 Reset your PawPrint password';

  const html = layout({
    title: subject,
    subtitle: 'Password Reset',
    bodyHtml: `
      <p style="margin: 0 0 6px; font-size: 18px; font-weight: 700; color: #111827;">Hi ${escapeHtml(userName)} 👋</p>
      <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280;">
        Someone (hopefully you) asked to reset the password for your PawPrint account. Click the button below to choose a new one.
      </p>
      <p style="margin: 0; font-size: 14px; color: #6b7280;">This link works once and expires in <strong>${expiresInMinutes} minutes</strong>.</p>
      ${button(resetUrl, 'Choose a new password →')}
      <p style="margin: 24px 0 0; font-size: 12px; color: #9ca3af; word-break: break-all;">
        Button not working? Paste this into your browser:<br />${escapeHtml(resetUrl)}
      </p>`,
    footerHtml: "Didn't ask for this? You can safely ignore this email — your password won't change.",
  });

  const text = [
    `Hi ${userName},`,
    '',
    'Someone (hopefully you) asked to reset the password for your PawPrint account.',
    `Choose a new password here (works once, expires in ${expiresInMinutes} minutes):`,
    resetUrl,
    '',
    "Didn't ask for this? Ignore this email — your password won't change.",
  ].join('\n');

  return { subject, html, text };
}

module.exports = { buildReminderEmail, buildAppointmentEmail, buildPasswordResetEmail, escapeHtml };
