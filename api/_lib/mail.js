/**
 * Delivery of a validated submission to the inbox, via Resend.
 */

import { Resend } from 'resend';

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.RESEND_API_KEY) return null;
  client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * @param {{ name: string, email: string, project: string, message: string }} submission
 * @param {{ ip: string, userAgent: string, receivedAt: Date }} meta
 * @returns {Promise<{ ok: true } | { ok: false, reason: string }>}
 */
export async function deliverSubmission(submission, meta) {
  const resend = getClient();
  if (!resend) return { ok: false, reason: 'RESEND_API_KEY is not set' };

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) return { ok: false, reason: 'CONTACT_TO_EMAIL is not set' };

  // Must be an address on a domain verified in Resend. The resend.dev sender
  // works without a verified domain but can only deliver to the account owner.
  const from = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';

  const { name, email, project, message } = submission;
  const subject = `Portfolio enquiry — ${name}${project ? ` (${project})` : ''}`;

  const text = [
    `Name:    ${name}`,
    `Email:   ${email}`,
    project ? `Project: ${project}` : null,
    '',
    message,
    '',
    '—',
    `Received: ${meta.receivedAt.toISOString()}`,
    `IP:       ${meta.ip}`,
    `Agent:    ${meta.userAgent || 'unknown'}`,
  ].filter(Boolean).join('\n');

  const html = `
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;line-height:1.6;color:#1a1a1a">
      <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
      ${project ? `<p style="margin:0 0 4px"><strong>Project:</strong> ${escapeHtml(project)}</p>` : ''}
      <hr style="border:0;border-top:1px solid #ddd;margin:16px 0">
      <div style="white-space:pre-wrap">${escapeHtml(message)}</div>
      <hr style="border:0;border-top:1px solid #ddd;margin:16px 0">
      <p style="margin:0;font-size:12px;color:#777">
        Received ${escapeHtml(meta.receivedAt.toISOString())}<br>
        IP ${escapeHtml(meta.ip)}<br>
        ${escapeHtml(meta.userAgent || 'unknown')}
      </p>
    </div>
  `;

  try {
    // replyTo is the visitor, so hitting reply in the mail client goes straight
    // back to them. The From stays on the verified domain, which is what keeps
    // these out of spam.
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject,
      text,
      html,
    });

    if (error) return { ok: false, reason: error.message || 'Resend rejected the message' };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'Unknown mail failure' };
  }
}
