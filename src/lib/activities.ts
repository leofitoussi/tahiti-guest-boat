import type { TypedObject } from 'astro-portabletext/types';
import { defaultLocale, localizeHref, type Locale } from './localization';
import { isDocumentInLocale } from './sanity-localization';
import type { Activity, ActivityTag } from './cruises';

interface PortableTextMarkDefinition {
  _key?: string;
  _type?: string;
  href?: string;
  [key: string]: unknown;
}

interface PortableTextNodeWithMarks extends TypedObject {
  markDefs?: PortableTextMarkDefinition[];
}

export interface ActivityGroup {
  _key?: string;
  heading?: string;
  description?: TypedObject[];
  tagFilters?: ActivityTag[];
}

export interface VisibleActivityGroup extends ActivityGroup {
  activities: Activity[];
}

export function resolveVisibleActivityGroups(
  groups: ActivityGroup[],
  activities: Activity[],
  locale: Locale = defaultLocale,
): VisibleActivityGroup[] {
  return groups
    .map((group) => {
      const tagFilters = (group.tagFilters ?? []).filter((tag) => isDocumentInLocale(tag, locale));
      const filterIds = tagFilters.map((tag) => tag._id).filter(Boolean);

      if (filterIds.length === 0 || filterIds.length !== (group.tagFilters ?? []).length) {
        return { ...group, activities: [] };
      }

      return {
        ...group,
        activities: activities
          .filter((activity) => activity.isPublished !== false && isDocumentInLocale(activity, locale))
          .filter((activity) => {
            const activityTagIds = new Set(
              (activity.tags ?? [])
                .filter((tag) => isDocumentInLocale(tag, locale))
                .map((tag) => tag._id)
                .filter(Boolean),
            );

            return filterIds.every((tagId) => activityTagIds.has(tagId));
          }),
      };
    })
    .filter((group) => group.activities.length > 0);
}

export function localizeActivityPortableText(
  value: TypedObject[] = [],
  locale: Locale = defaultLocale,
): TypedObject[] {
  return value.map((node) => {
    const portableTextNode = node as PortableTextNodeWithMarks;

    if (!Array.isArray(portableTextNode.markDefs)) {
      return node;
    }

    return {
      ...portableTextNode,
      markDefs: portableTextNode.markDefs.map((mark) =>
        mark._type === 'link' && typeof mark.href === 'string'
          ? { ...mark, href: localizeHref(mark.href, locale) }
          : mark,
      ),
    };
  });
}
