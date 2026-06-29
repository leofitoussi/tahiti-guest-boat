import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { practicalInfoBlock } from '../schemas/practicalInfoBlock';
import { videoFeatureBlock } from '../schemas/videoFeatureBlock';

// ── Cycle 2 — GROQ ──────────────────────────────────────────────────────────

describe('page-builder GROQ — anchorId projection', () => {
  it('projects anchorId for practicalInfoBlock', async () => {
    const source = await readFile('src/lib/page-builder.ts', 'utf8');
    // anchorId must appear inside the practicalInfoBlock projection, not a later block
    expect(source).toMatch(/"practicalInfoBlock" => \{[^}]*anchorId/s);
  });

  it('projects anchorId for videoFeatureBlock', async () => {
    const source = await readFile('src/lib/page-builder.ts', 'utf8');
    expect(source).toMatch(/"videoFeatureBlock" => \{[^}]*anchorId/s);
  });
});

// ── Cycle 3 — composants et PageBuilder ─────────────────────────────────────

describe('PracticalInfoBlock — anchorId wiring', () => {
  it('accepts anchorId prop and passes it to Section as id', async () => {
    const source = await readFile('src/components/blocks/PracticalInfoBlock.astro', 'utf8');
    expect(source).toContain('anchorId');
    expect(source).toMatch(/Section[^>]*id=\{anchorId\}|id=\{anchorId\}[^>]*Section/s);
  });
});

describe('VideoFeature — anchorId wiring', () => {
  it('accepts anchorId prop and passes it to Section as id', async () => {
    const source = await readFile('src/components/blocks/VideoFeature.astro', 'utf8');
    expect(source).toContain('anchorId');
    expect(source).toMatch(/Section[^>]*id=\{anchorId\}|id=\{anchorId\}[^>]*Section/s);
  });
});

describe('PageBuilder — anchorId forwarding', () => {
  it('forwards anchorId to PracticalInfoBlock', async () => {
    const source = await readFile('src/components/blocks/PageBuilder.astro', 'utf8');
    expect(source).toMatch(/PracticalInfoBlock[\s\S]*?anchorId=\{block\.anchorId/);
  });

  it('forwards anchorId to VideoFeature', async () => {
    const source = await readFile('src/components/blocks/PageBuilder.astro', 'utf8');
    expect(source).toMatch(/VideoFeature[\s\S]*?anchorId=\{block\.anchorId/);
  });
});

// ── Cycle 4 — videoFeatureBlock schema ──────────────────────────────────────

describe('videoFeatureBlock — anchorId schema', () => {
  it('exposes an optional anchorId field', () => {
    const fields = Object.fromEntries(videoFeatureBlock.fields.map((f) => [f.name, f]));
    expect(fields.anchorId).toMatchObject({ name: 'anchorId', type: 'string' });
  });

  it('rejects anchorId values with uppercase or spaces', () => {
    const fields = Object.fromEntries(videoFeatureBlock.fields.map((f) => [f.name, f as any]));
    const rule = { custom: (fn: Function) => fn('Invalid Value') };
    const result = (fields.anchorId as any).validation(rule);
    expect(result).not.toBe(true);
  });

  it('accepts a valid kebab-case anchorId', () => {
    const fields = Object.fromEntries(videoFeatureBlock.fields.map((f) => [f.name, f as any]));
    const rule = { custom: (fn: Function) => fn('maeva') };
    const result = (fields.anchorId as any).validation(rule);
    expect(result).toBe(true);
  });
});

// ── Cycle 1 — practicalInfoBlock schema ─────────────────────────────────────

describe('practicalInfoBlock — anchorId schema', () => {
  it('exposes an optional anchorId field', () => {
    const fields = Object.fromEntries(practicalInfoBlock.fields.map((f) => [f.name, f]));
    expect(fields.anchorId).toMatchObject({ name: 'anchorId', type: 'string' });
  });

  it('rejects anchorId values that contain uppercase or spaces', () => {
    const fields = Object.fromEntries(practicalInfoBlock.fields.map((f) => [f.name, f as any]));
    const rule = {
      custom: (fn: Function) => fn('Invalid Value'),
    };
    const result = (fields.anchorId as any).validation(rule);
    expect(result).not.toBe(true);
  });

  it('accepts a valid kebab-case anchorId', () => {
    const fields = Object.fromEntries(practicalInfoBlock.fields.map((f) => [f.name, f as any]));
    const rule = {
      custom: (fn: Function) => fn('informations-pratiques'),
    };
    const result = (fields.anchorId as any).validation(rule);
    expect(result).toBe(true);
  });
});
