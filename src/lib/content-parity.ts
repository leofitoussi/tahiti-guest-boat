export interface ContentParityIssue {
  code:
    | 'portable-text-block-count'
    | 'image-count'
    | 'missing-image-alt'
    | 'placeholder-copy'
    | 'french-link'
    | 'french-reference'
    | 'text-volume';
  path: string;
  message: string;
}

export interface ContentParityOptions {
  minTextRatio?: number;
}

function walk(value: unknown, path: string, visit: (value: unknown, path: string) => void) {
  visit(value, path);

  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, path + '[' + index + ']', visit));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      walk(child, path ? path + '.' + key : key, visit);
    });
  }
}

function portableTextStats(document: unknown) {
  let blocks = 0;
  let images = 0;
  let textLength = 0;

  walk(document, '', (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;

    const node = value as { _type?: string; children?: unknown };
    if (node._type === 'block') {
      blocks += 1;
      if (Array.isArray(node.children)) {
        node.children.forEach((child) => {
          if (child && typeof child === 'object' && 'text' in child) {
            const text = (child as { text?: unknown }).text;
            if (typeof text === 'string') textLength += text.trim().length;
          }
        });
      }
    }

    if (node._type === 'image') images += 1;
  });

  return { blocks, images, textLength };
}

function collectIssues(document: unknown): ContentParityIssue[] {
  const issues: ContentParityIssue[] = [];
  const placeholderPattern = /\b(?:TODO|TBD|placeholder|lorem ipsum|translate this|à traduire)\b/i;
  const frenchPathPattern = /(^|\/)(?:nos-croisieres|notre-bateau|activites|mentions-legales|politique-de-confidentialite|politique-de-cookies)(?:\/|$)/i;
  const frenchReferencePattern = /(?:croisiere|croisière|notre-bateau|nos-croisieres|(?:^|-)fr$)/i;

  walk(document, '', (value, path) => {
    if (typeof value === 'string') {
      if (placeholderPattern.test(value)) {
        issues.push({
          code: 'placeholder-copy',
          path,
          message: 'Placeholder or untranslated editorial copy remains.',
        });
      }

      if (frenchPathPattern.test(value)) {
        issues.push({
          code: 'french-link',
          path,
          message: 'An English document contains a French internal URL.',
        });
      }

      return;
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    const node = value as { _type?: string; alt?: unknown; _ref?: unknown };

    if (node._type === 'image' && (typeof node.alt !== 'string' || !node.alt.trim())) {
      issues.push({
        code: 'missing-image-alt',
        path,
        message: 'Image is missing alternative text.',
      });
    }

    if (node._type === 'reference' && typeof node._ref === 'string' && frenchReferencePattern.test(node._ref)) {
      issues.push({
        code: 'french-reference',
        path,
        message: 'An English document contains a French-looking relation reference.',
      });
    }
  });

  return issues;
}

export function auditLocalizedContent(
  sourceDocument: unknown,
  englishDocument: unknown,
  options: ContentParityOptions = {},
): ContentParityIssue[] {
  const sourceStats = portableTextStats(sourceDocument);
  const englishStats = portableTextStats(englishDocument);
  const issues = collectIssues(englishDocument);
  const minTextRatio = options.minTextRatio ?? 0.5;

  if (englishStats.blocks < sourceStats.blocks) {
    issues.push({
      code: 'portable-text-block-count',
      path: 'body',
      message: 'English content has ' + englishStats.blocks + ' Portable Text blocks; the French source has ' + sourceStats.blocks + '.',
    });
  }

  if (englishStats.images < sourceStats.images) {
    issues.push({
      code: 'image-count',
      path: 'images',
      message: 'English content has ' + englishStats.images + ' images; the French source has ' + sourceStats.images + '.',
    });
  }

  if (sourceStats.textLength > 0 && englishStats.textLength / sourceStats.textLength < minTextRatio) {
    issues.push({
      code: 'text-volume',
      path: 'body',
      message: 'English text volume is below the configured ' + Math.round(minTextRatio * 100) + '% parity threshold.',
    });
  }

  return issues;
}
