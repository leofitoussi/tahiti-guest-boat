import { describe, expect, it } from 'vitest';
import { tagHomePageview } from '../src/lib/home-experiment';

const script = '<script defer src="https://analytics.tahitiguestboat.com/script.js" data-website-id="388d24a4-9679-4b9c-992d-5ac0427b099c"></script>';
describe('homepage exposure attached to the native Umami pageview', () => {
  it.each(['A', 'B'] as const)('tags the actual %s pageview before tracker initialization without adding requests or storage', variant => {
    const result = tagHomePageview(`<head>${script}</head>`, variant);
    expect(result).toContain(`data-tag="home-intro-v2:${variant}"`);
    expect(result.match(/<script/g)).toHaveLength(1);
    expect(result).not.toMatch(/localStorage|sessionStorage|cookie|fetch\(|identify/);
  });
  it('marks QA, replaces an old tag once and leaves unrelated trackers untouched', () => {
    const other = '<script src="https://other.example/script.js" data-tag="other"></script>';
    const once = tagHomePageview(script + other, 'A');
    const twice = tagHomePageview(once, 'B', true);
    expect(twice).toContain('data-tag="home-intro-v2:B:qa"');
    expect(twice).not.toContain('home-intro-v2:A');
    expect(twice).toContain(other);
  });
  it('also annotates the prepared consent-controlled loader without changing its consent gate', () => {
    const root = '<script data-measurement data-enabled="false" data-umami-id="388d24a4-9679-4b9c-992d-5ac0427b099c"></script>';
    expect(tagHomePageview(root, 'A')).toContain('data-umami-tag="home-intro-v2:A"');
    expect(tagHomePageview(root, 'A')).toContain('data-enabled="false"');
  });
});
