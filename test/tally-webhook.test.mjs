import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import handler, { buildResendPayload } from '../netlify/functions/tally-webhook.mjs';

const webhookSecret = 'test-tally-secret';
const resendApiKey = 're_test_key';

function createPayload(formId = 'eqOGYl') {
  return {
    eventId: 'evt_123',
    eventType: 'FORM_RESPONSE',
    createdAt: '2026-08-14T10:00:00.000Z',
    data: {
      formId,
      formName: 'Préparer votre croisière',
      responseId: 'response_123',
      submissionId: 'submission_123',
      respondentId: 'respondent_123',
      createdAt: '2026-08-14T10:00:00.000Z',
      fields: [
        { key: 'question_email', label: 'Email', type: 'INPUT_EMAIL', value: 'alice@example.com' },
        { key: 'question_name', label: 'Nom', type: 'INPUT_TEXT', value: 'Alice' },
      ],
    },
  };
}

function sign(body) {
  return createHmac('sha256', webhookSecret).update(body).digest('base64');
}

function stubNetlifyEnv(values) {
  vi.stubGlobal('Netlify', { env: { get: (name) => values[name] } });
}

function createRequest(payload, options = {}) {
  const body = JSON.stringify(payload);
  return new Request('https://tahitiguestboat.com/api/tally-webhook', {
    method: options.method ?? 'POST',
    headers: {
      'content-type': 'application/json',
      'tally-signature': options.signature ?? sign(body),
    },
    body: options.method === 'GET' ? undefined : body,
  });
}

describe('Tally webhook', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('forwards a signed form response to the Resend event API', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"object":"event"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    stubNetlifyEnv({
      TALLY_WEBHOOK_SECRET: webhookSecret,
      RESEND_API_KEY: resendApiKey,
      RESEND_NOTIFICATION_EMAIL: 'tahitiguestboat@gmail.com',
    });

    const response = await handler(createRequest(createPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, event: 'tally_webhook', recipients: 1 });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.resend.com/events/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: `Bearer ${resendApiKey}`,
        }),
        body: expect.any(String),
      }),
    );

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(requestBody).toMatchObject({
      event: 'tally_webhook',
      email: 'tahitiguestboat@gmail.com',
      payload: {
        tallyEventId: 'evt_123',
        formId: 'eqOGYl',
        submissionId: 'submission_123',
        answers: {
          Email: 'alice@example.com',
          Nom: 'Alice',
        },
      },
    });
  });

  it('rejects an invalid Tally signature without calling Resend', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    stubNetlifyEnv({ TALLY_WEBHOOK_SECRET: webhookSecret, RESEND_API_KEY: resendApiKey });

    const response = await handler(createRequest(createPayload(), { signature: 'invalid' }));

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts an unsigned submission when no Tally secret is configured', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"object":"event"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    stubNetlifyEnv({ RESEND_API_KEY: resendApiKey, RESEND_NOTIFICATION_EMAIL: 'tahitiguestboat@gmail.com' });

    const response = await handler(createRequest(createPayload(), { signature: '' }));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('triggers the Resend automation once for each internal recipient', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"object":"event"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    stubNetlifyEnv({
      RESEND_API_KEY: resendApiKey,
      RESEND_NOTIFICATION_EMAILS: 'leo.fitoussi689@gmail.com, tahitiguestboat@gmail.com',
    });

    const response = await handler(createRequest(createPayload(), { signature: '' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, event: 'tally_webhook', recipients: 2 });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const recipients = fetchMock.mock.calls.map(([, options]) => JSON.parse(options.body).email);
    expect(recipients).toEqual(['leo.fitoussi689@gmail.com', 'tahitiguestboat@gmail.com']);
  });

  it('accepts both English and French Tally forms and ignores unrelated forms', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"object":"event"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    stubNetlifyEnv({
      TALLY_FORM_ID: 'eqOGYl',
      TALLY_FORM_IDS: 'eqOGYl,nPrj8V',
      RESEND_API_KEY: resendApiKey,
      RESEND_NOTIFICATION_EMAIL: 'tahitiguestboat@gmail.com',
    });

    const englishResponse = await handler(createRequest(createPayload('eqOGYl'), { signature: '' }));
    const frenchResponse = await handler(createRequest(createPayload('nPrj8V'), { signature: '' }));
    const unrelatedResponse = await handler(createRequest(createPayload('unrelated-form'), { signature: '' }));

    expect(englishResponse.status).toBe(200);
    expect(frenchResponse.status).toBe(200);
    expect(await unrelatedResponse.json()).toEqual({ ok: true, ignored: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('extracts the respondent first name for a dynamic email subject', () => {
    const payload = createPayload('nPrj8V');
    payload.data.fields = [
      { key: 'first_name', label: 'Prénom', type: 'INPUT_TEXT', value: 'Moana' },
    ];

    expect(buildResendPayload(payload).respondentFirstName).toBe('Moana');
  });
});
