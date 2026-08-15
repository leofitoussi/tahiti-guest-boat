import { createHmac, timingSafeEqual } from 'node:crypto';

const RESEND_EVENTS_URL = 'https://api.resend.com/events/send';
const DEFAULT_EVENT_NAME = 'tally_webhook';

function getEnv(name) {
  const value = globalThis.Netlify?.env?.get(name) || process.env[name];
  return value?.trim() || undefined;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function isValidTallySignature(rawBody, receivedSignature, secret) {
  if (!rawBody || !receivedSignature || !secret) return false;

  const expectedSignature = createHmac('sha256', secret).update(rawBody).digest('base64');
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  return received.length === expected.length && timingSafeEqual(received, expected);
}

function isEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function parseCommaSeparatedList(value) {
  return value
    ?.split(',')
    .map((email) => email.trim())
    .filter(Boolean) ?? [];
}

export function findSubmissionEmail(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];

  const emailField = fields.find((field) => field?.type === 'INPUT_EMAIL' && isEmail(field.value));
  if (emailField) return emailField.value.trim();

  const labelledEmailField = fields.find(
    (field) => /email|e-mail|courriel/i.test(String(field?.label ?? '')) && isEmail(field.value),
  );
  return labelledEmailField?.value.trim() ?? null;
}

export function findSubmissionFirstName(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];
  const firstNameField = fields.find(
    (field) =>
      /^(prénom|prenom|first\s*name|given\s*name)$/i.test(String(field?.label ?? '').trim()) &&
      typeof field.value === 'string' &&
      field.value.trim(),
  );

  return firstNameField?.value.trim() ?? null;
}

function serializeAnswer(field) {
  if (Array.isArray(field.value) && Array.isArray(field.options)) {
    const labels = new Map(field.options.map((option) => [option.id, option.text]));
    return field.value.map((value) => labels.get(value) ?? value);
  }

  return field.value;
}

export function buildResendPayload(payload) {
  const fields = Array.isArray(payload?.data?.fields) ? payload.data.fields : [];
  const answers = {};

  for (const field of fields) {
    if (!field || field.value === undefined) continue;
    const label = String(field.label || field.key || 'Réponse');
    answers[label in answers ? `${label} (${field.key})` : label] = serializeAnswer(field);
  }

  const answersText = Object.entries(answers)
    .map(([label, value]) => `${label}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join('\n');

  return {
    tallyEventId: payload.eventId ?? null,
    formId: payload.data?.formId ?? null,
    formName: payload.data?.formName ?? null,
    submissionId: payload.data?.submissionId ?? payload.data?.responseId ?? null,
    responseId: payload.data?.responseId ?? null,
    respondentId: payload.data?.respondentId ?? null,
    submittedAt: payload.data?.createdAt ?? payload.createdAt ?? null,
    submissionPreviewUrl: payload.data?.submissionPreviewUrl ?? null,
    submissionPdfUrl: payload.data?.submissionPdfUrl ?? null,
    respondentFirstName: findSubmissionFirstName(payload),
    answersText,
    answers,
  };
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { allow: 'POST' },
    });
  }

  const webhookSecret = getEnv('TALLY_WEBHOOK_SECRET');
  const resendApiKey = getEnv('RESEND_API_KEY');

  if (!resendApiKey) {
    console.error('Tally webhook is missing RESEND_API_KEY');
    return jsonResponse({ ok: false, error: 'Webhook is not configured' }, 503);
  }

  const rawBody = await request.text();
  const signature = request.headers.get('tally-signature');

  if (webhookSecret && !isValidTallySignature(rawBody, signature, webhookSecret)) {
    return jsonResponse({ ok: false, error: 'Invalid signature' }, 401);
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON' }, 400);
  }

  if (payload.eventType !== 'FORM_RESPONSE') {
    return jsonResponse({ ok: true, ignored: true });
  }

  const configuredFormIds = parseCommaSeparatedList(getEnv('TALLY_FORM_IDS') || getEnv('TALLY_FORM_ID'));
  if (configuredFormIds.length && !configuredFormIds.includes(payload.data?.formId)) {
    return jsonResponse({ ok: true, ignored: true });
  }

  const configuredRecipients = getEnv('RESEND_NOTIFICATION_EMAILS') || getEnv('RESEND_NOTIFICATION_EMAIL');
  const recipientEmails = configuredRecipients
    ? parseCommaSeparatedList(configuredRecipients)
    : [findSubmissionEmail(payload)].filter(Boolean);

  if (!recipientEmails.length || recipientEmails.some((email) => !isEmail(email))) {
    return jsonResponse({ ok: false, error: 'No valid submission email found' }, 422);
  }

  const eventName = getEnv('RESEND_EVENT_NAME') || DEFAULT_EVENT_NAME;
  const resendResponses = await Promise.all(
    recipientEmails.map((recipientEmail) =>
      fetch(RESEND_EVENTS_URL, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${resendApiKey}`,
          'content-type': 'application/json',
          'user-agent': 'tahiti-guest-boat/tally-webhook',
        },
        body: JSON.stringify({
          event: eventName,
          email: recipientEmail,
          payload: buildResendPayload(payload),
        }),
        signal: AbortSignal.timeout(8000),
      }),
    ),
  );

  if (resendResponses.some((response) => !response.ok)) {
    console.error('Resend event failed for one or more recipients');
    return jsonResponse({ ok: false, error: 'Resend event failed' }, 502);
  }

  return jsonResponse({ ok: true, event: eventName, recipients: recipientEmails.length });
}
