import { describe, expect, it } from 'vitest';
import { formatConfirmationFirstName, getConfirmationFirstName } from '../src/lib/confirmation';

describe('confirmation personalization', () => {
  it('uses the English first-name parameter and formats it for the greeting', () => {
    const firstName = getConfirmationFirstName('?firstName=alice');

    expect(formatConfirmationFirstName(firstName)).toBe('Alice');
  });

  it('keeps the existing French form parameter working for the shared confirmation renderer', () => {
    const firstName = getConfirmationFirstName('?prenom=marie');

    expect(formatConfirmationFirstName(firstName)).toBe('Marie');
  });
});
