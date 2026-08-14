import type { PluginCallbackArgs } from '@sanity/document-internationalization';

interface ActivityTagReference {
  _key?: string;
  _type?: string;
  _ref: string;
  [key: string]: unknown;
}

interface ActivityTagTranslation {
  sourceId?: string;
  translatedId?: string;
}

export const ACTIVITY_TAG_TRANSLATIONS_QUERY = `*[
  _type == "translation.metadata" &&
  references($sourceTagIds)
]{
  "sourceId": translations[language == $sourceLanguage][0].value._ref,
  "translatedId": translations[language == $destinationLanguage][0].value._ref
}`;

function getReferences(value: unknown): ActivityTagReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (reference): reference is ActivityTagReference =>
      Boolean(reference) && typeof reference === 'object' && typeof (reference as ActivityTagReference)._ref === 'string',
  );
}

export async function remapActivityTranslationReferences({
  sourceDocument,
  newDocument,
  sourceLanguageId,
  destinationLanguageId,
  client,
}: PluginCallbackArgs) {
  if (newDocument._type !== 'activity') {
    return;
  }

  const sourceTags = getReferences(sourceDocument.tags);

  if (sourceTags.length === 0) {
    return;
  }

  const translations = await client.fetch<ActivityTagTranslation[]>(ACTIVITY_TAG_TRANSLATIONS_QUERY, {
    sourceTagIds: sourceTags.map((tag) => tag._ref),
    sourceLanguage: sourceLanguageId,
    destinationLanguage: destinationLanguageId,
  });
  const translatedIds = new Map(
    translations
      .filter((translation): translation is Required<ActivityTagTranslation> => Boolean(translation.sourceId && translation.translatedId))
      .map((translation) => [translation.sourceId, translation.translatedId]),
  );
  const missingTagIds = sourceTags.map((tag) => tag._ref).filter((sourceId) => !translatedIds.has(sourceId));

  if (missingTagIds.length > 0) {
    throw new Error(
      `Cannot create the ${destinationLanguageId} activity translation: missing ${destinationLanguageId} versions for activity tags ${missingTagIds.join(', ')}.`,
    );
  }

  const translatedTags = sourceTags.map((tag) => ({
    ...tag,
    _type: 'reference',
    _ref: translatedIds.get(tag._ref) as string,
  }));

  await client.patch(newDocument._id).set({ tags: translatedTags }).commit();
}
