import { describe, expect, it } from 'vitest';
import {
  consumeTallySubmission,
  getTallyFormEventFromMessage,
  getTallySubmissionFromMessage,
  rememberTallySubmission,
} from '../src/lib/tally-submission';

function createSessionStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('Tally submission confirmation', () => {
  it('makes one confirmed Tally submission available to its matching confirmation page exactly once', () => {
    const storage = createSessionStorage();
    const submission = { formId: 'nPrj8V', submissionId: 'submission_123' };

    rememberTallySubmission(storage, submission, 1_000);

    expect(consumeTallySubmission(storage, submission, 1_001)).toBe(true);
    expect(consumeTallySubmission(storage, submission, 1_002)).toBe(false);
  });

  it('does not accept a stale submission proof on a later manual visit to a confirmation page', () => {
    const storage = createSessionStorage();
    const submission = { formId: 'eqOGYl', submissionId: 'submission_456' };

    rememberTallySubmission(storage, submission, 1_000);

    expect(consumeTallySubmission(storage, submission, 301_000)).toBe(false);
  });

  it('accepts only the submitted event from the embedded Tally form', () => {
    const submitted = JSON.stringify({
      eventName: 'Tally.FormSubmitted',
      payload: { formId: 'nPrj8V', id: 'submission_789' },
    });

    expect(getTallySubmissionFromMessage('https://tally.so', submitted, 'nPrj8V')).toEqual({
      formId: 'nPrj8V',
      submissionId: 'submission_789',
    });
    expect(
      getTallySubmissionFromMessage(
        'https://tally.so',
        JSON.stringify({ eventName: 'Tally.FormPageView', payload: { formId: 'nPrj8V' } }),
        'nPrj8V',
      ),
    ).toBeNull();
    expect(getTallySubmissionFromMessage('https://untrusted.example', submitted, 'nPrj8V')).toBeNull();
  });

  it('identifies the first form page view and the completed submission for the embedded form', () => {
    const pageView = JSON.stringify({
      eventName: 'Tally.FormPageView',
      payload: { formId: 'nPrj8V', page: 1 },
    });
    const submitted = JSON.stringify({
      eventName: 'Tally.FormSubmitted',
      payload: { formId: 'nPrj8V', id: 'submission_789' },
    });

    expect(getTallyFormEventFromMessage('https://tally.so', pageView, 'nPrj8V')).toBe('started');
    expect(getTallyFormEventFromMessage('https://tally.so', submitted, 'nPrj8V')).toBe('submitted');
    expect(getTallyFormEventFromMessage('https://tally.so', pageView, 'eqOGYl')).toBeNull();
  });
});
