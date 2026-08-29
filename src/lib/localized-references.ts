import { defaultLocale, type Locale } from './localization';
import { isDocumentInLocale, type LocalizedDocumentLike } from './sanity-localization';

export interface LocalizedReferenceDocument extends LocalizedDocumentLike {
  _id?: string;
  translationIds?: string[] | null;
  slug?: string;
  isPublished?: boolean;
  visible?: boolean;
}

export function selectLocalizedReference<T extends LocalizedReferenceDocument>(
  reference: T | null | undefined,
  versions: T[],
  locale: Locale = defaultLocale,
): T | null {
  if (!reference) {
    return null;
  }

  const relatedVersions = versions.filter(
    (version) =>
      version._id === reference._id ||
      Boolean(version._id && reference.translationIds?.includes(version._id)),
  );
  const candidates = [reference, ...relatedVersions.filter((version) => version !== reference)];
  const target = candidates.find((candidate) => isDocumentInLocale(candidate, locale));

  if (!target || target.isPublished === false || target.visible === false) {
    return null;
  }

  return target;
}

export function selectLocalizedReferences<T extends LocalizedReferenceDocument>(
  references: T[] | undefined,
  versions: T[],
  locale: Locale = defaultLocale,
): T[] {
  return (references ?? []).flatMap((reference) => {
    const target = selectLocalizedReference(reference, versions, locale);
    return target ? [target] : [];
  });
}
