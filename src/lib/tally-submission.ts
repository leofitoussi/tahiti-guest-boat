export interface TallySubmission {
  formId: string;
  submissionId: string;
}

export interface TallySubmissionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const TALLY_SUBMISSION_STORAGE_KEY = 'tgb_tally_submission';
const TALLY_SUBMISSION_MAX_AGE_MS = 5 * 60 * 1_000;

interface StoredTallySubmission extends TallySubmission {
  submittedAt: number;
}

export function getTallySubmissionFromMessage(
  origin: string,
  data: unknown,
  expectedFormId: string,
): TallySubmission | null {
  if (origin !== 'https://tally.so' || typeof data !== 'string' || !data.includes('Tally.FormSubmitted')) {
    return null;
  }

  try {
    const payload = (JSON.parse(data) as { payload?: { formId?: unknown; id?: unknown } }).payload;

    if (payload?.formId !== expectedFormId || typeof payload.id !== 'string') return null;

    return { formId: payload.formId, submissionId: payload.id };
  } catch {
    return null;
  }
}

export function rememberTallySubmission(
  storage: TallySubmissionStorage,
  submission: TallySubmission,
  submittedAt: number,
) {
  storage.setItem(TALLY_SUBMISSION_STORAGE_KEY, JSON.stringify({ ...submission, submittedAt }));
}

export function consumeTallySubmission(
  storage: TallySubmissionStorage,
  submission: TallySubmission,
  _now: number,
) {
  const stored = storage.getItem(TALLY_SUBMISSION_STORAGE_KEY);
  storage.removeItem(TALLY_SUBMISSION_STORAGE_KEY);

  if (!stored) return false;

  try {
    const parsed = JSON.parse(stored) as StoredTallySubmission;
    const isFresh = Number.isFinite(parsed.submittedAt) && _now < parsed.submittedAt + TALLY_SUBMISSION_MAX_AGE_MS;

    return isFresh && parsed.formId === submission.formId && parsed.submissionId === submission.submissionId;
  } catch {
    return false;
  }
}
